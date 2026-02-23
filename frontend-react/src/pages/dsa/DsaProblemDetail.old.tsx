import { useState, useEffect, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import Editor from "@monaco-editor/react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    ResizablePanelGroup,
    ResizablePanel,
    ResizableHandle,
} from "@/components/ui/resizable";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Play, Send, Loader2, Maximize2, Settings, ChevronLeft, RotateCcw, FileCode, Sparkles, X } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { toast } from "sonner";
import { fetchDsaQuestionById } from "@/features/dsa/api/questions";
import type { DsaQuestionDetail } from "@/features/dsa/api/questions";
import { DsaAiHelper } from "@/components/dsa/DsaAiHelper";

const STORAGE_KEY = (id: string) => `dsa_code_${id}`;

type JudgeStatus = "idle" | "running" | "success" | "wrong" | "tle" | "mle" | "error";

interface RunResult {
    input: string;
    yourOutput: string;
    expectedOutput: string;
    runtime?: number;
}

interface SubmitResult {
    status: JudgeStatus;
    passed: number;
    total: number;
    runtime?: number;
    memory?: number;
}

const LANGUAGES = [
    { value: "javascript", label: "Java" }, // Mapped to Java label for visual match
    { value: "typescript", label: "TypeScript" },
    { value: "python", label: "Python 3" },
    { value: "java", label: "Java" },
    { value: "cpp", label: "C++" },
];

