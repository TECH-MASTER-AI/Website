import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, Trophy, ArrowLeft, Loader2, Play } from "lucide-react";
import { fetchDailySlug, fetchDsaQuestionById } from "@/features/dsa/api/questions";
import type { DsaQuestionDetail } from "@/features/dsa/api/questions";
import { getDsaProblemList, getDsaProblemById } from "@/data/dsaProblems";
import { getAllTestCases } from "@/data/dsaTestCases";
import { executeCode } from "@/services/codeExecutionService";
import { addSolvedProblem, syncSolvedToBackend } from "@/features/dsa/profile/dsaProfileStore";
import { recordActivity } from "@/features/dsa/streak/dsaActivityStore";
import { toast } from "sonner";

const DEFAULT_PYTHON = "# Your code (Python)\ndef solution():\n    pass";

function normalizeTestCases(tcs: unknown[]): Array<{ input: any; expected: any }> {
  if (!Array.isArray(tcs)) return [];
  return tcs.map((tc: any) => ({
    input: tc?.input,
    expected: tc?.expected ?? tc?.output,
  })).filter((tc) => tc.input !== undefined);
}

function getEntryPoint(problemId: string | undefined, tcs: Array<{ input: any; expected: any }>) {
  if (!problemId || !tcs.length) return null;
  const first = tcs[0]?.input;
  const paramOrder = first && typeof first === "object" && !Array.isArray(first) ? Object.keys(first) : [];
  const functionName = problemId.split("-").map((p, i) => (i === 0 ? p : p.charAt(0).toUpperCase() + p.slice(1))).join("");
  return { functionName, paramOrder };
}

