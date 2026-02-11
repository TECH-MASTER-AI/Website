import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import Editor from "@monaco-editor/react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Timer, Trophy, ArrowLeft, Loader2, CheckCircle2, XCircle, Play, Send, RotateCcw } from "lucide-react";
import { getDsaProblemList } from "@/data/dsaProblems";
import { getVisibleTestCases, getAllTestCases } from "@/data/dsaTestCases";
import { executeCode } from "@/services/codeExecutionService";
import { toast } from "sonner";

function getEntryPoint(
  problemId: string | undefined,
  testCases: Array<{ input: any; expected: any }>
): { functionName: string; paramOrder: string[] } | null {
  if (!problemId || !testCases.length) return null;
  const firstInput = testCases[0]?.input;
  const paramOrder =
    firstInput && typeof firstInput === "object" && !Array.isArray(firstInput)
      ? Object.keys(firstInput)
      : [];
  const functionName = problemId
    .split("-")
    .map((part, i) => (i === 0 ? part : part.charAt(0).toUpperCase() + part.slice(1)))
    .join("");
  return { functionName, paramOrder };
}

interface TestCaseResult {
  id: number;
  input: string;
  expectedOutput: string;
  userOutput: string;
  passed: boolean;
  executionTime?: number;
  error?: string;
}

const LANGUAGES = [
  { value: "python", label: "Python 3", monaco: "python" },
  { value: "java", label: "Java", monaco: "java" },
  { value: "cpp", label: "C++", monaco: "cpp" },
  { value: "c", label: "C", monaco: "c" },
];