export default function DsaProblemDetail() {
    const { id } = useParams<{ id: string }>();
    const { theme } = useTheme();
    const navigate = useNavigate();
    const [problem, setProblem] = useState<DsaQuestionDetail | null>(null);
    const [loading, setLoading] = useState(true);

    const [language, setLanguage] = useState("java"); // Typescript internal, Java visual
    const [code, setCode] = useState("");
    const [runResult, setRunResult] = useState<RunResult | null>(null);
    const [submitResult, setSubmitResult] = useState<SubmitResult | null>(null);
    const [judgeStatus, setJudgeStatus] = useState<JudgeStatus>("idle");
    const [activeTab, setActiveTab] = useState<"testcases" | "terminal">("testcases");
    const [hasModifiedCode, setHasModifiedCode] = useState(false);
    const [showAiHelper, setShowAiHelper] = useState(true); // Toggle for AI Helper panel

    const storageKey = id ? STORAGE_KEY(id) : "";

    // Anti-cheating measures
    useEffect(() => {
        // Prevent right-click context menu
        const preventContextMenu = (e: MouseEvent) => {
            e.preventDefault();
            toast.error("Right-click is disabled during the test");
            return false;
        };

        // Prevent keyboard shortcuts for copy, paste
        const preventKeyboardShortcuts = (e: KeyboardEvent) => {
            // Prevent Ctrl+C, Ctrl+V, Ctrl+X, Ctrl+A
            if (e.ctrlKey || e.metaKey) {
                if (['c', 'v', 'x', 'a'].includes(e.key.toLowerCase())) {
                    e.preventDefault();
                    toast.error("Copy/Paste/Select All is disabled");
                    return false;
                }
            }

            // Prevent F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U (DevTools)
            if (
                e.key === 'F12' ||
                (e.ctrlKey && e.shiftKey && ['i', 'j', 'c'].includes(e.key.toLowerCase())) ||
                (e.ctrlKey && e.key.toLowerCase() === 'u')
            ) {
                e.preventDefault();
                toast.error("Developer tools are disabled");
                return false;
            }
        };

        // Prevent text selection
        const preventSelection = (e: Event) => {
            e.preventDefault();
            return false;
        };

        // Prevent drag and drop
        const preventDragDrop = (e: DragEvent) => {
            e.preventDefault();
            return false;
        };

        // Add event listeners
        document.addEventListener('contextmenu', preventContextMenu);
        document.addEventListener('keydown', preventKeyboardShortcuts, true);
        document.addEventListener('selectstart', preventSelection);
        document.addEventListener('dragstart', preventDragDrop);
        document.addEventListener('drop', preventDragDrop);

        // Disable copy event
        document.addEventListener('copy', (e) => {
            e.preventDefault();
            e.stopPropagation();
            toast.error("Copying is disabled");
        });

        // Disable cut event
        document.addEventListener('cut', (e) => {
            e.preventDefault();
            e.stopPropagation();
            toast.error("Cutting is disabled");
        });

        // Disable paste event
        document.addEventListener('paste', (e) => {
            e.preventDefault();
            e.stopPropagation();
            toast.error("Pasting is disabled");
        });

        // Cleanup
        return () => {
            document.removeEventListener('contextmenu', preventContextMenu);
            document.removeEventListener('keydown', preventKeyboardShortcuts, true);
            document.removeEventListener('selectstart', preventSelection);
            document.removeEventListener('dragstart', preventDragDrop);
            document.removeEventListener('drop', preventDragDrop);
        };
    }, []);

    // Fetch problem from API
    useEffect(() => {
        const loadProblem = async () => {
            if (!id) return;
            try {
                setLoading(true);
                const data = await fetchDsaQuestionById(id);
                setProblem(data.item);
            } catch (err) {
                console.error('Failed to fetch problem:', err);
                toast.error('Failed to load problem');
                navigate('/dsa/problems');
            } finally {
                setLoading(false);
            }
        };

        loadProblem();
    }, [id, navigate]);

    // Default boilerplate for languages (since API doesn't have boilerplate yet)
    const boilerplate = {
        java: `class Solution {
    // Your code here
}`,
        javascript: `/**
 * @param {any} input
 * @return {any}
 */
function solution(input) {
    // Your code here
    return null;
}`,
        typescript: `function solution(input: any): any {
    // Your code here
    return null;
}`,
        python: `def solution(input):
    # Your code here
    return None`,
        cpp: `class Solution {
public:
    // Your code here
};`
    };

    useEffect(() => {
        // Load saved code or use boilerplate
        if (storageKey) {
            const saved = localStorage.getItem(storageKey);
            if (saved) {
                setCode(saved);
            } else {
                setCode(boilerplate[language as keyof typeof boilerplate] || boilerplate.java);
            }
        }
        setHasModifiedCode(false);
    }, [id, language]);

    // Track code changes and mark as attempted if user writes something meaningful
    const handleCodeChange = (value: string | undefined) => {
        const newCode = value ?? "";
        setCode(newCode);

        // Save code to localStorage
        if (storageKey) {
            localStorage.setItem(storageKey, newCode);
        }

        // Check if code has been modified from boilerplate
        const currentBoilerplate = boilerplate[language as keyof typeof boilerplate] || "";
        const isModified = newCode.trim() !== currentBoilerplate.trim() && newCode.trim().length > 0;

        if (isModified && !hasModifiedCode && id) {
            setHasModifiedCode(true);

            // Mark as attempted only if not already solved
            const solvedProblems = JSON.parse(localStorage.getItem('dsa_solved_problems') || '[]');
            if (!solvedProblems.includes(id)) {
                const attemptedProblems = JSON.parse(localStorage.getItem('dsa_attempted_problems') || '[]');
                if (!attemptedProblems.includes(id)) {
                    attemptedProblems.push(id);
                    localStorage.setItem('dsa_attempted_problems', JSON.stringify(attemptedProblems));
                }
            }
        }

        // If user erases everything back to boilerplate or empty, remove from attempted
        if (!isModified && hasModifiedCode && id) {
            setHasModifiedCode(false);
            const attemptedProblems = JSON.parse(localStorage.getItem('dsa_attempted_problems') || '[]');
            const updatedAttempted = attemptedProblems.filter((problemId: string) => problemId !== id);
            localStorage.setItem('dsa_attempted_problems', JSON.stringify(updatedAttempted));
        }
    };

    const handleRun = useCallback(() => {
        setJudgeStatus("running");
        setTimeout(() => {
            setJudgeStatus("idle");
            toast.success("Run completed");
        }, 1000);
    }, []);

    const handleSubmit = useCallback(() => {
        setJudgeStatus("running");
        setTimeout(() => {
            setJudgeStatus("success");

            // Mark problem as solved in localStorage
            if (id) {
                const solvedProblems = JSON.parse(localStorage.getItem('dsa_solved_problems') || '[]');
                if (!solvedProblems.includes(id)) {
                    solvedProblems.push(id);
                    localStorage.setItem('dsa_solved_problems', JSON.stringify(solvedProblems));
                }

                // Remove from attempted problems since it's now solved
                const attemptedProblems = JSON.parse(localStorage.getItem('dsa_attempted_problems') || '[]');
                const updatedAttempted = attemptedProblems.filter((problemId: string) => problemId !== id);
                localStorage.setItem('dsa_attempted_problems', JSON.stringify(updatedAttempted));
            }

            // Show success message
            toast.success("✓ Submission successful! Problem marked as solved.", {
                duration: 2000,
            });

            // Navigate back to problems list after a short delay
            setTimeout(() => {
                navigate('/dsa/problems');
            }, 1500);
        }, 1500);
    }, [id, navigate]);

    if (loading) {
        return (
            <div className="h-screen w-full flex items-center justify-center bg-transparent">
                <div className="text-center space-y-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto"></div>
                    <p className="text-slate-300">Loading problem...</p>
                </div>
            </div>
        );
    }

    if (!problem) return <div className="p-10 text-center text-white">Problem not found</div>;

    return (
        <div 
            className="h-screen w-full flex flex-col bg-transparent overflow-hidden font-sans text-slate-300"
            style={{ 
                userSelect: 'none', 
                WebkitUserSelect: 'none',
                MozUserSelect: 'none',
                msUserSelect: 'none'
            }}
            onCopy={(e) => e.preventDefault()}
            onCut={(e) => e.preventDefault()}
            onPaste={(e) => e.preventDefault()}
            onDragStart={(e) => e.preventDefault()}
        >

            {/* Top Navigation Bar Overlay */}
            <div className="shrink-0 h-10 flex items-center px-4 bg-transparent z-50">
                <Link to="/dsa/problems" className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300 transition-colors text-sm font-medium">
                    <ChevronLeft className="h-4 w-4" />
                    Back to Home
                </Link>
            </div>

            <ResizablePanelGroup direction="horizontal" className="flex-1 p-2 gap-2">

                {/* PANEL 1: PROBLEM DESCRIPTION */}
                <ResizablePanel defaultSize={30} minSize={20} className="rounded-2xl overflow-hidden glass-panel border border-white/10 bg-black/40 backdrop-blur-xl flex flex-col">
                    <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">

                        {/* Title Section */}
                        <div className="mb-6">
                            <h1 className="text-xl font-bold text-white mb-3 leading-tight">{problem.title}</h1>
                            <div className="flex flex-wrap gap-2">
                                {problem.tags.map((tag, idx) => (
                                    <Badge key={idx} variant="secondary" className="bg-white/10 hover:bg-white/20 text-slate-300 border-none font-normal">{tag}</Badge>
                                ))}
                                <Badge className={
                                    problem.difficulty === "Easy"
                                        ? "bg-green-500/20 text-green-400 hover:bg-green-500/30 border-green-500/50"
                                        : problem.difficulty === "Medium"
                                            ? "bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30 border-yellow-500/50"
                                            : "bg-orange-500/20 text-orange-400 hover:bg-orange-500/30 border-orange-500/50"
                                }>{problem.difficulty}</Badge>
                            </div>
                        </div>

                        {/* Description Text */}
                        <div className="prose prose-sm prose-invert max-w-none text-slate-300 space-y-4">
                            <p className="whitespace-pre-line">{problem.description}</p>

                            {/* Examples */}
                            <div className="mt-6 space-y-4">
                                {problem.examples.map((example, idx) => (
                                    <div key={idx}>
                                        <h3 className="text-white font-semibold text-base">Example {idx + 1}:</h3>
                                        <div className="bg-black/30 rounded-xl p-4 border border-white/5 font-mono text-sm">
                                            <div className="mb-2"><span className="text-slate-400">Input:</span> {example.input}</div>
                                            <div className="mb-2"><span className="text-slate-400">Output:</span> {example.output}</div>
                                            {example.explanation && (
                                                <div>
                                                    <span className="text-slate-400">Explanation:</span> {example.explanation}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Constraints */}
                            {problem.constraints && problem.constraints.length > 0 && (
                                <div className="mt-6">
                                    <h3 className="text-white font-semibold text-base mb-2">Constraints:</h3>
                                    <ul className="list-disc pl-5 space-y-1 text-slate-300">
                                        {problem.constraints.map((constraint, idx) => (
                                            <li key={idx}>{constraint}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>

                        {/* Interaction footer mock */}
                        <div className="mt-8 flex items-center gap-6 text-slate-500 text-sm border-t border-white/10 pt-4">
                            <div className="flex items-center gap-2 hover:text-white cursor-pointer transition-colors"><div className="w-2 h-2 rounded-full bg-green-500"></div> 142 Solutions</div>
                            <div className="flex items-center gap-2 hover:text-white cursor-pointer transition-colors">❤️ 10 Editorial</div>
                            <div className="flex items-center gap-2 hover:text-white cursor-pointer transition-colors">💬 156 Comments</div>
                        </div>

                    </div>
                </ResizablePanel>

                <ResizableHandle className="bg-transparent w-2" />

                {/* PANEL 2: CODE EDITOR & TERMINAL */}
                <ResizablePanel defaultSize={45} minSize={30}>
                    <ResizablePanelGroup direction="vertical">
                        {/* Code Editor Part */}
                        <ResizablePanel defaultSize={70} minSize={20} className="rounded-2xl overflow-hidden glass-panel border border-white/10 bg-black/40 backdrop-blur-xl flex flex-col mb-2">
                            {/* Editor Toolbar */}
                            <div className="h-12 border-b border-white/10 flex items-center justify-between px-4 bg-white/5">
                                <div className="flex items-center gap-2 text-cyan-400">
                                    <FileCode className="h-4 w-4 text-green-400" />
                                    <span className="font-semibold text-sm">Code</span>
                                </div>

                                <div className="flex items-center gap-2">
                                    <Select value={language} onValueChange={setLanguage}>
                                        <SelectTrigger className="h-8 w-[100px] border-white/10 bg-black/20 text-xs focus:ring-0 focus:ring-offset-0">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="bg-[#1e1e1e] border-white/10 text-slate-300">
                                            {LANGUAGES.map(l => <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>)}
                                        </SelectContent>
                                    </Select>

                                    <Button
                                        size="sm"
                                        className="h-8 bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30 border border-cyan-500/50"
                                        onClick={handleRun}
                                    >
                                        {judgeStatus === 'running' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4 mr-1 fill-current" />}
                                        Run
                                    </Button>
                                    <Button
                                        size="sm"
                                        className="h-8 bg-purple-600 hover:bg-purple-500 text-white shadow-[0_0_10px_rgba(147,51,234,0.5)] border-none"
                                        onClick={handleSubmit}
                                    >
                                        {judgeStatus === 'running' ? <Loader2 className="h-4 w-4 animate-spin" /> : "Submit"}
                                    </Button>
                                    <Button 
                                        size="icon" 
                                        variant="ghost" 
                                        className="h-8 w-8 text-slate-400 hover:text-white"
                                        onClick={() => setShowAiHelper(!showAiHelper)}
                                        title={showAiHelper ? "Hide AI Helper" : "Show AI Helper"}
                                    >
                                        {showAiHelper ? <X className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
                                    </Button>
                                    <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-400 hover:text-white"><RotateCcw className="h-4 w-4" /></Button>
                                    <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-400 hover:text-white"><Settings className="h-4 w-4" /></Button>
                                </div>
                            </div>

                            {/* Monaco Editor */}
                            <div className="flex-1 relative">
                                <Editor
                                    height="100%"
                                    language={language === "cpp" ? "cpp" : language === "java" ? "java" : language}
                                    value={code}
                                    onChange={handleCodeChange}
                                    theme="vs-dark"
                                    options={{
                                        minimap: { enabled: false },
                                        fontSize: 14,
                                        padding: { top: 16 },
                                        fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                                        scrollBeyondLastLine: false,
                                    }}
                                    className="bg-transparent"
                                />
                            </div>
                        </ResizablePanel>

                        <ResizableHandle className="bg-transparent h-2" />

                        {/* Terminal / Testcases Part */}
                        <ResizablePanel defaultSize={30} minSize={10} className="rounded-2xl overflow-hidden glass-panel border border-white/10 bg-black/40 backdrop-blur-xl flex flex-col mt-2">
                            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="h-full flex flex-col">
                                <div className="flex items-center px-4 border-b border-white/10 bg-white/5 h-10">
                                    <TabsList className="bg-transparent p-0 h-auto gap-4">
                                        <TabsTrigger value="testcases" className="data-[state=active]:bg-transparent data-[state=active]:text-white data-[state=active]:border-b-2 data-[state=active]:border-cyan-400 rounded-none px-0 py-2 h-full text-slate-500 text-xs uppercase tracking-wide">Testcases</TabsTrigger>
                                        <TabsTrigger value="terminal" className="data-[state=active]:bg-transparent data-[state=active]:text-white data-[state=active]:border-b-2 data-[state=active]:border-cyan-400 rounded-none px-0 py-2 h-full text-slate-500 text-xs uppercase tracking-wide">Terminal</TabsTrigger>
                                    </TabsList>
                                    <div className="ml-auto text-xs text-slate-500">Testcases 21</div>
                                </div>

                                <TabsContent value="testcases" className="flex-1 p-0 m-0 overflow-hidden flex flex-col">
                                    {/* Test case rows similar to image */}
                                    <div className="flex-1 overflow-auto">
                                        <div className="grid grid-cols-[100px_1fr_50px_100px] gap-2 p-3 text-sm border-b border-white/5 text-slate-400 font-medium">
                                            <div>Input</div>
                                            <div>Expected</div>
                                            <div>%</div>
                                            <div className="text-right">Output</div>
                                        </div>

                                        <div className="p-0">
                                            {/* Mock Data Row 1 */}
                                            <div className="grid grid-cols-[100px_1fr_50px_100px] gap-2 p-3 text-sm hover:bg-white/5 cursor-pointer items-center border-b border-white/5">
                                                <div className="text-slate-300 font-mono text-xs truncate">[1,2,3,12], k=2</div>
                                                <div className="text-slate-500">-</div>
                                                <div><div className="w-4 h-4 rounded-full bg-green-500/20 text-green-500 flex items-center justify-center text-[10px]">✓</div></div>
                                                <div className="text-right text-slate-500">-</div>
                                            </div>

                                            {/* Mock Data Row 2 */}
                                            <div className="grid grid-cols-[100px_1fr_50px_100px] gap-2 p-3 text-sm hover:bg-white/5 cursor-pointer items-center border-b border-white/5">
                                                <div className="text-slate-300 font-mono text-xs truncate">[5,4,3,2,8], k=3</div>
                                                <div className="text-slate-500">-</div>
                                                <div><div className="w-4 h-4 rounded-full bg-green-500/20 text-green-500 flex items-center justify-center text-[10px]">✓</div></div>
                                                <div className="text-right text-slate-500">-</div>
                                            </div>

                                            {/* Mock Data Row 3 */}
                                            <div className="grid grid-cols-[100px_1fr_50px_100px] gap-2 p-3 text-sm hover:bg-white/5 cursor-pointer items-center">
                                                <div className="text-slate-300 font-mono text-xs truncate">[5,3], 6</div>
                                                <div className="text-slate-500">-</div>
                                                <div><div className="w-4 h-4 rounded-full bg-green-500/20 text-green-500 flex items-center justify-center text-[10px]">✓</div></div>
                                                <div className="text-right text-slate-500">-</div>
                                            </div>
                                        </div>
                                    </div>
                                </TabsContent>

                                <TabsContent value="terminal" className="flex-1 p-4 m-0 font-mono text-sm text-slate-400">
                                    <div className="opacity-50">No output yet. Run code to see results.</div>
                                </TabsContent>
                            </Tabs>
                        </ResizablePanel>
                    </ResizablePanelGroup>
                </ResizablePanel>

                {showAiHelper && (
                    <>
                        <ResizableHandle className="bg-transparent w-2" />

                        {/* PANEL 3: AI HELPER */}
                        <ResizablePanel defaultSize={25} minSize={20} className="rounded-2xl overflow-hidden">
                            <DsaAiHelper />
                        </ResizablePanel>
                    </>
                )}

            </ResizablePanelGroup>

            {/* Footer Status Bar Mock */}
            <div className="h-8 bg-black/40 border-t border-white/10 flex items-center px-4 justify-between text-xs text-slate-500">
                <div className="flex gap-4">
                    <span className="text-green-400">Testcases passed: 3 / 9</span>
                    <span className="text-slate-400">Runtime: 14 ms</span>
                    <span className="text-slate-400">Memory: 39.64 MB</span>
                </div>
                <div className="text-green-500">Success: Great job, you passed all test cases.</div>
            </div>

        </div>
    );
}

