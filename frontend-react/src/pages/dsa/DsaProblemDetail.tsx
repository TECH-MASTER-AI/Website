import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Editor from "@monaco-editor/react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import {
    BarChart,
    Bar,
    XAxis,
} from "recharts";
import {
    Play,
    RotateCcw,
    Bot,
    Loader2,
    Wand2,
    Timer,
    LayoutGrid,
    Maximize,
    AlertCircle,
    CheckCircle2,
    FileText,
    History,
    TrendingUp,
    Cpu,
    HardDrive,
    Activity,
    MessageSquare,
    Pause,
    StopCircle,
    Clock,
} from "lucide-react";
import { toast } from "sonner";
import { getApiUrl } from "@/lib/api";
import { recordActivity } from "@/features/dsa/streak/dsaActivityStore";
import { addSolvedProblem, syncSolvedToBackend } from "@/features/dsa/profile/dsaProfileStore";
import { fetchDsaQuestionById, DsaApiError } from "@/features/dsa/api/questions";
import type { DsaQuestionDetail } from "@/features/dsa/api/questions";
import { executeCode } from "@/services/codeExecutionService";
import { DsaAiHelper } from "@/components/dsa/DsaAiHelper";
import { DraggableAiPopup } from "@/components/dsa/DraggableAiPopup";
import { ProblemEngagementBar } from "@/components/dsa/ProblemEngagementBar";
import { ProblemFeedback } from "@/components/dsa/ProblemFeedback";
import { FeedbackModal } from "@/components/dsa/FeedbackModal";
import { analyzeComplexity, getComplexityBadgeClass } from "@/utils/codeComplexity";
import { useTimerStopwatch } from "@/hooks/useTimerStopwatch";
import { getTestCasesByProblemId } from "@/data/dsaTestCases";
import { getDsaProblemById } from "@/data/dsaProblems";

const STORAGE_KEY = (id: string) => `dsa_code_${id}`;

/** Derive LeetCode-style entry point from problem slug and first test input. */
function getEntryPoint(problemId: string | undefined, testCases: Array<{ input: any; expected: any }>): { functionName: string; paramOrder: string[] } | null {
    if (!problemId || !testCases.length) return null;
    const firstInput = testCases[0]?.input;
    const paramOrder = firstInput && typeof firstInput === 'object' && !Array.isArray(firstInput)
        ? Object.keys(firstInput)
        : [];
    const functionName = problemId
        .split('-')
        .map((part, i) => (i === 0 ? part : part.charAt(0).toUpperCase() + part.slice(1)))
        .join('');
    return { functionName, paramOrder };
}

type JudgeStatus = "idle" | "running" | "success" | "wrong" | "tle" | "mle" | "error" | "compilation_error" | "runtime_error";
type LayoutMode = "layout-a" | "layout-b" | "default" | "wide-code" | "code-only" | "split-vertical";

interface TestCase {
    id: number;
    input: string;
    expectedOutput: string;
    userOutput: string;
    passed: boolean;
    executionTime?: number;
    error?: string;
}

interface ExecutionMetrics {
    runtime: number;
    memory: number;
    runtimePercentile: number;
    memoryPercentile: number;
    timestamp: Date;
}

interface SubmissionData {
    status: JudgeStatus;
    totalTestCases: number;
    passedTestCases: number;
    metrics: ExecutionMetrics;
    testCases: TestCase[];
    timestamp: Date;
}

const LANGUAGES = [
    { value: "java", label: "Java" },
    { value: "python", label: "Python 3" },
    { value: "c", label: "C" },
    { value: "cpp", label: "C++" },
];

