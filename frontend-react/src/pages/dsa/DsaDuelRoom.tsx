import { useState, useEffect, useRef } from "react";
import { useParams, useSearchParams, Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Swords,
  Clock,
  MessageSquare,
  Mic,
  MicOff,
  Square,
  Bot,
  Send,
  Trophy,
  Loader2,
  Volume2,
  VolumeX,
} from "lucide-react";
import { getDsaProblemList, getDsaProblemById } from "@/data/dsaProblems";
import { getAllTestCases } from "@/data/dsaTestCases";
import { executeCode } from "@/services/codeExecutionService";
import { getDuelWsUrl } from "@/features/dsa/duels/duelWsUrl";
import { useDuelUser } from "@/features/dsa/duels/useDuelUser";
import {
  getDuelRating,
  addDuelWin,
  addDuelLoss,
  getWinPoints,
  getLossPoints,
  getRankTier,
  getDuelStats,
} from "@/features/dsa/duels/duelRating";
import { toast } from "sonner";

const DUEL_DURATION_SEC = 15 * 60; // 15 min

interface ChatMessage {
  id: string;
  from: "me" | "opponent";
  text: string;
  time: Date;
}

export default function DsaDuelRoom() {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [opponentName, setOpponentName] = useState(() => searchParams.get("opponent") || "Opponent");
  const problemIdParam = searchParams.get("problemId");
  const isBot = searchParams.get("bot") === "1";
  const user = useDuelUser();
  const wsRef = useRef<WebSocket | null>(null);

  const [problem, setProblem] = useState(() => {
    if (problemIdParam) {
      const p = getDsaProblemById(problemIdParam);
      if (p) return p;
    }
    const list = getDsaProblemList();
    return list[Math.floor(Math.random() * list.length)];
  });
  const [timeLeft, setTimeLeft] = useState(DUEL_DURATION_SEC);
  const [mySolved, setMySolved] = useState(false);
  const [oppSolved, setOppSolved] = useState(false);
  const [winner, setWinner] = useState<"you" | "opponent" | null>(null);
  const [language, setLanguage] = useState<"python" | "javascript">("python");
  const [code, setCode] = useState(
    () => problem?.boilerplate?.python ?? problem?.boilerplate?.javascript ?? "# Your code"
  );
  const [submitStatus, setSubmitStatus] = useState<"idle" | "running">("idle");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [voiceJoined, setVoiceJoined] = useState(false);
  const [muted, setMuted] = useState(false);
  const [recording, setRecording] = useState(false);
  const [aiResponse, setAiResponse] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [wsConnected, setWsConnected] = useState(false);
  const [ratingUpdate, setRatingUpdate] = useState<{ newRating: number; change: number } | null>(null);
  const ratingAppliedRef = useRef(false);
  const recorderRef = useRef<MediaRecorder | null>(null);

  useEffect(() => {
    if (!roomId?.trim()) navigate("/dsa/duels", { replace: true });
  }, [roomId, navigate]);

  useEffect(() => {
    const boilerplate = language === "python" ? problem?.boilerplate?.python : problem?.boilerplate?.javascript;
    if (boilerplate) setCode(boilerplate);
  }, [problem?.id, language]);

  useEffect(() => {
    if (winner || timeLeft <= 0) return;
    const t = setInterval(() => setTimeLeft((s) => (s <= 1 ? 0 : s - 1)), 1000);
    return () => clearInterval(t);
  }, [winner]);

  useEffect(() => {
    if (!winner || ratingAppliedRef.current) return;
    ratingAppliedRef.current = true;
    if (winner === "you") {
      const newRating = addDuelWin(opponentName);
      setRatingUpdate({ newRating, change: getWinPoints() });
    } else {
      const newRating = addDuelLoss(opponentName);
      setRatingUpdate({ newRating, change: -getLossPoints() });
    }
  }, [winner, opponentName]);

  useEffect(() => {
    if (timeLeft === 0 && !winner) {
      setWinner(mySolved === oppSolved ? null : mySolved ? "you" : "opponent");
      if (mySolved !== oppSolved) toast.info(mySolved ? "Time's up! You won." : "Time's up! Opponent won.");
    }
  }, [timeLeft, winner, mySolved, oppSolved]);

  const duelTestCases = problem ? getAllTestCases(problem.id) : [];
  const hasTestCases = duelTestCases.length > 0;
  const testCasesForRun = duelTestCases.map((tc) => ({ input: tc.input, expected: tc.expected }));

  function getEntryPoint(pid: string, tcs: Array<{ input: any; expected: any }>) {
    if (!pid || !tcs.length) return null;
    const first = tcs[0]?.input;
    const paramOrder = first && typeof first === "object" && !Array.isArray(first) ? Object.keys(first) : [];
    const functionName = pid.split("-").map((p, i) => (i === 0 ? p : p.charAt(0).toUpperCase() + p.slice(1))).join("");
    return { functionName, paramOrder };
  }

  const handleSubmit = async () => {
    if (mySolved) return;
    if (hasTestCases) {
      if (language !== "python") {
        toast.error("Use Python to run test cases in duels, or switch to Python above.");
        return;
      }
      setSubmitStatus("running");
      try {
        const entryPoint = getEntryPoint(problem!.id, testCasesForRun);
        const result = await executeCode(code, "python", testCasesForRun, true, entryPoint ?? undefined);
        if (result.overallStatus === "success") {
          setMySolved(true);
          if (!oppSolved) setWinner("you");
          if (wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({ type: "solved" }));
          }
          toast.success("All test cases passed! You solved it first.");
        } else {
          const passed = result.results.filter((r: any) => r.passed).length;
          toast.error(`${passed}/${result.results.length} test cases passed. Fix your solution.`);
        }
      } catch {
        toast.error("Execution failed. Is the backend running on port 3001?");
      } finally {
        setSubmitStatus("idle");
      }
    } else {
      setMySolved(true);
      if (!oppSolved) setWinner("you");
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ type: "solved" }));
      }
      toast.success("Correct! You solved it first.");
    }
  };

  useEffect(() => {
    if (!roomId) return;
    const wsUrl = getDuelWsUrl();
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      ws.send(
        JSON.stringify({
          type: "join_room",
          roomId,
          userId: user?.id ?? "",
          username: user?.username ?? "You",
          gender: user?.gender ?? undefined,
        })
      );
      setWsConnected(true);
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "room_joined" && data.botName) {
          setOpponentName(data.botName);
        } else if (data.type === "chat") {
          if (data.from === "me") return;
          setChatMessages((m) => [
            ...m,
            {
              id: `m-${Date.now()}-${m.length}`,
              from: "opponent",
              text: data.text,
              time: data.time ? new Date(data.time) : new Date(),
            },
          ]);
        } else if (data.type === "opponent_solved") {
          setOppSolved(true);
          if (!mySolved) setWinner("opponent");
          toast.info("Opponent solved first!");
        } else if (data.type === "opponent_left") {
          toast.info(`${data.username || "Opponent"} left the duel.`);
        } else if (data.type === "error") {
          toast.error(data.message || "Connection error.");
        }
      } catch {
        // ignore
      }
    };

    ws.onclose = () => setWsConnected(false);
    ws.onerror = () => setWsConnected(false);

    return () => {
      ws.close();
      wsRef.current = null;
    };
  }, [roomId]);

  const sendChat = () => {
    const text = chatInput.trim();
    if (!text) return;
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: "chat",
          text,
          roomId: roomId ?? undefined,
        })
      );
      setChatMessages((m) => [
        ...m,
        { id: `m-${Date.now()}`, from: "me", text, time: new Date() },
      ]);
    } else {
      setChatMessages((m) => [
        ...m,
        { id: `m-${Date.now()}`, from: "me", text, time: new Date() },
      ]);
    }
    setChatInput("");
  };

  const toggleVoice = () => {
    if (!voiceJoined) {
      setVoiceJoined(true);
      toast.info("Voice connected (demo). Real VC requires backend.");
    } else setVoiceJoined(false);
  };

  const toggleRecord = async () => {
    if (recording) {
      recorderRef.current?.stop();
      setRecording(false);
      toast.success("Recording saved (demo).");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const rec = new MediaRecorder(stream);
      recorderRef.current = rec;
      rec.start();
      setRecording(true);
      toast.info("Recording started.");
    } catch {
      toast.error("Microphone access needed for recording.");
    }
  };

  const askAi = async (type: "problem" | "solution") => {
    setAiLoading(true);
    setAiResponse("");
    const prompt =
      type === "problem"
        ? `Explain this DSA problem briefly: ${problem?.title}. ${problem?.description?.slice(0, 200)}...`
        : `Give a short approach to solve: ${problem?.title}. Don't give full code, just strategy.`;
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: prompt,
          sessionId: `duel-${roomId}-ai`,
          conversationHistory: [],
        }),
      });
      const data = await res.json();
      if (data.response) setAiResponse(data.response);
      else setAiResponse("AI explanation unavailable. Add GROQ_API_KEY for live explanations.");
    } catch {
      setAiResponse(
        "AI explanation (demo): Use a hash map to store seen values. For each element, check if target - element exists in the map. Connect backend + GROQ_API_KEY for real AI."
      );
    }
    setAiLoading(false);
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${String(sec).padStart(2, "0")}`;
  };

  if (!roomId?.trim()) {
    return (
      <div className="flex-1 p-6 flex flex-col items-center justify-center gap-3 bg-background">
        <p className="text-muted-foreground">Invalid room. Redirecting to duels...</p>
        <Button variant="outline" asChild>
          <Link to="/dsa/duels">Back to 1v1 Duels</Link>
        </Button>
      </div>
    );
  }

  if (!problem) {
    return (
      <div className="flex-1 p-6 flex flex-col items-center justify-center gap-3 bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <p className="text-muted-foreground">Loading problem...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)]">
      {/* Header: timer + scores */}
      <div className="border-b bg-muted/30 px-4 py-2 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-4">
          <Link to="/dsa/duels" className="text-sm text-muted-foreground hover:text-foreground">
            ← Leave duel
          </Link>
          <span className="font-mono font-semibold flex items-center gap-1">
            <Clock className="h-4 w-4" />
            {formatTime(timeLeft)}
          </span>
        </div>
        <div className="flex items-center gap-4">
          {wsConnected && (
            <span className="text-xs bg-green-500/20 text-green-600 dark:text-green-400 px-2 py-0.5 rounded font-medium">
              Live
            </span>
          )}
          <span className={mySolved ? "text-green-600 dark:text-green-400 font-medium" : ""}>
            You {user?.username ?? "You"} {mySolved && "✓"}
          </span>
          <Swords className="h-4 w-4 text-muted-foreground" />
          <span className={oppSolved ? "text-green-600 dark:text-green-400 font-medium" : ""}>
            {opponentName} {oppSolved && "✓"}
          </span>
        </div>
      </div>

      <div className="flex-1 flex min-h-0">
        {/* Left: Problem + code (larger) */}
        <div className="w-[70%] min-w-0 border-r overflow-hidden flex flex-col">
          <div className="flex-1 overflow-y-auto p-4 shrink-0">
            <h2 className="text-lg font-bold">{problem.title}</h2>
            <Badge variant="secondary" className="mt-1">{problem.difficulty}</Badge>
            <div className="mt-4 prose prose-sm dark:prose-invert max-w-none">
              <p className="whitespace-pre-wrap text-foreground">{problem.description}</p>
              <h3 className="font-semibold mt-4">Examples</h3>
              {problem.examples.slice(0, 2).map((ex, i) => (
                <div key={i} className="rounded bg-muted/50 p-2 my-2 font-mono text-sm">
                  <div><strong>Input:</strong> {ex.input}</div>
                  <div><strong>Output:</strong> {ex.output}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="p-4 pt-0 flex flex-col min-h-0 border-t bg-muted/20">
            {hasTestCases && (
              <p className="text-xs text-muted-foreground mb-1">
                Language: Python (required for test cases). {duelTestCases.length} test case{duelTestCases.length !== 1 ? "s" : ""} will run on submit.
              </p>
            )}
            <Textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="font-mono text-sm min-h-[200px] flex-1 resize-y"
              placeholder="Write your solution..."
            />
            <Button className="mt-2 gap-2 shrink-0" onClick={handleSubmit} disabled={mySolved || submitStatus === "running"}>
              {submitStatus === "running" ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Running tests…
                </>
              ) : mySolved ? (
                "Solved ✓"
              ) : hasTestCases ? (
                "Submit (run test cases)"
              ) : (
                "Submit solution"
              )}
            </Button>
          </div>
        </div>

        {/* Right: Chat, Voice, AI (smaller) */}
        <div className="w-[30%] min-w-[240px] flex flex-col border-l bg-muted/10">
          <Tabs defaultValue="chat" className="flex-1 flex flex-col min-h-0">
            <TabsList className="mx-2 mt-2 shrink-0 h-8">
              <TabsTrigger value="chat" className="gap-1 text-xs px-2">
                <MessageSquare className="h-3.5 w-3.5" />
                Chat
              </TabsTrigger>
              <TabsTrigger value="voice" className="gap-1 text-xs px-2">
                <Mic className="h-3.5 w-3.5" />
                Voice
              </TabsTrigger>
              <TabsTrigger value="ai" className="gap-1 text-xs px-2">
                <Bot className="h-3.5 w-3.5" />
                AI
              </TabsTrigger>
            </TabsList>
            <TabsContent value="chat" className="flex-1 flex flex-col min-h-0 m-0 p-2">
              <div className="flex-1 overflow-y-auto space-y-1.5 border rounded-md p-1.5 bg-muted/20 min-h-0">
                {chatMessages.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-3">No messages yet. Say hi!</p>
                ) : (
                  chatMessages.map((m) => (
                    <div
                      key={m.id}
                      className={`text-xs p-1.5 rounded max-w-[95%] ${m.from === "me" ? "ml-auto bg-primary/20" : "bg-muted/50"}`}
                    >
                      <span className="font-medium text-[10px] text-muted-foreground">
                        {m.from === "me" ? "You" : opponentName}
                      </span>
                      <p className="mt-0.5 break-words">{m.text}</p>
                    </div>
                  ))
                )}
              </div>
              <div className="flex gap-1.5 mt-1.5 shrink-0">
                <input
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendChat()}
                  placeholder="Type a message..."
                  className="flex-1 min-w-0 rounded border bg-background px-2 py-1.5 text-xs"
                />
                <Button size="icon" className="h-8 w-8 shrink-0" onClick={sendChat}>
                  <Send className="h-3.5 w-3.5" />
                </Button>
              </div>
            </TabsContent>
            <TabsContent value="voice" className="flex-1 m-0 p-2 overflow-y-auto">
              <Card className="text-sm">
                <CardHeader className="p-3 pb-0">
                  <CardTitle className="text-sm">Voice & recording</CardTitle>
                  <CardDescription className="text-xs">
                    Join voice (demo). Real 1v1 voice needs WebRTC + backend.
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-3 flex flex-wrap gap-1.5">
                  <Button
                    variant={voiceJoined ? "destructive" : "default"}
                    size="sm"
                    onClick={toggleVoice}
                    className="gap-1.5 text-xs"
                  >
                    {voiceJoined ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                    {voiceJoined ? "Leave voice" : "Join voice"}
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setMuted(!muted)}
                    disabled={!voiceJoined}
                    title={muted ? "Unmute" : "Mute"}
                  >
                    {muted ? <MicOff className="h-3.5 w-3.5" /> : <Mic className="h-3.5 w-3.5" />}
                  </Button>
                  <Button
                    variant={recording ? "destructive" : "outline"}
                    size="sm"
                    onClick={toggleRecord}
                    className="gap-1.5 text-xs"
                  >
                    <Square className="h-3.5 w-3.5" />
                    {recording ? "Stop recording" : "Start recording"}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="ai" className="flex-1 m-0 p-2 overflow-y-auto">
              <Card className="text-sm">
                <CardHeader className="p-3 pb-0">
                  <CardTitle className="text-sm flex items-center gap-1.5">
                    <Bot className="h-3.5 w-3.5" />
                    AI explanation
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Get problem or solution explained by AI.
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-3 space-y-2">
                  <div className="flex flex-wrap gap-1.5">
                    <Button variant="outline" size="sm" className="text-xs" onClick={() => askAi("problem")} disabled={aiLoading}>
                      Explain problem
                    </Button>
                    <Button variant="outline" size="sm" className="text-xs" onClick={() => askAi("solution")} disabled={aiLoading}>
                      Explain approach
                    </Button>
                  </div>
                  {aiLoading && (
                    <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      AI is thinking...
                    </p>
                  )}
                  {aiResponse && (
                    <div className="rounded border bg-muted/20 p-2 text-xs whitespace-pre-wrap max-h-32 overflow-y-auto">
                      {aiResponse}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Winner overlay */}
      {winner && (() => {
        const rank = ratingUpdate ? getRankTier(ratingUpdate.newRating) : getRankTier();
        const stats = getDuelStats();
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur">
            <Card className="max-w-sm mx-4">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-6 w-6 text-primary" />
                  {winner === "you" ? "You win!" : "Opponent wins"}
                </CardTitle>
                <CardDescription>
                  {winner === "you"
                    ? "You solved it first. Keep climbing the ranks!"
                    : "Better luck next time. Keep practicing!"}
                </CardDescription>
                {ratingUpdate && (
                  <div className="mt-3 space-y-2">
                    <p className="text-sm font-medium text-foreground">
                      Rating: {ratingUpdate.newRating}{" "}
                      <span className={ratingUpdate.change > 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}>
                        ({ratingUpdate.change > 0 ? "+" : ""}{ratingUpdate.change})
                      </span>
                    </p>
                    <p className={`text-sm font-semibold ${rank.color}`}>
                      {rank.icon} {rank.name}
                    </p>
                    <div className="flex gap-4 text-xs text-muted-foreground">
                      <span>W: {stats.wins}</span>
                      <span>L: {stats.losses}</span>
                      {stats.streak > 0 && (
                        <span className="text-green-500">🔥 {stats.streak} streak</span>
                      )}
                    </div>
                  </div>
                )}
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full">
                  <Link to="/dsa/duels">Back to duels</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        );
      })()}
    </div>
  );
}
