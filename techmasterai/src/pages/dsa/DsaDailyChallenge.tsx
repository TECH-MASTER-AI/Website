import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, Trophy, ArrowLeft } from "lucide-react";
import { getDsaProblemList } from "@/data/dsaProblems";
import { toast } from "sonner";

function getTodaysProblem() {
  const list = getDsaProblemList();
  const today = new Date().toDateString();
  let hash = 0;
  for (let i = 0; i < today.length; i++) hash = (hash << 5) - hash + today.charCodeAt(i);
  const index = Math.abs(hash) % list.length;
  return list[index];
}

export default function DsaDailyChallenge() {
  const [problem] = useState(getTodaysProblem);
  const [code, setCode] = useState(problem?.boilerplate?.javascript ?? "// Your code");
  const [startTime] = useState(Date.now());
  const [elapsed, setElapsed] = useState(0);
  const [solved, setSolved] = useState(false);
  const [showResult, setShowResult] = useState(false);

  useEffect(() => {
    if (solved) return;
    const t = setInterval(() => setElapsed(Math.floor((Date.now() - startTime) / 1000)), 1000);
    return () => clearInterval(t);
  }, [solved, startTime]);

  const handleSubmit = () => {
    setSolved(true);
    setShowResult(true);
    toast.success("Daily challenge complete!");
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${String(sec).padStart(2, "0")}`;
  };

  const todayStr = new Date().toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" });

  if (!problem) return null;

  return (
    <div className="flex-1 p-6">
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
              Same problem for everyone today. Complete to appear on today’s leaderboard (when backend is connected).
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <h2 className="text-xl font-bold">{problem.title}</h2>
            <p className="whitespace-pre-wrap text-muted-foreground text-sm">{problem.description}</p>
            <div className="rounded bg-muted/50 p-3 font-mono text-sm">
              {problem.examples.slice(0, 2).map((ex, i) => (
                <div key={i}>
                  <strong>Input:</strong> {ex.input} → <strong>Output:</strong> {ex.output}
                </div>
              ))}
            </div>
            <Textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="font-mono min-h-[140px]"
              placeholder="Write your solution..."
              disabled={solved}
            />
            {!solved ? (
              <Button onClick={handleSubmit}>Submit solution</Button>
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
                  Today’s rank will update when leaderboard is connected.
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