export default function DsaDailyChallenge() {
  const [problem, setProblem] = useState<DsaQuestionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [code, setCode] = useState(DEFAULT_PYTHON);
  const [startTime] = useState(Date.now());
  const [elapsed, setElapsed] = useState(0);
  const [solved, setSolved] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "running">("idle");
  const [runResult, setRunResult] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        try {
          const { slug } = await fetchDailySlug();
          if (cancelled) return;
          const { item } = await fetchDsaQuestionById(slug);
          if (cancelled) return;
          setProblem(item);
        } catch {
          const list = getDsaProblemList();
          if (list.length === 0) throw new Error("No problems available.");
          const today = new Date().toDateString();
          let hash = 0;
          for (let i = 0; i < today.length; i++) hash = (hash << 5) - hash + today.charCodeAt(i);
          const pick = list[Math.abs(hash) % list.length];
          setProblem({
            id: pick.id,
            title: pick.title,
            difficulty: pick.difficulty,
            acceptance: pick.acceptance,
            tags: pick.tags,
            description: pick.description,
            examples: pick.examples,
            constraints: pick.constraints,
            testCases: [],
            isPremium: false,
            likes: 0,
            dislikes: 0,
          });
        }
        if (!cancelled) setCode(DEFAULT_PYTHON);
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Failed to load daily problem");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (problem?.id) {
      const p = getDsaProblemById(problem.id);
      if (p?.boilerplate?.python) setCode(p.boilerplate.python);
    }
  }, [problem?.id]);

  useEffect(() => {
    if (solved) return;
    const t = setInterval(() => setElapsed(Math.floor((Date.now() - startTime) / 1000)), 1000);
    return () => clearInterval(t);
  }, [solved, startTime]);

  const apiTestCases = problem ? normalizeTestCases(problem.testCases ?? []) : [];
  const localTestCases = problem ? getAllTestCases(problem.id).map((tc) => ({ input: tc.input, expected: tc.expected })) : [];
  const dailyTestCases = apiTestCases.length > 0 ? apiTestCases : localTestCases;
  const hasTestCases = dailyTestCases.length > 0;

  const handleRun = async () => {
    if (!problem || !hasTestCases) {
      toast.error("No test cases for this problem.");
      return;
    }
    setSubmitStatus("running");
    setRunResult(null);
    try {
      const entryPoint = getEntryPoint(problem.id, dailyTestCases);
      const sample = dailyTestCases.slice(0, 2);
      const result = await executeCode(code, "python", sample, false, entryPoint ?? undefined);
      const passed = result.results.filter((r: any) => r.passed).length;
      setRunResult(`${passed}/${sample.length} sample test(s) passed.`);
      if (passed === sample.length) toast.success("Sample tests passed!");
      else toast.error(`${passed}/${sample.length} passed.`);
    } catch {
      toast.error("Run failed. Is the backend running?");
      setRunResult("Run failed.");
    } finally {
      setSubmitStatus("idle");
    }
  };

  const handleSubmit = async () => {
    if (solved) return;
    if (hasTestCases) {
      setSubmitStatus("running");
      try {
        const entryPoint = getEntryPoint(problem!.id, dailyTestCases);
        const result = await executeCode(code, "python", dailyTestCases, true, entryPoint ?? undefined);
        if (result.overallStatus === "success") {
          setSolved(true);
          setShowResult(true);
          if (problem?.id) {
            addSolvedProblem(problem.id);
            recordActivity();
            syncSolvedToBackend(problem.id).catch(() => {});
          }
          toast.success("Daily challenge complete!");
        } else {
          const passed = result.results.filter((r: any) => r.passed).length;
          toast.error(`${passed}/${dailyTestCases.length} test cases passed.`);
        }
      } catch {
        toast.error("Submit failed. Is the backend running on port 3001?");
      } finally {
        setSubmitStatus("idle");
      }
    } else {
      setSolved(true);
      setShowResult(true);
      if (problem?.id) {
        addSolvedProblem(problem.id);
        recordActivity();
        syncSolvedToBackend(problem.id).catch(() => {});
      }
      toast.success("Daily challenge complete!");
    }
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${String(sec).padStart(2, "0")}`;
  };

  const todayStr = new Date().toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" });

  if (loading) {
    return (
      <div className="flex-1 p-6 flex items-center justify-center min-h-[300px]">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading today&apos;s challenge...</p>
        </div>
      </div>
    );
  }

  if (error || !problem) {
    return (
      <div className="flex-1 p-6">
        <div className="container max-w-4xl mx-auto">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/dsa/duels" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Link>
          </Button>
          <Card className="mt-4 border-destructive/50">
            <CardContent className="pt-6">
              <p className="text-destructive">{error ?? "Problem not found."}</p>
              <p className="text-sm text-muted-foreground mt-2">Ensure the backend is running and the DB is seeded.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const examples = problem.examples?.slice(0, 2) ?? [];

  return (
    <div className="flex-1 p-6 min-h-[400px]">
      <div className="container max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/dsa/duels" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Link>
          </Button>
          <span className="text-muted-foreground flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            {todayStr}
          </span>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between flex-wrap gap-2">
              <span>Daily Challenge</span>
              <Badge variant="secondary">{problem.difficulty}</Badge>
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Same problem for everyone today. Complete to appear on today's leaderboard (when backend is connected).
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <h2 className="text-xl font-bold">{problem.title}</h2>
            <p className="whitespace-pre-wrap text-muted-foreground text-sm">{problem.description}</p>
            <div className="rounded bg-muted/50 p-3 font-mono text-sm">
              {examples.map((ex, i) => (
                <div key={i}>
                  <strong>Input:</strong> {ex.input} → <strong>Output:</strong> {ex.output}
                </div>
              ))}
            </div>
            {hasTestCases && (
              <p className="text-xs text-muted-foreground">
                Use Python. {dailyTestCases.length} test case{dailyTestCases.length !== 1 ? "s" : ""} — Run to try samples, Submit to run all.
              </p>
            )}
            <Textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="font-mono min-h-[140px]"
              placeholder="Write your solution (Python)..."
              disabled={solved}
            />
            {runResult && <p className="text-sm text-muted-foreground">{runResult}</p>}
            {!solved ? (
              <div className="flex flex-wrap gap-2">
                {hasTestCases && (
                  <Button variant="outline" onClick={handleRun} disabled={submitStatus === "running"} className="gap-1">
                    {submitStatus === "running" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
                    Run sample
                  </Button>
                )}
                <Button onClick={handleSubmit} disabled={submitStatus === "running"}>
                  {submitStatus === "running" ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Running tests…
                    </>
                  ) : hasTestCases ? (
                    "Submit (run all tests)"
                  ) : (
                    "Submit solution"
                  )}
                </Button>
              </div>
            ) : (
              <p className="text-sm text-green-600 dark:text-green-400">Solved!</p>
            )}
          </CardContent>
        </Card>

        {showResult && (
          <Card className="border-primary/30 bg-primary/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-primary" />
                Daily challenge complete
              </CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground">
                  Time: <strong className="text-foreground">{formatTime(elapsed)}</strong>
                  {" · "}
                  Today's rank will update when leaderboard is connected.
                </p>
                <Button asChild className="mt-4">
                  <Link to="/dsa/duels">Back to duels</Link>
                </Button>
              </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