export default function DsaProblemDetailNew() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [problem, setProblem] = useState<DsaQuestionDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [language, setLanguage] = useState("java");
    const [code, setCode] = useState("");
    const [judgeStatus, setJudgeStatus] = useState<JudgeStatus>("idle");
    const [activeCase, setActiveCase] = useState(0);
    const [showAiHelper, setShowAiHelper] = useState(true);
    
    // Timer/Stopwatch hook
    const timer = useTimerStopwatch();

    // Toolbar states
    const [showTimerModal, setShowTimerModal] = useState(false);
    const [showResetModal, setShowResetModal] = useState(false);
    const [showLayoutMenu, setShowLayoutMenu] = useState(false);
    const [layoutMode, setLayoutMode] = useState<LayoutMode>("layout-a");
    const [focusMode, setFocusMode] = useState(false);
    const [editorRef, setEditorRef] = useState<any>(null);
    const [showFeedbackModal, setShowFeedbackModal] = useState(false);
    const [focusSidebarOpen, setFocusSidebarOpen] = useState(false);
    
    // Favorites state with localStorage persistence
    const [favorites, setFavorites] = useState<Set<string>>(() => {
        const saved = localStorage.getItem('dsa_favorites');
        return saved ? new Set(JSON.parse(saved)) : new Set();
    });
    
    // Results tab state
    const [activeResultsTab, setActiveResultsTab] = useState<'output' | 'results'>('output');
    
    // Comment count state (real-time)
    const [commentCount, setCommentCount] = useState(0);
    
    // Test cases and metrics state
    const [testCases, setTestCases] = useState<TestCase[]>([]);
    const [runMetrics, setRunMetrics] = useState<ExecutionMetrics | null>(null);
    const [submissionData, setSubmissionData] = useState<SubmissionData | null>(null);
    const [hasSubmitted, setHasSubmitted] = useState(false);
    
    // Resizable panel state
    const [bottomPanelHeight, setBottomPanelHeight] = useState(280);
    const [isResizing, setIsResizing] = useState(false);
    const [isResizingHorizontal, setIsResizingHorizontal] = useState(false);
    const [isResizingAiPanel, setIsResizingAiPanel] = useState(false);
    const resizeStartRef = useRef<{ startY: number; startHeight: number } | null>(null);
    const resizeHorizontalStartRef = useRef<{ startX: number; startWidth: number } | null>(null);
    const resizeAiPanelStartRef = useRef<{ startX: number; startWidth: number } | null>(null);
    const [problemPanelWidth, setProblemPanelWidth] = useState(30); // percentage
    const [aiPanelWidth, setAiPanelWidth] = useState(25); // percentage
    const MIN_HEIGHT = 200; // Increased minimum height
    const MAX_HEIGHT = 600;
    const MIN_WIDTH = 20; // percentage
    const MAX_WIDTH = 45; // percentage
    const AI_MIN_WIDTH = 15; // percentage
    const AI_MAX_WIDTH = 35; // percentage
    
    const handleSubmit = useCallback(async () => {
        if (!id || !problem) return;
        
        setJudgeStatus("running");
        setHasSubmitted(false);
        
        try {
            // Get ALL test cases: from API or fallback to local tough test cases
            const apiCases = problem.testCases || [];
            const problemTestCases =
                apiCases.length > 0
                    ? apiCases.map((tc: any) => ({
                          input: tc.input,
                          expected: tc.output ?? tc.expected,
                      }))
                    : getTestCasesByProblemId(id!).map((tc) => ({
                          input: tc.input,
                          expected: tc.expected,
                      }));

            if (problemTestCases.length === 0) {
                toast.error('No test cases available for this problem');
                setJudgeStatus('idle');
                return;
            }
            
            const entryPoint = getEntryPoint(id, problemTestCases);
            const result = await executeCode(code, language, problemTestCases, true, entryPoint);
            
            // Process results
            const formattedResults = result.results.map((tc: any, idx: number) => ({
                id: idx + 1,
                input: typeof tc.input === 'object' ? JSON.stringify(tc.input) : tc.input,
                expectedOutput: typeof tc.expected === 'object' ? JSON.stringify(tc.expected) : tc.expected,
                userOutput: typeof tc.actual === 'object' ? JSON.stringify(tc.actual) : tc.actual,
                passed: tc.passed,
                executionTime: tc.executionTime,
                error: tc.error,
            }));
            
            setTestCases(formattedResults);
            
            if (result.overallStatus === 'success') {
                setJudgeStatus('success');
                setHasSubmitted(true);
                setRunMetrics({
                    runtime: result.totalExecutionTime,
                    memory: result.averageMemory,
                    runtimePercentile: 85,
                    memoryPercentile: 70,
                    timestamp: new Date(),
                });
                setSubmissionData({
                    status: 'success',
                    totalTestCases: problemTestCases.length,
                    passedTestCases: result.results.filter((r: any) => r.passed).length,
                    metrics: {
                        runtime: result.totalExecutionTime,
                        memory: result.averageMemory,
                        runtimePercentile: 85,
                        memoryPercentile: 70,
                        timestamp: new Date(),
                    },
                    testCases: formattedResults,
                    timestamp: new Date(),
                });
                recordActivity();
                if (id) {
                    addSolvedProblem(id);
                    syncSolvedToBackend(id, {
                        language: language === "python" ? "python" : language === "java" ? "java" : language === "cpp" ? "cpp" : "javascript",
                        runtime_ms: result.totalExecutionTime ?? undefined,
                        memory_mb: result.averageMemory ?? undefined,
                    }).catch(() => {});
                }
                toast.success('✓ Submission successful! All test cases passed.');
            } else if (result.overallStatus === 'compilation_error') {
                setJudgeStatus('error');
                setHasSubmitted(true);
                setTestCases([{
                    id: 1,
                    input: 'All test cases',
                    expectedOutput: 'N/A',
                    userOutput: '',
                    passed: false,
                    error: result.complexity.analysis || 'Compilation Error',
                }]);
                setSubmissionData({
                    status: 'error',
                    totalTestCases: testCases.length,
                    passedTestCases: 0,
                    metrics: {
                        runtime: 0,
                        memory: 0,
                        runtimePercentile: 0,
                        memoryPercentile: 0,
                        timestamp: new Date(),
                    },
                    testCases: [],
                    timestamp: new Date(),
                });
                setHasSubmitted(true);
                toast.error('Compilation Error', {
                    description: result.complexity.analysis || 'Failed to compile code',
                });
            } else {
                setJudgeStatus('wrong');
                setHasSubmitted(true);
                setRunMetrics({
                    runtime: result.totalExecutionTime,
                    memory: result.averageMemory,
                    runtimePercentile: 60,
                    memoryPercentile: 65,
                    timestamp: new Date(),
                });
                setSubmissionData({
                    status: 'wrong',
                    totalTestCases: problemTestCases.length,
                    passedTestCases: result.results.filter((r: any) => r.passed).length,
                    metrics: {
                        runtime: result.totalExecutionTime,
                        memory: result.averageMemory,
                        runtimePercentile: 60,
                        memoryPercentile: 65,
                        timestamp: new Date(),
                    },
                    testCases: formattedResults,
                    timestamp: new Date(),
                });
                toast.error('Wrong Answer', {
                    description: `${result.results.filter((r: any) => r.passed).length}/${problemTestCases.length} test cases passed`,
                });
            }
        } catch (error) {
            setJudgeStatus('error');
            toast.error('Execution failed', {
                description: 'Failed to connect to execution server. Make sure backend is running on port 3001.',
            });
        }
    }, [id, code, language, problem]);
    
    const isFavorited = id ? favorites.has(id) : false;
    
    const toggleFavorite = () => {
        if (!id) return;
        const newFavorites = new Set(favorites);
        if (newFavorites.has(id)) {
            newFavorites.delete(id);
            toast.info("Removed from favorites");
        } else {
            newFavorites.add(id);
            toast.success("Added to favorites!");
        }
        setFavorites(newFavorites);
        localStorage.setItem('dsa_favorites', JSON.stringify(Array.from(newFavorites)));
    };

    const storageKey = id ? STORAGE_KEY(id) : "";

    const boilerplate = {
        java: `// Java Solution Template
import java.util.*;

class Solution {
    public static void main(String[] args) {
        // Your code here
    }

    // Write your solution method here
    public static int solve(int[] nums, int target) {
        // Your code here
        return -1;
    }
}`,
        python: `# Python Solution Template
def solution(input_data):
    """
    Write your solution here
    """
    # Your code here
    return None

if __name__ == "__main__":
    # Test your solution
    result = solution("test input")
    print(result)`,
        c: `// C Solution Template
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

// Your code here

int main() {
    // Your code here
    return 0;
}`,
        cpp: `// C++ Solution Template
#include <bits/stdc++.h>
using namespace std;

class Solution {
public:
    // Write your solution here
    int solve(vector<int>& nums, int target) {
        // Your code here
        return -1;
    }
};

int main() {
    Solution s;
    // Your code here
    return 0;
}`
    };

    const [loadError, setLoadError] = useState<string | null>(null);

    const loadProblem = useCallback(async () => {
        if (!id) return;
        setLoadError(null);
        try {
            setLoading(true);
            try {
                const data = await fetchDsaQuestionById(id);
                setProblem(data.item);
            } catch (apiErr) {
                const fallback = getDsaProblemById(id);
                if (fallback) {
                    const testCases = getTestCasesByProblemId(id);
                    setProblem({
                        id: fallback.id,
                        title: fallback.title,
                        difficulty: fallback.difficulty,
                        acceptance: fallback.acceptance,
                        tags: fallback.tags,
                        description: fallback.description,
                        examples: fallback.examples,
                        constraints: fallback.constraints,
                        testCases: testCases.map((tc) => ({ input: tc.input, expected: tc.expected })),
                        isPremium: false,
                        likes: 0,
                        dislikes: 0,
                    });
                } else {
                    throw apiErr;
                }
            }
        } catch (err) {
            const message =
                err instanceof DsaApiError
                    ? err.message
                    : err instanceof Error
                        ? err.message
                        : "Failed to load problem";
            setLoadError(message);
            console.error("Failed to fetch problem:", err);
            toast.error(message);
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        loadProblem();
    }, [loadProblem]);

    // Comment count from API
    useEffect(() => {
        if (!id) return;
        const fetchCommentCount = async () => {
            try {
                const res = await fetch(getApiUrl(`/api/comments/count?problem_slug=${encodeURIComponent(id)}`));
                if (res.ok) {
                    const data = await res.json();
                    setCommentCount(data.count ?? 0);
                }
            } catch {
                // ignore
            }
        };
        fetchCommentCount();
        const t = setInterval(fetchCommentCount, 20000);
        return () => clearInterval(t);
    }, [id]);

    const handleLanguageChange = useCallback((newLanguage: string) => {
        // Save current code before switching
        if (storageKey) {
            localStorage.setItem(storageKey, code);
        }
        
        // Set new language
        setLanguage(newLanguage);
        
        // Load appropriate boilerplate for new language
        const newBoilerplate = boilerplate[newLanguage as keyof typeof boilerplate] || boilerplate.java;
        setCode(newBoilerplate);
        
        if (storageKey) {
            localStorage.setItem(storageKey, newBoilerplate);
        }
        
        toast.info(`Switched to ${LANGUAGES.find(l => l.value === newLanguage)?.label || newLanguage}`);
    }, [code, storageKey]);

    // Load saved code on initial load or language change
    useEffect(() => {
        if (storageKey) {
            const saved = localStorage.getItem(storageKey);
            if (saved) {
                setCode(saved);
            } else {
                setCode(boilerplate[language as keyof typeof boilerplate] || boilerplate.java);
            }
        }
    }, [id]);

    // Timer is managed by useTimerStopwatch hook

    // Focus mode ESC key handler
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && focusMode) {
                setFocusMode(false);
            }
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [focusMode]);

    // Click away listener for layout menu
    useEffect(() => {
        const handleClickAway = (e: MouseEvent) => {
            if (showLayoutMenu) {
                const target = e.target as HTMLElement;
                if (!target.closest('.layout-menu-container')) {
                    setShowLayoutMenu(false);
                }
            }
        };
        document.addEventListener('mousedown', handleClickAway);
        return () => document.removeEventListener('mousedown', handleClickAway);
    }, [showLayoutMenu]);

    // Anti-cheating measures
    useEffect(() => {
        // Anti-cheating measures (Ctrl+V/paste is allowed)
        const handleKeyDown = (e: KeyboardEvent) => {
            // Allow ESC for focus mode
            if (e.key === 'Escape') return;
            
            // Block Ctrl+C, Ctrl+X, Ctrl+A (but allow Ctrl+V for paste)
            if (e.ctrlKey || e.metaKey) {
                if (['c', 'x', 'a'].includes(e.key.toLowerCase())) {
                    e.preventDefault();
                    toast.error("Copy/Cut operations are disabled");
                    return false;
                }
            }
            
            // Block F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C, Ctrl+U (dev tools)
            if (
                e.key === 'F12' ||
                (e.ctrlKey && e.shiftKey && ['i', 'j', 'c'].includes(e.key.toLowerCase())) ||
                (e.ctrlKey && e.key.toLowerCase() === 'u')
            ) {
                e.preventDefault();
                return false;
            }
        };

        // Prevent right-click context menu
        const handleContextMenu = (e: MouseEvent) => {
            e.preventDefault();
            return false;
        };

        // Prevent text selection
        const handleSelectStart = (e: Event) => {
            const target = e.target as HTMLElement;
            // Allow selection in Monaco editor
            if (target.closest('.monaco-editor')) {
                return true;
            }
            e.preventDefault();
            return false;
        };

        // Prevent copy event
        const handleCopy = (e: ClipboardEvent) => {
            const target = e.target as HTMLElement;
            // Allow copy in Monaco editor
            if (target.closest('.monaco-editor')) {
                return true;
            }
            e.preventDefault();
            toast.error("Copy operation is disabled");
            return false;
        };

        // Allow paste everywhere (removed restriction)
        const handlePaste = (e: ClipboardEvent) => {
            // Paste is now allowed
            return true;
        };

        // Prevent cut event
        const handleCut = (e: ClipboardEvent) => {
            const target = e.target as HTMLElement;
            // Allow cut in Monaco editor
            if (target.closest('.monaco-editor')) {
                return true;
            }
            e.preventDefault();
            return false;
        };

        // Prevent drag
        const handleDragStart = (e: DragEvent) => {
            e.preventDefault();
            return false;
        };

        document.addEventListener('keydown', handleKeyDown);
        document.addEventListener('contextmenu', handleContextMenu);
        document.addEventListener('selectstart', handleSelectStart);
        document.addEventListener('copy', handleCopy);
        document.addEventListener('paste', handlePaste);
        document.addEventListener('cut', handleCut);
        document.addEventListener('dragstart', handleDragStart);

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.removeEventListener('contextmenu', handleContextMenu);
            document.removeEventListener('selectstart', handleSelectStart);
            document.removeEventListener('copy', handleCopy);
            document.removeEventListener('paste', handlePaste);
            document.removeEventListener('cut', handleCut);
            document.removeEventListener('dragstart', handleDragStart);
        };
    }, []);

    // Toolbar button handlers
    const handleFormatCode = () => {
        if (editorRef) {
            editorRef.getAction('editor.action.formatDocument')?.run();
            toast.success("Code formatted");
        }
    };

    const handleStartTimer = (minutes: number) => {
        timer.startTimer(minutes, () => {
            toast.error("Time's up!", {
                description: "You can continue coding or submit your solution.",
                duration: 5000,
            });
        });
        setShowTimerModal(false);
        toast.success(`Timer started: ${minutes} minutes`);
    };

    const handleStartStopwatch = () => {
        timer.startStopwatch();
        setShowTimerModal(false);
        toast.success("Stopwatch started");
    };

    const handleStopTimer = () => {
        timer.stop();
        toast.info("Timer stopped");
    };

    const handleResetCode = () => {
        setCode(boilerplate[language as keyof typeof boilerplate] || boilerplate.java);
        if (storageKey) {
            localStorage.setItem(storageKey, boilerplate[language as keyof typeof boilerplate] || boilerplate.java);
        }
        setShowResetModal(false);
        toast.success("Code reset to boilerplate");
    };

    const handleLayoutChange = (mode: LayoutMode) => {
        setLayoutMode(mode);
        setShowLayoutMenu(false);
        if (mode === 'layout-b') {
            setShowAiHelper(true);
        }
        const label = mode === 'layout-a' || mode === 'default' ? 'Competitive Mode' : mode === 'layout-b' ? 'Advanced + AI Assist' : mode;
        toast.success(`Layout: ${label}`);
    };

    const timerActive = timer.isActive;

    const handleToggleFocusMode = () => {
        setFocusMode(!focusMode);
        setFocusSidebarOpen(false);
        toast.info(focusMode ? "Focus mode disabled" : "Focus mode enabled (ESC to exit)");
    };

    const handleCodeChange = (value: string | undefined) => {
        const newCode = value ?? "";
        setCode(newCode);
        if (storageKey) {
            localStorage.setItem(storageKey, newCode);
        }
    };
    
    // Resize handlers for bottom panel
    const handleResizeStart = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        setIsResizing(true);
        resizeStartRef.current = {
            startY: e.clientY,
            startHeight: bottomPanelHeight,
        };
        document.body.style.cursor = 'row-resize';
        document.body.style.userSelect = 'none';
    }, [bottomPanelHeight]);
    
    const handleResizeMove = useCallback((e: MouseEvent) => {
        if (!resizeStartRef.current) return;
        
        const deltaY = resizeStartRef.current.startY - e.clientY;
        const newHeight = resizeStartRef.current.startHeight + deltaY;
        
        // Clamp the height between MIN_HEIGHT and MAX_HEIGHT
        const clampedHeight = Math.max(MIN_HEIGHT, Math.min(MAX_HEIGHT, newHeight));
        setBottomPanelHeight(clampedHeight);
    }, []);
    
    const handleResizeEnd = useCallback(() => {
        setIsResizing(false);
        resizeStartRef.current = null;
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
    }, []);
    
    useEffect(() => {
        if (isResizing) {
            window.addEventListener('mousemove', handleResizeMove);
            window.addEventListener('mouseup', handleResizeEnd);
        }
        return () => {
            window.removeEventListener('mousemove', handleResizeMove);
            window.removeEventListener('mouseup', handleResizeEnd);
        };
    }, [isResizing, handleResizeMove, handleResizeEnd]);

    // Horizontal resize handlers for problem panel
    const handleHorizontalResizeStart = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        setIsResizingHorizontal(true);
        const containerWidth = e.currentTarget.parentElement?.offsetWidth || 1000;
        resizeHorizontalStartRef.current = {
            startX: e.clientX,
            startWidth: (problemPanelWidth / 100) * containerWidth,
        };
        document.body.style.cursor = 'col-resize';
        document.body.style.userSelect = 'none';
    }, [problemPanelWidth]);
    
    const handleHorizontalResizeMove = useCallback((e: MouseEvent) => {
        if (!resizeHorizontalStartRef.current) return;
        
        const containerWidth = document.querySelector('.main-layout-container')?.clientWidth || 1000;
        const deltaX = e.clientX - resizeHorizontalStartRef.current.startX;
        const newWidth = resizeHorizontalStartRef.current.startWidth + deltaX;
        const newWidthPercent = (newWidth / containerWidth) * 100;
        
        if (newWidthPercent >= MIN_WIDTH && newWidthPercent <= MAX_WIDTH) {
            setProblemPanelWidth(newWidthPercent);
        }
    }, []);
    
    const handleHorizontalResizeEnd = useCallback(() => {
        setIsResizingHorizontal(false);
        resizeHorizontalStartRef.current = null;
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
    }, []);
    
    useEffect(() => {
        if (isResizingHorizontal) {
            window.addEventListener('mousemove', handleHorizontalResizeMove);
            window.addEventListener('mouseup', handleHorizontalResizeEnd);
        }
        return () => {
            window.removeEventListener('mousemove', handleHorizontalResizeMove);
            window.removeEventListener('mouseup', handleHorizontalResizeEnd);
        };
    }, [isResizingHorizontal, handleHorizontalResizeMove, handleHorizontalResizeEnd]);

    // AI Panel resize handlers
    const handleAiPanelResizeStart = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        setIsResizingAiPanel(true);
        const containerWidth = e.currentTarget.parentElement?.parentElement?.offsetWidth || 1000;
        resizeAiPanelStartRef.current = {
            startX: e.clientX,
            startWidth: (aiPanelWidth / 100) * containerWidth,
        };
        document.body.style.cursor = 'col-resize';
        document.body.style.userSelect = 'none';
    }, [aiPanelWidth]);
    
    const handleAiPanelResizeMove = useCallback((e: MouseEvent) => {
        if (!resizeAiPanelStartRef.current) return;
        
        const containerWidth = document.querySelector('.main-layout-container')?.clientWidth || 1000;
        const deltaX = resizeAiPanelStartRef.current.startX - e.clientX;
        const newWidth = resizeAiPanelStartRef.current.startWidth + deltaX;
        const newWidthPercent = (newWidth / containerWidth) * 100;
        
        if (newWidthPercent >= AI_MIN_WIDTH && newWidthPercent <= AI_MAX_WIDTH) {
            setAiPanelWidth(newWidthPercent);
        }
    }, []);
    
    const handleAiPanelResizeEnd = useCallback(() => {
        setIsResizingAiPanel(false);
        resizeAiPanelStartRef.current = null;
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
    }, []);
    
    useEffect(() => {
        if (isResizingAiPanel) {
            window.addEventListener('mousemove', handleAiPanelResizeMove);
            window.addEventListener('mouseup', handleAiPanelResizeEnd);
        }
        return () => {
            window.removeEventListener('mousemove', handleAiPanelResizeMove);
            window.removeEventListener('mouseup', handleAiPanelResizeEnd);
        };
    }, [isResizingAiPanel, handleAiPanelResizeMove, handleAiPanelResizeEnd]);

    const handleRun = useCallback(async () => {
        if (!id || !problem) return;
        
        setJudgeStatus("running");
        setTestCases([]);
        
        try {
            // Get visible test cases: from API or fallback to local (first 3)
            const apiCases = problem.testCases || [];
            const sourceCases =
                apiCases.length > 0
                    ? apiCases
                    : getTestCasesByProblemId(id!).map((tc) => ({ input: tc.input, output: tc.expected }));
            const problemTestCases = sourceCases.slice(0, 3).map((tc: any) => ({
                input: tc.input,
                expected: tc.output ?? tc.expected,
            }));

            if (problemTestCases.length === 0) {
                toast.error('No test cases available for this problem');
                setJudgeStatus('idle');
                return;
            }
            
            const entryPoint = getEntryPoint(id, problemTestCases);
            const result = await executeCode(code, language, problemTestCases, false, entryPoint);
            
            if (result.overallStatus === 'compilation_error') {
                setJudgeStatus('error');
                setTestCases([{
                    id: 1,
                    input: 'Compilation Error',
                    expectedOutput: 'N/A',
                    userOutput: '',
                    passed: false,
                    error: result.complexity.analysis || 'Compilation Error',
                }]);
                toast.error('Compilation Error', {
                    description: result.complexity.analysis || 'Failed to compile code',
                });
            } else if (result.overallStatus === 'runtime_error') {
                setJudgeStatus('error');
                setTestCases([{
                    id: 1,
                    input: 'Runtime Error',
                    expectedOutput: 'N/A',
                    userOutput: '',
                    passed: false,
                    error: result.complexity.analysis || 'Runtime Error',
                }]);
                toast.error('Runtime Error', {
                    description: result.complexity.analysis || 'Code threw an exception',
                });
            } else {
                setJudgeStatus('idle');
                const formattedResults = result.results.map((tc: any, idx: number) => ({
                    id: idx + 1,
                    input: typeof tc.input === 'object' ? JSON.stringify(tc.input) : tc.input,
                    expectedOutput: typeof tc.expected === 'object' ? JSON.stringify(tc.expected) : tc.expected,
                    userOutput: typeof tc.actual === 'object' ? JSON.stringify(tc.actual) : tc.actual,
                    passed: tc.passed,
                    executionTime: tc.executionTime,
                    error: tc.error,
                }));
                setTestCases(formattedResults);
                
                // Update metrics
                setRunMetrics({
                    runtime: result.totalExecutionTime,
                    memory: result.averageMemory,
                    runtimePercentile: 75,
                    memoryPercentile: 80,
                    timestamp: new Date(),
                });
                
                toast.success('Run completed');
            }
        } catch (error) {
            setJudgeStatus('error');
            toast.error('Execution failed', {
                description: 'Failed to connect to execution server. Make sure backend is running on port 3001.',
            });
        }
    }, [id, code, language, problem]);

    if (loading && !loadError) {
        return (
            <div className="h-screen w-full flex items-center justify-center">
                <div className="text-center space-y-4">
                    <Loader2 className="h-12 w-12 animate-spin text-cyan-500 mx-auto" />
                    <p className="text-slate-300">Loading problem...</p>
                </div>
            </div>
        );
    }

    if (loadError && !problem) {
        return (
            <div className="h-screen w-full flex items-center justify-center p-6">
                <div className="text-center space-y-4 max-w-md">
                    <AlertCircle className="h-12 w-12 text-amber-500 mx-auto" />
                    <h2 className="text-lg font-semibold text-foreground">Could not load problem</h2>
                    <p className="text-sm text-muted-foreground">{loadError}</p>
                    <div className="flex flex-wrap gap-3 justify-center">
                        <Button onClick={() => loadProblem()} variant="default">
                            Retry
                        </Button>
                        <Button onClick={() => navigate("/dsa/problems")} variant="outline">
                            Back to list
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    if (!problem) return <div className="p-10 text-center">Problem not found</div>;

    return (
        <div className="h-screen w-full flex flex-col bg-[#0B0F14] p-4 gap-4 relative">
            {/* Top Navigation */}
            <div className="flex items-center justify-end">
                {focusMode && (
                    <div className="flex items-center gap-2 text-purple-400 text-sm font-medium animate-pulse">
                        <Maximize className="h-4 w-4" />
                        Focus Mode Active (Press ESC to exit)
                    </div>
                )}
            </div>

            {/* Main 3-Column Layout */}
            <div className={`flex-1 flex gap-0 overflow-hidden transition-all duration-300 main-layout-container ${
                layoutMode === 'split-vertical' ? 'flex-col' : 'flex-row'
            }`}>
                
                {/* PROBLEM PANEL - Dynamic Width */}
                {!focusMode && layoutMode !== 'code-only' && (
                    <>
                        <div 
                            className={`flex flex-col bg-[#1a1f2e] rounded-[14px] shadow-lg overflow-hidden transition-all duration-300 ${
                                layoutMode === 'split-vertical' ? 'w-full h-[40%]' : ''
                            }`}
                            style={layoutMode !== 'split-vertical' ? { width: `${problemPanelWidth}%` } : {}}
                        >
                        {/* Header */}
                        <div className="p-5 border-b border-white/10">
                            <div className="flex items-start justify-between mb-3">
                                <h1 className="text-xl font-bold text-white leading-tight flex-1">{problem.title}</h1>
                                <Badge className={`ml-3 rounded-full px-[10px] py-1 text-xs font-bold ${
                                    problem.difficulty === "Easy" ? "bg-green-500/20 text-green-400" :
                                    problem.difficulty === "Medium" ? "bg-yellow-500/20 text-yellow-400" :
                                    "bg-red-500/20 text-red-400"
                                }`}>
                                    {problem.difficulty}
                                </Badge>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {problem.tags.map((tag, idx) => (
                                    <Badge key={idx} variant="secondary" className="bg-white/10 text-slate-300 border-none text-xs">
                                        {tag}
                                    </Badge>
                                ))}
                            </div>
                        </div>

                        {/* Scrollable Content */}
                        <div className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar">
                            <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-line">{problem.description}</p>

                            {/* Examples */}
                            {problem.examples.map((example, idx) => (
                                <div key={idx} className="bg-[#0f1419] rounded-[10px] p-3 shadow-inner">
                                    <h3 className="text-white font-semibold text-sm mb-2">Example {idx + 1}:</h3>
                                    <div className="font-mono text-xs space-y-1">
                                        <div><span className="text-slate-400">Input:</span> <span className="text-slate-200">{example.input}</span></div>
                                        <div><span className="text-slate-400">Output:</span> <span className="text-slate-200">{example.output}</span></div>
                                        {example.explanation && (
                                            <div><span className="text-slate-400">Explanation:</span> <span className="text-slate-200">{example.explanation}</span></div>
                                        )}
                                    </div>
                                </div>
                            ))}

                            {/* Constraints */}
                            {problem.constraints && problem.constraints.length > 0 && (
                                <div className="mt-4">
                                    <h3 className="text-white font-semibold text-sm mb-2">Constraints:</h3>
                                    <ul className="list-disc pl-5 space-y-1 text-slate-300 text-xs">
                                        {problem.constraints.map((constraint, idx) => (
                                            <li key={idx}>{constraint}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Feedback Section */}
                            {id && <ProblemFeedback problemSlug={id} />}
                        </div>

                        {/* Engagement Bar - Fixed at bottom */}
                        <ProblemEngagementBar
                            commentCount={commentCount}
                            isFavorited={isFavorited}
                            onComment={() => {
                                // Scroll to feedback section
                                const feedbackSection = document.querySelector('.problem-feedback');
                                if (feedbackSection) {
                                    feedbackSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                }
                            }}
                            onFavorite={toggleFavorite}
                        />
                    </div>

                    {/* Horizontal Resize Handle for Problem Panel */}
                    {layoutMode !== 'split-vertical' && (
                        <div 
                            className={`w-2 flex items-center justify-center cursor-col-resize group hover:bg-cyan-500/20 transition-colors ${
                                isResizingHorizontal ? 'bg-cyan-500/30' : ''
                            }`}
                            onMouseDown={handleHorizontalResizeStart}
                        >
                            <div className={`h-12 w-1 rounded-full transition-all ${
                                isResizingHorizontal ? 'bg-cyan-400 scale-110' : 'bg-white/20 group-hover:bg-cyan-400 group-hover:scale-110'
                            }`} />
                        </div>
                    )}
                    </>
                )}

                {/* CODE EDITOR PANEL - Dynamic Width */}
                <div className={`flex flex-col gap-0 transition-all duration-300 ${
                    focusMode || layoutMode === 'code-only' ? 'w-full' :
                    layoutMode === 'split-vertical' ? 'w-full flex-1' : ''
                }`}
                style={
                    !focusMode && layoutMode !== 'code-only' && layoutMode !== 'split-vertical'
                        ? { width: showAiHelper ? `${100 - problemPanelWidth - aiPanelWidth}%` : `${100 - problemPanelWidth}%` }
                        : {}
                }
                >
                    {/* Editor Card */}
                    <div 
                        className="flex flex-col bg-[#1a1f2e] rounded-[14px] shadow-lg"
                        style={{ height: `calc(100% - ${bottomPanelHeight}px - 8px)` }}
                    >
                        {/* Top Toolbar */}
                        <div className="h-12 flex items-center justify-between px-4 border-b border-white/10 shrink-0">
                            <div className="flex items-center gap-3">
                                <Select value={language} onValueChange={handleLanguageChange}>
                                    <SelectTrigger className="h-8 w-[120px] rounded-full border-white/20 bg-white/5 text-xs font-semibold">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {LANGUAGES.map(l => <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                                <span className="text-sm font-semibold text-cyan-400 border-b-2 border-cyan-400 pb-1">Code</span>
                                {timerActive && (
                                    <Badge className={`ml-2 rounded-full px-3 py-1 text-xs font-bold transition-colors duration-300 ${timer.getTimerColorClass()}`}>
                                        ⏱ {timer.getDisplayTime()}
                                    </Badge>
                                )}
                            </div>
                            
                            {/* 5 Circular Toolbar Buttons */}
                            <div className="flex items-center gap-[10px] pr-3">
                                {/* Button 1: Format Code */}
                                <button
                                    onClick={handleFormatCode}
                                    className="h-[34px] w-[34px] rounded-full flex items-center justify-center hover:bg-white/10 hover:scale-110 active:scale-95 transition-all duration-200 cursor-pointer group"
                                    title="Format Code"
                                >
                                    <Wand2 className="h-4 w-4 text-slate-400 group-hover:text-white" />
                                </button>

                                {/* Button 2: Timer */}
                                <button
                                    onClick={() => timerActive ? handleStopTimer() : setShowTimerModal(true)}
                                    className={`h-[34px] w-[34px] rounded-full flex items-center justify-center hover:scale-110 active:scale-95 transition-all duration-200 cursor-pointer group ${
                                        timerActive ? 'bg-cyan-500/20 shadow-lg shadow-cyan-500/30' : 'hover:bg-white/10'
                                    }`}
                                    title={timerActive ? "Stop Timer" : "Timer / Stopwatch"}
                                >
                                    <Timer className={`h-4 w-4 ${timer.getTimerIconColor()}`} />
                                </button>

                                {/* Button 3: Reset Code */}
                                <button
                                    onClick={() => setShowResetModal(true)}
                                    className="h-[34px] w-[34px] rounded-full flex items-center justify-center hover:bg-white/10 hover:scale-110 active:scale-95 transition-all duration-200 cursor-pointer group"
                                    title="Reset Code"
                                >
                                    <RotateCcw className="h-4 w-4 text-slate-400 group-hover:text-white" />
                                </button>

                                {/* Button 4: Layout Switcher */}
                                <div className="relative layout-menu-container">
                                    <button
                                        onClick={() => setShowLayoutMenu(!showLayoutMenu)}
                                        className="h-[34px] w-[34px] rounded-full flex items-center justify-center hover:bg-white/10 hover:scale-110 active:scale-95 transition-all duration-200 cursor-pointer group"
                                        title="Change Layout"
                                    >
                                        <LayoutGrid className="h-4 w-4 text-slate-400 group-hover:text-white" />
                                    </button>
                                    {showLayoutMenu && (
                                        <div className="absolute right-0 top-12 bg-[#1a1f2e] border border-white/10 rounded-lg shadow-xl p-2 w-52 z-50">
                                            {[
                                                { mode: 'layout-a' as LayoutMode, label: 'Competitive (Code top, Q + AI below)' },
                                                { mode: 'layout-b' as LayoutMode, label: 'Advanced (Code right, AI floating popup)' },
                                                { mode: 'default' as LayoutMode, label: 'Default Layout' },
                                                { mode: 'wide-code' as LayoutMode, label: 'Wide Code' },
                                                { mode: 'code-only' as LayoutMode, label: 'Code Only' },
                                                { mode: 'split-vertical' as LayoutMode, label: 'Split Vertical' },
                                            ].map(({ mode, label }) => (
                                                <button
                                                    key={mode}
                                                    onClick={() => handleLayoutChange(mode)}
                                                    className={`w-full text-left px-3 py-2 rounded text-sm hover:bg-white/10 transition-colors ${
                                                        layoutMode === mode ? 'text-cyan-400 bg-cyan-500/10' : 'text-slate-300'
                                                    }`}
                                                >
                                                    {label}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Button 5: Focus Mode */}
                                <button
                                    onClick={handleToggleFocusMode}
                                    className={`h-[34px] w-[34px] rounded-full flex items-center justify-center hover:scale-110 active:scale-95 transition-all duration-200 cursor-pointer group ${
                                        focusMode ? 'bg-purple-500/20 shadow-lg shadow-purple-500/30' : 'hover:bg-white/10'
                                    }`}
                                    title="Focus Mode"
                                >
                                    <Maximize className={`h-4 w-4 ${focusMode ? 'text-purple-400' : 'text-slate-400 group-hover:text-white'}`} />
                                </button>
                            </div>
                        </div>

                        {/* Editor - Scrollable */}
                        <div className="flex-1 overflow-hidden">
                            <Editor
                                height="100%"
                                language={language}
                                value={code}
                                onChange={handleCodeChange}
                                onMount={(editor) => setEditorRef(editor)}
                                theme="vs-dark"
                                loading={<div className="flex items-center justify-center h-full text-slate-400">Loading editor...</div>}
                                options={{
                                    // Basic settings
                                    minimap: { enabled: false },
                                    fontSize: 14,
                                    fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                                    padding: { top: 12, bottom: 12 },
                                    scrollBeyondLastLine: false,
                                    roundedSelection: true,
                                    smoothScrolling: true,
                                    cursorBlinking: "smooth",
                                    cursorSmoothCaretAnimation: "on",
                                    
                                    // Line numbers
                                    lineNumbers: "on",
                                    lineNumbersMinChars: 3,
                                    
                                    // Indentation and formatting
                                    autoIndent: "full",
                                    tabSize: 4,
                                    insertSpaces: true,
                                    
                                    // Bracket handling
                                    autoClosingBrackets: "always",
                                    autoClosingQuotes: "always",
                                    autoSurround: "languageDefined",
                                    bracketPairColorization: { enabled: true },
                                    guides: {
                                        bracketPairs: true,
                                        indentation: true,
                                    },
                                    
                                    // Code folding
                                    folding: true,
                                    foldingStrategy: "indentation",
                                    showFoldingControls: "mouseover",
                                    
                                    // Word wrap
                                    wordWrap: "off",
                                    
                                    // Syntax highlighting features
                                    renderLineHighlight: "all",
                                    renderWhitespace: "selection",
                                    
                                    // Quick suggestions
                                    quickSuggestions: {
                                        other: true,
                                        comments: false,
                                        strings: false,
                                    },
                                    suggestOnTriggerCharacters: true,
                                    acceptSuggestionOnEnter: "on",
                                    tabCompletion: "on",
                                    
                                    // Error and warning indicators
                                    glyphMargin: true,
                                    renderValidationDecorations: "on",
                                    
                                    // Scroll settings
                                    scrollbar: {
                                        useShadows: false,
                                        verticalHasArrows: false,
                                        horizontalHasArrows: false,
                                        vertical: "visible",
                                        horizontal: "visible",
                                        verticalScrollbarSize: 10,
                                        horizontalScrollbarSize: 10,
                                    },
                                    
                                    // Overview ruler
                                    overviewRulerBorder: false,
                                    hideCursorInOverviewRuler: false,
                                    
                                    // Additional features
                                    parameterHints: { enabled: true },
                                    formatOnPaste: true,
                                    formatOnType: true,
                                    
                                    // Copy/paste - allow in editor only (handled by document events)
                                    readOnly: false,
                                    domReadOnly: false,
                                }}
                                onValidate={(markers) => {
                                    // Process syntax validation markers
                                    const errors = markers.filter(m => m.severity === 8); // Error severity
                                    const warnings = markers.filter(m => m.severity === 4); // Warning severity
                                    
                                    if (errors.length > 0) {
                                        toast.error(`${errors.length} syntax error(s) detected`, {
                                            description: "Check the code for red underlined errors",
                                            duration: 3000,
                                        });
                                    }
                                }}
                            />
                        </div>

                        {/* Run & Submit Buttons - Sticky at bottom */}
                        <div className="shrink-0 p-4 border-t border-white/10 flex items-center justify-between bg-[#1a1f2e] sticky bottom-0 z-10">
                            {/* Left side - Run & Submit */}
                            <div className="flex items-center gap-3">
                                <Button
                                    onClick={handleRun}
                                    disabled={judgeStatus === 'running'}
                                    className="rounded-lg px-[18px] py-2 font-semibold text-sm bg-white/10 hover:bg-white/20 text-white border border-white/20 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
                                >
                                    {judgeStatus === 'running' ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Play className="h-4 w-4 mr-2 fill-current" />}
                                    Run
                                </Button>
                                <Button
                                    onClick={handleSubmit}
                                    disabled={judgeStatus === 'running'}
                                    className="rounded-lg px-[18px] py-2 font-semibold text-sm bg-cyan-500 hover:bg-cyan-400 text-black shadow-md hover:shadow-cyan-500/50 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
                                >
                                    {judgeStatus === 'running' ? <Loader2 className="h-4 w-4 animate-spin" /> : "Submit"}
                                </Button>
                            </div>

                            {/* Right side - Feedback & AI Toggle */}
                            <div className="flex items-center gap-2">
                                {!focusMode && (
                                    <button
                                        onClick={() => setShowFeedbackModal(true)}
                                        className="h-[36px] px-3 rounded-lg flex items-center gap-2 bg-white/10 hover:bg-white/15 hover:-translate-y-0.5 hover:shadow-lg active:scale-95 transition-all duration-200 cursor-pointer group text-slate-400 hover:text-white text-sm font-medium"
                                        title="Submit feedback"
                                    >
                                        <MessageSquare className="h-4 w-4" />
                                        Feedback
                                    </button>
                                )}
                                {!focusMode && layoutMode !== 'code-only' && (
                                    <button
                                        onClick={() => setShowAiHelper(!showAiHelper)}
                                        className="h-[36px] w-[36px] rounded-lg flex items-center justify-center bg-white/10 hover:bg-white/15 hover:-translate-y-0.5 hover:shadow-lg active:scale-95 transition-all duration-200 cursor-pointer group"
                                        title={showAiHelper ? "Hide AI Helper" : "Open AI Helper"}
                                    >
                                        <Bot className={`h-5 w-5 transition-colors ${showAiHelper ? 'text-cyan-400' : 'text-slate-400 group-hover:text-white'}`} />
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Resize Handle */}
                    <div 
                        className={`h-2 flex items-center justify-center cursor-row-resize group hover:bg-cyan-500/20 transition-colors ${
                            isResizing ? 'bg-cyan-500/30' : ''
                        }`}
                        onMouseDown={handleResizeStart}
                    >
                        <div className={`w-12 h-1 rounded-full transition-all ${
                            isResizing ? 'bg-cyan-400 scale-110' : 'bg-white/20 group-hover:bg-cyan-400 group-hover:scale-110'
                        }`} />
                    </div>

                    {/* Results Panel */}
                    <div 
                        className="bg-[#1a1f2e] rounded-[14px] shadow-lg overflow-hidden flex flex-col"
                        style={{ 
                            height: `${bottomPanelHeight}px`,
                            minHeight: `${MIN_HEIGHT}px`,
                            maxHeight: `${MAX_HEIGHT}px`
                        }}
                    >
                        {/* Top Tab Bar */}
                        <div className="flex items-center border-b border-white/10 px-2">
                            {/* Tabs */}
                            <div className="flex">
                                <button
                                    onClick={() => setActiveResultsTab('output')}
                                    className={`px-4 py-2.5 text-xs font-medium transition-colors flex items-center gap-2 ${
                                        activeResultsTab === 'output'
                                            ? 'text-cyan-400 border-b-2 border-cyan-400'
                                            : 'text-slate-400 hover:text-white'
                                    }`}
                                >
                                    <FileText className="h-3.5 w-3.5" />
                                    Output
                                </button>
                                <button
                                    onClick={() => setActiveResultsTab('results')}
                                    className={`px-4 py-2.5 text-xs font-medium transition-colors flex items-center gap-2 ${
                                        activeResultsTab === 'results'
                                            ? 'text-cyan-400 border-b-2 border-cyan-400'
                                            : 'text-slate-400 hover:text-white'
                                    }`}
                                >
                                    <Activity className="h-3.5 w-3.5" />
                                    Results
                                </button>
                            </div>
                            {/* Status/Action Row */}
                            <div className="flex items-center gap-4 ml-auto pr-4">
                                {hasSubmitted && submissionData && (
                                    <div className={`flex items-center gap-1.5 ${
                                        submissionData.status === 'success' ? 'text-green-400' : 'text-red-400'
                                    }`}>
                                        <CheckCircle2 className="h-3.5 w-3.5" />
                                        <span className="text-xs font-medium capitalize">
                                            {submissionData.status === 'success' ? 'Accepted' : 
                                             submissionData.status === 'compilation_error' ? 'Compilation Error' :
                                             submissionData.status === 'runtime_error' ? 'Runtime Error' :
                                             submissionData.status}
                                        </span>
                                    </div>
                                )}
                                <button className="flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors">
                                    <FileText className="h-3.5 w-3.5" />
                                    <span className="text-xs font-medium">Solutions</span>
                                </button>
                                <button className="flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors">
                                    <History className="h-3.5 w-3.5" />
                                    <span className="text-xs font-medium">Submissions</span>
                                </button>
                            </div>
                        </div>
                        
                        {/* Dynamic Content Based on Active Tab */}
                        <div className="flex-1 overflow-hidden">
                            {/* OUTPUT TAB */}
                            {activeResultsTab === 'output' && (
                                <div className="h-full flex flex-col">
                                    {/* Case Selector */}
                                    {testCases.length > 0 && (
                                        <div className="flex gap-2 px-4 py-2 border-b border-white/5">
                                            {testCases.map((tc, idx) => (
                                                <button
                                                    key={tc.id}
                                                    onClick={() => setActiveCase(idx)}
                                                    className={`rounded-full px-[14px] py-1.5 text-xs font-medium transition-all duration-200 flex items-center gap-2 ${
                                                        activeCase === idx
                                                            ? tc.passed 
                                                                ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                                                                : 'bg-red-500/20 text-red-400 border border-red-500/30'
                                                            : 'bg-transparent border border-white/20 text-slate-300 hover:border-cyan-500/50'
                                                    }`}
                                                >
                                                    <span className={tc.passed ? 'text-green-400' : 'text-red-400'}>
                                                        {tc.passed ? <CheckCircle2 className="h-3.5 w-3.5" /> : <AlertCircle className="h-3.5 w-3.5" />}
                                                    </span>
                                                    Case {idx + 1}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                    
                                    {/* Test Case Details */}
                                    {testCases.length > 0 ? (
                                        <div className="flex-1 overflow-y-auto p-4">
                                            {testCases[activeCase] && (
                                                <div className="space-y-4">
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div className="bg-[#0f1419] rounded-lg p-3">
                                                            <div className="text-xs text-slate-400 mb-2 flex items-center gap-1">
                                                                <span className="text-cyan-400">📥</span> Input
                                                            </div>
                                                            <div className="text-xs text-slate-200 font-mono whitespace-pre-wrap break-all">
                                                                {testCases[activeCase].input}
                                                            </div>
                                                        </div>
                                                        <div className="bg-[#0f1419] rounded-lg p-3">
                                                            <div className="text-xs text-slate-400 mb-2 flex items-center gap-1">
                                                                <span className="text-yellow-400">📤</span> Expected Output
                                                            </div>
                                                            <div className="text-xs text-slate-200 font-mono whitespace-pre-wrap break-all">
                                                                {testCases[activeCase].expectedOutput}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="bg-[#0f1419] rounded-lg p-3">
                                                        <div className="text-xs text-slate-400 mb-2 flex items-center gap-1">
                                                            <span className="text-purple-400">👤</span> Your Output
                                                        </div>
                                                        <div className={`text-xs font-mono whitespace-pre-wrap break-all ${
                                                            testCases[activeCase].error ? 'text-yellow-400' :
                                                            testCases[activeCase].passed ? 'text-green-400' : 'text-red-400'
                                                        }`}>
                                                            {testCases[activeCase].error || testCases[activeCase].userOutput}
                                                        </div>
                                                        {testCases[activeCase].error && (
                                                            <div className="mt-2 p-2 bg-red-500/10 border border-red-500/20 rounded text-xs text-red-400">
                                                                <span className="font-semibold">Error:</span> {testCases[activeCase].error}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="flex-1 flex items-center justify-center">
                                            <div className="text-center">
                                                <FileText className="h-12 w-12 text-slate-600 mx-auto mb-3" />
                                                <p className="text-slate-400 text-sm">No output yet.</p>
                                                <p className="text-slate-500 text-xs">Run code to see results</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                            
                            {/* RESULTS TAB */}
                            {activeResultsTab === 'results' && (
                                <div className="h-full overflow-y-auto p-4">
                                    {runMetrics ? (
                                        <div className="space-y-4">
                                            {/* Main Metrics Cards */}
                                            <div className="grid grid-cols-2 gap-4">
                                                {/* Runtime Card */}
                                                <div className="bg-[#0f1419] rounded-xl p-4 border border-white/5">
                                                    <div className="flex items-center justify-between mb-3">
                                                        <div className="flex items-center gap-2">
                                                            <div className="h-8 w-8 rounded-lg bg-cyan-500/10 flex items-center justify-center">
                                                                <Cpu className="h-4 w-4 text-cyan-400" />
                                                            </div>
                                                            <div>
                                                                <div className="text-xs text-slate-400">Runtime</div>
                                                                <div className="text-lg font-bold text-white">{runMetrics.runtime} <span className="text-xs text-slate-500 font-normal">ms</span></div>
                                                            </div>
                                                        </div>
                                                        <div className="text-right">
                                                            <div className="text-xs text-slate-400">Beats</div>
                                                            <div className="text-sm font-semibold text-green-400">{runMetrics.runtimePercentile}%</div>
                                                        </div>
                                                    </div>
                                                    <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                                                        <div 
                                                            className="h-full bg-gradient-to-r from-cyan-500 to-green-400 rounded-full"
                                                            style={{ width: `${runMetrics.runtimePercentile}%` }}
                                                        />
                                                    </div>
                                                </div>
                                                
                                                {/* Memory Card */}
                                                <div className="bg-[#0f1419] rounded-xl p-4 border border-white/5">
                                                    <div className="flex items-center justify-between mb-3">
                                                        <div className="flex items-center gap-2">
                                                            <div className="h-8 w-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
                                                                <HardDrive className="h-4 w-4 text-purple-400" />
                                                            </div>
                                                            <div>
                                                                <div className="text-xs text-slate-400">Memory</div>
                                                                <div className="text-lg font-bold text-white">{runMetrics.memory} <span className="text-xs text-slate-500 font-normal">MB</span></div>
                                                            </div>
                                                        </div>
                                                        <div className="text-right">
                                                            <div className="text-xs text-slate-400">Beats</div>
                                                            <div className="text-sm font-semibold text-green-400">{runMetrics.memoryPercentile}%</div>
                                                        </div>
                                                    </div>
                                                    <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                                                        <div 
                                                            className="h-full bg-gradient-to-r from-purple-500 to-pink-400 rounded-full"
                                                            style={{ width: `${runMetrics.memoryPercentile}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            {/* Performance Distribution Chart */}
                                            <div className="bg-[#0f1419] rounded-xl p-4 border border-white/5">
                                                <div className="flex items-center gap-2 mb-3">
                                                    <TrendingUp className="h-4 w-4 text-cyan-400" />
                                                    <span className="text-xs font-medium text-slate-300">Performance Distribution</span>
                                                </div>
                                                <ChartContainer
                                                    config={{
                                                        runtime: { label: "Runtime (ms)", color: "#06b6d4" },
                                                        submissions: { label: "Submissions", color: "#8b5cf6" },
                                                    }}
                                                    className="h-24 w-full"
                                                >
                                                    <BarChart 
                                                        data={[
                                                            { range: "0-10", runtime: 15, submissions: 8 },
                                                            { range: "10-20", runtime: 25, submissions: 12 },
                                                            { range: "20-30", runtime: 35, submissions: 18 },
                                                            { range: "30-40", runtime: 20, submissions: 10 },
                                                            { range: "40-50", runtime: 5, submissions: 2 },
                                                        ]}
                                                    >
                                                        <XAxis 
                                                            dataKey="range" 
                                                            axisLine={false}
                                                            tickLine={false}
                                                            tick={{ fill: '#64748b', fontSize: 10 }}
                                                        />
                                                        <ChartTooltip
                                                            content={<ChartTooltipContent />}
                                                            cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                                        />
                                                        <Bar dataKey="runtime" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                                                    </BarChart>
                                                </ChartContainer>
                                            </div>
                                            
                                            {/* Complexity Analysis Card */}
                                            <div className="bg-[#0f1419] rounded-xl p-4 border border-white/5">
                                                <div className="flex items-center gap-2 mb-3">
                                                    <Activity className="h-4 w-4 text-cyan-400" />
                                                    <span className="text-xs font-medium text-slate-300">Complexity Analysis</span>
                                                </div>
                                                {(() => {
                                                    const complexity = analyzeComplexity(code);
                                                    return (
                                                        <div className="space-y-3">
                                                            <div className="flex items-center justify-between">
                                                                <span className="text-xs text-slate-400">Estimated Complexity</span>
                                                                <span className={`text-sm font-bold px-3 py-1 rounded-full border ${getComplexityBadgeClass(complexity.estimatedComplexity)}`}>
                                                                    {complexity.estimatedComplexity}
                                                                </span>
                                                            </div>
                                                            {complexity.warnings.length > 0 && (
                                                                <div className="space-y-2">
                                                                    {complexity.warnings.map((warning, idx) => (
                                                                        <div key={idx} className="flex items-start gap-2 text-xs text-amber-400">
                                                                            <AlertCircle className="h-3 w-3 mt-0.5 shrink-0" />
                                                                            <span>{warning}</span>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            )}
                                                            <div className="flex items-center gap-4 text-xs text-slate-500 pt-2 border-t border-white/5">
                                                                <span className={complexity.hasLoops ? 'text-cyan-400' : ''}>
                                                                    {complexity.hasLoops ? '● Loops detected' : '○ No loops'}
                                                                </span>
                                                                <span className={complexity.hasRecursion ? 'text-purple-400' : ''}>
                                                                    {complexity.hasRecursion ? '● Recursion detected' : '○ No recursion'}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    );
                                                })()}
                                            </div>
                                            
                                            {/* Additional Info */}
                                            <div className="flex items-center justify-between text-xs text-slate-500 pt-2">
                                                <span>Language: <span className="text-slate-300 capitalize">{language}</span></span>
                                                <span>Executed: {runMetrics.timestamp.toLocaleTimeString()}</span>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex-1 flex items-center justify-center">
                                            <div className="text-center">
                                                <Activity className="h-12 w-12 text-slate-600 mx-auto mb-3" />
                                                <p className="text-slate-400 text-sm">No results yet.</p>
                                                <p className="text-slate-500 text-xs">Run or submit code to see metrics</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* AI HELPER - Layout B: floating popup; else inline panel */}
                {!focusMode && showAiHelper && layoutMode === 'layout-b' && (
                    <DraggableAiPopup storageKey="dsa_ai_popup_pos" onClose={() => setShowAiHelper(false)}>
                        <div className="h-full min-h-[400px]">
                            <DsaAiHelper
                                onClose={() => setShowAiHelper(false)}
                                problemContext={problem ? { title: problem.title, description: problem.description || '', constraints: problem.constraints || [], difficulty: problem.difficulty || '', tags: problem.tags || [] } : undefined}
                                userCode={code}
                                language={language}
                                problemId={id || undefined}
                            />
                        </div>
                    </DraggableAiPopup>
                )}

                {/* AI HELPER PANEL - Inline (Layout A / default) */}
                {!focusMode && showAiHelper && layoutMode !== 'code-only' && layoutMode !== 'layout-b' && (
                    <>
                        {layoutMode !== 'split-vertical' && (
                            <div 
                                className={`w-2 flex items-center justify-center cursor-col-resize group hover:bg-purple-500/20 transition-colors ${isResizingAiPanel ? 'bg-purple-500/30' : ''}`}
                                onMouseDown={handleAiPanelResizeStart}
                            >
                                <div className={`h-12 w-1 rounded-full transition-all ${isResizingAiPanel ? 'bg-purple-400 scale-110' : 'bg-white/20 group-hover:bg-purple-400 group-hover:scale-110'}`} />
                            </div>
                        )}
                        <div 
                            className={`bg-[#1a1f2e] rounded-[14px] shadow-lg overflow-hidden transition-all duration-300 ${layoutMode === 'split-vertical' ? 'w-[30%]' : ''}`}
                            style={layoutMode !== 'split-vertical' ? { width: `${aiPanelWidth}%` } : {}}
                        >
                            <DsaAiHelper
                                problemContext={problem ? { title: problem.title, description: problem.description || '', constraints: problem.constraints || [], difficulty: problem.difficulty || '', tags: problem.tags || [] } : undefined}
                                userCode={code}
                                language={language}
                                problemId={id || undefined}
                                onClose={() => setShowAiHelper(false)}
                            />
                        </div>
                    </>
                )}

                {/* AI Helper Toggle Button (when hidden) */}
                {!showAiHelper && !focusMode && layoutMode !== 'code-only' && (
                    <Button
                        onClick={() => setShowAiHelper(true)}
                        className="fixed bottom-8 right-8 h-12 w-12 rounded-full bg-cyan-500 hover:bg-cyan-400 text-black shadow-lg hover:shadow-cyan-500/50 hover:scale-105 transition-all duration-200"
                        size="icon"
                    >
                        <Bot className="h-5 w-5" />
                    </Button>
                )}
            </div>

            {/* Timer / Stopwatch Modal */}
            <Dialog open={showTimerModal} onOpenChange={setShowTimerModal}>
                <DialogContent className="bg-[#1a1f2e] border-white/10">
                    <DialogHeader>
                        <DialogTitle className="text-white">Timer & Stopwatch</DialogTitle>
                        <DialogDescription className="text-slate-400">
                            Count down (timer) or count up (stopwatch). Timer runs while you code; when time ends you get a warning only.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="flex items-center gap-2 text-slate-300 text-sm font-medium">⏳ Count-down timer</div>
                        <div className="grid grid-cols-2 gap-3">
                            {[15, 30, 45, 60].map((minutes) => (
                                <Button
                                    key={minutes}
                                    onClick={() => handleStartTimer(minutes)}
                                    className="h-14 text-base font-semibold bg-white/10 hover:bg-cyan-500/20 hover:text-cyan-400 border border-white/20 hover:border-cyan-500/50 transition-all"
                                >
                                    {minutes} min
                                </Button>
                            ))}
                        </div>
                        <div className="flex items-center gap-2 text-slate-300 text-sm font-medium pt-2">⏱ Stopwatch (count-up)</div>
                        <Button
                            onClick={handleStartStopwatch}
                            className="w-full h-14 text-base font-semibold bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 border border-cyan-500/50 transition-all"
                        >
                            Start Stopwatch
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            <FeedbackModal open={showFeedbackModal} onOpenChange={setShowFeedbackModal} problemSlug={id || ''} />

            {/* Reset Confirmation Modal */}
            <Dialog open={showResetModal} onOpenChange={setShowResetModal}>
                <DialogContent className="bg-[#1a1f2e] border-white/10">
                    <DialogHeader>
                        <DialogTitle className="text-white flex items-center gap-2">
                            <AlertCircle className="h-5 w-5 text-yellow-500" />
                            Reset to Default Boilerplate?
                        </DialogTitle>
                        <DialogDescription className="text-slate-400">
                            This will erase your current code and restore boilerplate. Continue?
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2">
                        <Button
                            onClick={() => setShowResetModal(false)}
                            variant="outline"
                            className="bg-transparent border-white/20 text-slate-300 hover:bg-white/10"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleResetCode}
                            className="bg-red-500 hover:bg-red-600 text-white"
                        >
                            Reset Code
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <style>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(255, 255, 255, 0.2);
                    border-radius: 999px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(255, 255, 255, 0.3);
                }
                
                /* Prevent text selection except in Monaco editor */
                body {
                    user-select: none;
                    -webkit-user-select: none;
                    -moz-user-select: none;
                    -ms-user-select: none;
                }
                
                .monaco-editor, .monaco-editor * {
                    user-select: text !important;
                    -webkit-user-select: text !important;
                    -moz-user-select: text !important;
                    -ms-user-select: text !important;
                }
            `}</style>
        </div>
    );
}