export default function DsaSoloChallenge() {
  const [problem] = useState(() => {
    const list = getDsaProblemList();
    return list[Math.floor(Math.random() * list.length)];
  });
  const [language, setLanguage] = useState("python");
  const [code, setCode] = useState(problem?.boilerplate?.python ?? "# Your code");
  const [startTime] = useState(Date.now());
  const [elapsed, setElapsed] = useState(0);
  const [solved, setSolved] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [judgeStatus, setJudgeStatus] = useState<"idle" | "running" | "submitting">("idle");
  const [testCaseResults, setTestCaseResults] = useState<TestCaseResult[]>([]);
  const [activeTab, setActiveTab] = useState<"problem" | "results">("problem");

  useEffect(() => {
    if (problem?.boilerplate) {
      const langCode = (problem.boilerplate as Record<string, string>)[language];
      if (langCode) setCode(langCode);
    }
  }, [language, problem?.id]);

  useEffect(() => {
    if (solved) return;
    const t = setInterval(
      () => setElapsed(Math.floor((Date.now() - startTime) / 1000)),
      1000
    );
    return () => clearInterval(t);
  }, [solved, startTime]);

  const runTests = useCallback(async (submitAll: boolean) => {
    if (!problem) return;
    
    // First try to get test cases from problem examples (always available)
    let problemTestCases = problem.examples.map((ex) => ({
      input: ex.input,
      expected: ex.output,
    }));

    // If submitting all, try to fetch additional test cases from database
    if (submitAll) {
      try {
        const testCasesFromData = await getAllTestCases(problem.id);
        if (testCasesFromData.length > 0) {
          problemTestCases = testCasesFromData.map((tc) => ({
            input: tc.input,
            expected: tc.expected,
          }));
        }
      } catch (error) {
        // If database fetch fails, use problem examples
        console.log("Using problem examples as fallback");
      }
    }
      
    if (problemTestCases.length === 0) {
      toast.error("No test cases available for this problem.");
      return;
    }

    const entryPoint = getEntryPoint(problem.id, problemTestCases);
    setJudgeStatus(submitAll ? "submitting" : "running");
    setTestCaseResults([]);
    setActiveTab("results");
    
    try {
      const result = await executeCode(
        code,
        language,
        problemTestCases,
        submitAll,
        entryPoint ?? undefined
      );
      const formatted: TestCaseResult[] = result.results.map((tc: any, idx: number) => ({
        id: idx + 1,
        input: typeof tc.input === "object" ? JSON.stringify(tc.input) : String(tc.input),
        expectedOutput:
          typeof tc.expected === "object" ? JSON.stringify(tc.expected) : String(tc.expected),
        userOutput: typeof tc.actual === "object" ? JSON.stringify(tc.actual) : String(tc.actual ?? ""),
        passed: tc.passed,
        executionTime: tc.executionTime,
        error: tc.error,
      }));
      setTestCaseResults(formatted);
      const allPassed = result.overallStatus === "success";
      if (submitAll && allPassed) {
        setSolved(true);
        setShowResult(true);
        toast.success("All test cases passed! Challenge complete.");
      } else if (
        result.overallStatus === "compilation_error" ||
        result.overallStatus === "runtime_error"
      ) {
        toast.error(result.complexity?.analysis ?? "Compilation or runtime error.");
      } else if (!allPassed) {
        const passed = result.results.filter((r: any) => r.passed).length;
        toast.error(`${passed}/${result.results.length} test cases passed.`);
      } else {
        const passed = result.results.filter((r: any) => r.passed).length;
        toast.success(`${passed}/${result.results.length} sample test cases passed. Submit to check all.`);
      }
    } catch (error) {
      console.error("Execution error:", error);
      
      // Show helpful error message based on language
      const languageSetup: Record<string, string> = {
        python: "Python is not installed. Install Python from python.org",
        java: "Java JDK is not installed. Install JDK from oracle.com/java",
        cpp: "C++ compiler (g++) is not installed. Install MinGW or GCC",
        c: "C compiler (gcc) is not installed. Install MinGW or GCC",
      };
      
      const setupMsg = languageSetup[language] || "Compiler not found";
      toast.error(`⚠️ Backend execution failed: ${setupMsg}`, { duration: 5000 });
      
      // Show mock results for demo purposes
      const mockResults: TestCaseResult[] = problemTestCases.map((tc, idx) => ({
        id: idx + 1,
        input: typeof tc.input === "object" ? JSON.stringify(tc.input) : String(tc.input),
        expectedOutput: typeof tc.expected === "object" ? JSON.stringify(tc.expected) : String(tc.expected),
        userOutput: "⚠️ Execution unavailable",
        passed: false,
        error: `${setupMsg}. Backend cannot execute ${language} code.`,
      }));
      
      setTestCaseResults(mockResults);
      setActiveTab("results");
    } finally {
      setJudgeStatus("idle");
    }
  }, [problem, code, language]);

  const handleReset = () => {
    if (problem?.boilerplate) {
      const langCode = (problem.boilerplate as Record<string, string>)[language];
      if (langCode) setCode(langCode);
    }
    setTestCaseResults([]);
    setActiveTab("problem");
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${String(sec).padStart(2, "0")}`;
  };

  const passedCount = testCaseResults.filter(tc => tc.passed).length;
  const score =
    solved
      ? Math.max(
          0,
          1000 -
            elapsed * 2 +
            (problem?.difficulty === "Hard" ? 200 : problem?.difficulty === "Medium" ? 100 : 0)
        )
      : 0;

  if (!problem) return null;

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-4rem)] overflow-hidden">
      {/* Header bar */}
      <div className="flex items-center gap-4 px-4 py-2 border-b bg-background/80 shrink-0 flex-wrap">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/dsa/duels" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
        </Button>
        <div className="flex items-center gap-2">
          <Badge variant="secondary">{problem.difficulty}</Badge>
          <span className="font-semibold text-sm truncate max-w-[200px]">{problem.title}</span>
        </div>
        <span className="font-mono text-sm flex items-center gap-1 ml-auto">
          <Timer className="h-4 w-4 text-primary" />
          {formatTime(elapsed)}
        </span>
      </div>

      {/* Main content: problem + editor side by side */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left: Problem + Results */}
        <div className="w-[40%] min-w-[300px] border-r flex flex-col overflow-hidden">
          <div className="flex border-b shrink-0">
            <button
              onClick={() => setActiveTab("problem")}
              className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === "problem"
                  ? "border-b-2 border-primary text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Problem
            </button>
            <button
              onClick={() => setActiveTab("results")}
              className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === "results"
                  ? "border-b-2 border-primary text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Results {testCaseResults.length > 0 && `(${passedCount}/${testCaseResults.length})`}
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {activeTab === "problem" && (
              <div className="space-y-4">
                <h2 className="text-lg font-bold">{problem.title}</h2>
                <p className="whitespace-pre-wrap text-muted-foreground text-sm leading-relaxed">
                  {problem.description}
                </p>
                {problem.examples.map((ex, i) => (
                  <div key={i} className="rounded-lg bg-muted/50 p-3 space-y-1">
                    <p className="text-xs font-semibold text-muted-foreground">Example {i + 1}</p>
                    <p className="font-mono text-sm"><span className="text-muted-foreground">Input:</span> {ex.input}</p>
                    <p className="font-mono text-sm"><span className="text-muted-foreground">Output:</span> {ex.output}</p>
                    {ex.explanation && (
                      <p className="text-xs text-muted-foreground">Explanation: {ex.explanation}</p>
                    )}
                  </div>
                ))}
                {problem.constraints.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground mb-1">Constraints:</p>
                    <ul className="list-disc list-inside text-xs text-muted-foreground space-y-0.5">
                      {problem.constraints.map((c, i) => (
                        <li key={i} className="font-mono">{c}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {activeTab === "results" && (
              <div className="space-y-3">
                {testCaseResults.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    Run or submit your code to see results here.
                  </p>
                ) : (
                  <>
                    <div className="flex items-center gap-2 mb-2">
                      {passedCount === testCaseResults.length ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-500" />
                      )}
                      <span className="text-sm font-medium">
                        {passedCount}/{testCaseResults.length} passed
                      </span>
                    </div>
                    {testCaseResults.map((tc) => (
                      <div
                        key={tc.id}
                        className={`rounded-lg border p-3 space-y-1 ${
                          tc.passed ? "border-green-500/30 bg-green-500/5" : "border-red-500/30 bg-red-500/5"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          {tc.passed ? (
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-500" />
                          )}
                          <span className="text-sm font-medium">
                            Case {tc.id}: {tc.passed ? "Passed" : "Failed"}
                          </span>
                          {tc.executionTime !== undefined && (
                            <span className="text-xs text-muted-foreground ml-auto">
                              {tc.executionTime}ms
                            </span>
                          )}
                        </div>
                        {!tc.passed && (
                          <div className="text-xs font-mono space-y-1 mt-2 pl-6">
                            <p><span className="text-muted-foreground">Input:</span> {tc.input}</p>
                            <p><span className="text-muted-foreground">Expected:</span> {tc.expectedOutput}</p>
                            <p><span className="text-muted-foreground">Got:</span> {tc.error || tc.userOutput}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </>
                )}

                {showResult && solved && (
                  <Card className="border-primary/30 bg-primary/5 mt-4">
                    <CardHeader className="pb-2">
                      <CardTitle className="flex items-center gap-2 text-base">
                        <Trophy className="h-5 w-5 text-primary" />
                        Challenge Complete!
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground text-sm">
                        Time: <strong className="text-foreground">{formatTime(elapsed)}</strong>
                        {" · "}
                        Score: <strong className="text-foreground">{score}</strong>
                      </p>
                      <Button asChild className="mt-3" size="sm">
                        <Link to="/dsa/duels">Try another</Link>
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right: Code Editor */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Editor toolbar */}
          <div className="flex items-center gap-2 px-3 py-2 border-b bg-muted/30 shrink-0">
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger className="w-[130px] h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LANGUAGES.map((l) => (
                  <SelectItem key={l.value} value={l.value}>
                    {l.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="ghost" size="sm" onClick={handleReset} className="h-8 gap-1 text-xs">
              <RotateCcw className="h-3 w-3" />
              Reset
            </Button>
            <div className="ml-auto flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => runTests(false)}
                disabled={judgeStatus !== "idle" || solved}
                className="h-8 gap-1 text-xs"
              >
                {judgeStatus === "running" ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <Play className="h-3 w-3" />
                )}
                Run
              </Button>
              <Button
                size="sm"
                onClick={() => runTests(true)}
                disabled={judgeStatus !== "idle" || solved}
                className="h-8 gap-1 text-xs"
              >
                {judgeStatus === "submitting" ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <Send className="h-3 w-3" />
                )}
                Submit
              </Button>
            </div>
          </div>

          {/* Monaco Editor */}
          <div className="flex-1">
            <Editor
              height="100%"
              language={LANGUAGES.find(l => l.value === language)?.monaco ?? "python"}
              value={code}
              onChange={(v) => setCode(v ?? "")}
              theme="vs-dark"
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                lineNumbers: "on",
                scrollBeyondLastLine: false,
                wordWrap: "on",
                tabSize: 4,
                automaticLayout: true,
                readOnly: solved,
                padding: { top: 12 },
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
