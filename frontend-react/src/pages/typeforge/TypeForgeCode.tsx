import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { getRandomCodeSnippet, getSyntaxClasses, type CodeLanguage } from "@/data/typingCodeSnippets";
import { Clock, Zap, RotateCcw, Maximize2, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type CodeDifficulty = "slow" | "moderate" | "fast" | "test";

const CURSOR_SPEED: Record<CodeDifficulty, number> = {
  slow: 1.2,
  moderate: 1.8,
  fast: 3.2,
  test: 0,
};

const TIMER_PRESETS = [1, 3, 5, 10];

function getSnippetForDifficulty(lang: CodeLanguage, diff: CodeDifficulty): string {
  let full = getRandomCodeSnippet(lang);
  if (diff === "slow" && full.length > 280) full = full.slice(0, 280);
  else if (diff === "moderate" && full.length > 450) full = full.slice(0, 450);
  else if (diff === "fast" && full.length > 600) full = full.slice(0, 600);
  return full;
}

export default function TypeForgeCode() {
  const [difficulty, setDifficulty] = useState<CodeDifficulty>("slow");
  const [unlocked, setUnlocked] = useState<CodeDifficulty[]>(["slow"]);
  const [language, setLanguage] = useState<string>("java");
  const [code, setCode] = useState("");
  const [input, setInput] = useState("");
  const [cursorPosition, setCursorPosition] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [timerPreset, setTimerPreset] = useState(5);
  const [failed, setFailed] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const rafRef = useRef<number>();
  const lastTimeRef = useRef<number>(0);
  const resultShownRef = useRef(false);
  const accuracyHistoryRef = useRef<number[]>([]);

  const snippetLang: CodeLanguage = language === "java" ? "javascript" : (language as CodeLanguage);
  const loadSnippet = useCallback(() => {
    setCode(getSnippetForDifficulty(snippetLang, difficulty));
    setInput("");
    setCursorPosition(0);
    setStartTime(null);
    setFailed(null);
    setShowResult(false);
    lastTimeRef.current = 0;
    resultShownRef.current = false;
    accuracyHistoryRef.current = [];
    setTimeout(() => inputRef.current?.focus(), 100);
  }, [snippetLang, difficulty]);

  useEffect(() => loadSnippet(), [loadSnippet]);

  useEffect(() => {
    if (!isFullscreen) return;
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsFullscreen(false);
    };
    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, [isFullscreen]);

  const elapsedMs = startTime ? Date.now() - startTime : 0;
  const elapsedSec = elapsedMs / 1000;
  const cursorSpeed = CURSOR_SPEED[difficulty];
  const cursorAdvances = difficulty !== "test" && startTime !== null;
  const timeLimitSec = timerPreset * 60;
  const timeUp = startTime !== null && elapsedSec >= timeLimitSec;

  useEffect(() => {
    if (!cursorAdvances || failed || showResult) return;
    const tick = (t: number) => {
      if (lastTimeRef.current === 0) lastTimeRef.current = t;
      const dt = (t - lastTimeRef.current) / 1000;
      lastTimeRef.current = t;
      setCursorPosition((prev) => Math.min(code.length, prev + cursorSpeed * dt));
    };
    rafRef.current = requestAnimationFrame((t) => {
      lastTimeRef.current = t;
      const loop = (t2: number) => {
        tick(t2);
        rafRef.current = requestAnimationFrame(loop);
      };
      rafRef.current = requestAnimationFrame(loop);
    });
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [cursorAdvances, cursorSpeed, code.length, failed, showResult]);

  useEffect(() => {
    if (failed || !startTime) return;
    if (difficulty !== "test" && input.length > 0) {
      const lag = cursorPosition - input.length;
      if (lag > 12) {
        setFailed("Cursor overtook you. Stay in sync!");
        return;
      }
      if (input.length - cursorPosition > 8) {
        setFailed("Too far ahead. Match the cursor rhythm.");
        return;
      }
    }
    if (timeUp && !resultShownRef.current) {
      resultShownRef.current = true;
      setShowResult(true);
      setUnlocked((prev) => {
        const order: CodeDifficulty[] = ["slow", "moderate", "fast", "test"];
        const idx = order.indexOf(difficulty);
        if (idx < 0 || idx >= order.length - 1) return prev;
        const next = order[idx + 1];
        return prev.includes(next) ? prev : [...prev, next];
      });
    }
  }, [cursorPosition, input.length, failed, startTime, difficulty, timeUp]);

  const correctChars = code.slice(0, input.length).split("").filter((c, i) => c === input[i]).length;
  const errors = input.length - correctChars;
  const accuracy = input.length > 0 ? Math.round((correctChars / input.length) * 100) : 100;
  const wpm = startTime && elapsedSec > 0 ? Math.round((correctChars / 5) / (elapsedSec / 60)) : 0;

  const inputLenRef = useRef(0);
  const correctCharsRef = useRef(0);
  inputLenRef.current = input.length;
  correctCharsRef.current = code.slice(0, input.length).split("").filter((c, i) => c === input[i]).length;
  useEffect(() => {
    if (!startTime || showResult || failed) return;
    const interval = setInterval(() => {
      const len = inputLenRef.current;
      const correct = correctCharsRef.current;
      const acc = len > 0 ? Math.round((correct / len) * 100) : 100;
      accuracyHistoryRef.current.push(acc);
    }, 1000);
    return () => clearInterval(interval);
  }, [startTime, showResult, failed]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Tab") {
      e.preventDefault();
      const ta = e.currentTarget;
      const start = ta.selectionStart ?? 0;
      const end = ta.selectionEnd ?? start;
      const newInput = input.slice(0, start) + "  " + input.slice(end);
      setInput(newInput);
      setTimeout(() => ta.setSelectionRange(start + 2, start + 2), 0);
    }
    if (!startTime && input.length === 0 && code.length > 0) setStartTime(Date.now());
  };

  const syntaxClasses = code ? getSyntaxClasses(code, snippetLang) : [];

  const content = (
    <div>
      <h1 style={{ fontSize: 28, marginBottom: 4, color: "#e6edf3" }}>Type Forge</h1>
      <p style={{ color: "#8b949e", marginBottom: 24 }}>Test your typing skills and practice here.</p>
      <div style={{ height: 1, background: "#1f2a36", marginBottom: 24 }} />

      <div>
        <h2 style={{ fontSize: 20, marginBottom: 4, color: "#e6edf3" }}>Code</h2>
        <p style={{ color: "#8b949e", marginBottom: 24 }}>
          Practice typing code with syntax highlighting. Timer starts on first key press.
        </p>
        <div style={{ display: "flex", gap: 40, borderBottom: "1px solid #1f2a36", marginBottom: 16 }}>
          {(["slow", "moderate", "fast", "test"] as const).map((d) => {
            const locked = !unlocked.includes(d);
            const label = d === "slow" ? "Slow" : d === "moderate" ? "Moderate" : d === "fast" ? "Fast" : "Rapid";
            const isActive = difficulty === d;
            return (
              <TooltipProvider key={d}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      onClick={() => {
                        if (locked) return;
                        setDifficulty(d);
                      }}
                      className={cn(
                        "cursor-pointer transition-all duration-150 pb-2.5",
                        locked && "cursor-not-allowed opacity-50"
                      )}
                      style={{
                        color: locked ? "#8b949e" : isActive ? "#2dd4ff" : "#8b949e",
                        fontWeight: 500,
                        borderBottom: isActive && !locked ? "2px solid #2dd4ff" : undefined,
                      }}
                    >
                      {locked && <Lock className="h-3.5 w-3.5 inline mr-1.5" />}
                      {label}
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {locked ? "Complete previous level to unlock" : label}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            );
          })}
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: 16,
            color: "#8b949e",
            fontSize: 14,
          }}
        >
          <div className="flex items-center gap-1.5">
            <Clock className="h-4 w-4" />
            {new Date().toLocaleTimeString("en-US", { hour12: false })} {new Date().toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
          </div>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <Zap className="h-4 w-4" />
              {wpm} WPM
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {startTime ? `${Math.floor(elapsedSec / 60)}:${String(Math.floor(elapsedSec % 60)).padStart(2, "0")}` : "00:00"}
            </span>
            <span className="flex items-center gap-1">
              {accuracy}%
            </span>
          </div>
        </div>

        <div className="flex gap-2 mb-4">
          {TIMER_PRESETS.map((m) => (
            <Button
              key={m}
              variant={timerPreset === m ? "default" : "outline"}
              size="sm"
              style={
                timerPreset === m
                  ? { background: "#2dd4ff", color: "#0b0f14" }
                  : { borderColor: "#1f2a36", color: "#8b949e" }
              }
              className={timerPreset === m ? "hover:opacity-90" : ""}
              onClick={() => setTimerPreset(m)}
            >
              {m} min
            </Button>
          ))}
        </div>

        <div
          ref={containerRef}
          className={cn("overflow-hidden", isFullscreen && "fixed inset-0 z-50 rounded-none")}
          style={{
            background: isFullscreen ? "#0b0f14" : "#0f141b",
            border: "1px solid #1f2a36",
            borderRadius: isFullscreen ? 0 : 10,
            padding: 16,
          }}
        >
          <div
            className="flex items-center justify-between"
            style={{ marginBottom: 12, color: "#8b949e" }}
          >
            <Select value={language} onValueChange={(v) => setLanguage(v)}>
              <SelectTrigger
                className="w-[120px] h-8 bg-transparent text-sm"
                style={{ borderColor: "#1f2a36", color: "#8b949e" }}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="java">Java</SelectItem>
                <SelectItem value="javascript">JavaScript</SelectItem>
                <SelectItem value="python">Python</SelectItem>
                <SelectItem value="sql">SQL</SelectItem>
                <SelectItem value="html">HTML</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex items-center gap-2 text-sm" style={{ color: "#8b949e" }}>
              <span style={{ color: "#2dd4ff" }}>Code</span>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={loadSnippet}>
                <RotateCcw className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setIsFullscreen(!isFullscreen)}
              >
                <Maximize2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div
            className="relative min-h-[220px] p-4 font-mono text-sm leading-[1.7] cursor-text overflow-auto"
            onClick={() => inputRef.current?.focus()}
          >
            {failed && (
              <div className="absolute inset-0 bg-red-500/10 flex items-center justify-center z-10 rounded-b-xl">
                <p className="text-red-400 font-semibold">{failed}</p>
                <Button variant="outline" size="sm" className="ml-4" onClick={loadSnippet}>
                  Retry
                </Button>
              </div>
            )}
            <div className="select-none break-all typeforge-code font-mono text-sm" style={{ color: "#8b949e" }} aria-hidden>
              {code.split("").map((char, i) => {
                const typed = input[i];
                const isCorrect = typed !== undefined ? typed === char : null;
                const isCursor = difficulty !== "test" && Math.floor(cursorPosition) === i;
                let cls = syntaxClasses[i] ?? "ty-syntax-default";
                if (isCursor) cls = "border-l-2";
                else if (isCorrect === true) cls = "";
                else if (isCorrect === false) cls = "text-red-400 bg-red-500/20";
                const style: React.CSSProperties =
                  isCursor ? { background: "rgba(45, 212, 255, 0.2)", borderColor: "#2dd4ff", color: "#e6edf3" } :
                  isCorrect === true ? { color: "#2dd4ff" } : {};
                return (
                  <span key={i} className={cls} style={style}>
                    {char === " " ? "\u00A0" : char}
                  </span>
                );
              })}
            </div>
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className="absolute inset-0 w-full h-full resize-none bg-transparent text-transparent font-mono text-sm leading-[1.7] p-4 focus:outline-none"
              style={{ zIndex: 1, caretColor: "#2dd4ff" }}
              spellCheck={false}
              readOnly={!!failed || showResult}
              aria-label="Type the code"
            />
          </div>
        </div>
      </div>

      <Dialog open={showResult} onOpenChange={(open) => !open && setShowResult(false)}>
        <DialogContent
          className="text-[#e6edf3] max-w-md backdrop-blur-sm"
          style={{ background: "#0f141b", border: "1px solid #1f2a36" }}
        >
          <DialogHeader>
            <DialogTitle style={{ color: "#2dd4ff" }}>Session Complete</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="text-center">
              <p className="text-4xl font-bold" style={{ color: "#2dd4ff" }}>{wpm}</p>
              <p className="text-sm" style={{ color: "#8b949e" }}>WPM</p>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-lg p-3" style={{ background: "rgba(255,255,255,0.05)" }}>
                <p style={{ color: "#8b949e" }}>Accuracy</p>
                <p className="text-lg font-semibold text-[#e6edf3]">{accuracy}%</p>
              </div>
              <div className="rounded-lg p-3" style={{ background: "rgba(255,255,255,0.05)" }}>
                <p style={{ color: "#8b949e" }}>Errors</p>
                <p className="text-lg font-semibold text-[#e6edf3]">{errors}</p>
              </div>
              <div className="rounded-lg p-3 col-span-2" style={{ background: "rgba(255,255,255,0.05)" }}>
                <p style={{ color: "#8b949e" }}>Characters typed</p>
                <p className="text-lg font-semibold text-[#e6edf3]">{input.length}</p>
              </div>
            </div>
            {accuracyHistoryRef.current.length > 0 && (
              <div className="rounded-lg p-3" style={{ background: "rgba(255,255,255,0.05)" }}>
                <p className="text-sm mb-2" style={{ color: "#8b949e" }}>Accuracy over time</p>
                <div className="h-20 w-full flex items-end gap-0.5">
                  {accuracyHistoryRef.current.map((acc, i) => (
                    <div
                      key={i}
                      className="flex-1 min-w-0 rounded-t"
                      style={{ height: `${acc}%`, background: "rgba(45, 212, 255, 0.6)" }}
                      title={`${acc}%`}
                    />
                  ))}
                </div>
                <div className="flex justify-between text-xs mt-1" style={{ color: "#8b949e" }}>
                  <span>0s</span>
                  <span>{accuracyHistoryRef.current.length}s</span>
                </div>
              </div>
            )}
            <div className="flex gap-2 pt-2">
              <Button
                className="flex-1"
                style={{ background: "#2dd4ff", color: "#0b0f14" }}
                onClick={() => { setShowResult(false); loadSnippet(); }}
              >
                Retry
              </Button>
              <Button
                variant="outline"
                style={{ borderColor: "#1f2a36", color: "#8b949e" }}
                onClick={() => setShowResult(false)}
              >
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );

  return content;
}
