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
import { getRandomPassage, type PassageLength } from "@/data/typingPassages";
import { Clock, Zap, RotateCcw, Maximize2, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type SpellsDifficulty = "noob" | "basic" | "pro";

const CURSOR_SPEED: Record<SpellsDifficulty, number> = {
  noob: 0.8,
  basic: 1.4,
  pro: 2.4,
};

const PASSAGE_LENGTH: Record<SpellsDifficulty, PassageLength> = {
  noob: "short",
  basic: "medium",
  pro: "long",
};

const TIMER_PRESETS = [1, 3, 5, 10];

export default function TypeForgeSpells() {
  const [difficulty, setDifficulty] = useState<SpellsDifficulty>("noob");
  const [unlocked, setUnlocked] = useState<SpellsDifficulty[]>(["noob"]);
  const [passage, setPassage] = useState("");
  const [input, setInput] = useState("");
  const [cursorPosition, setCursorPosition] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [timerPreset, setTimerPreset] = useState(5);
  const [failed, setFailed] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const rafRef = useRef<number>();
  const lastTimeRef = useRef<number>(0);
  const resultShownRef = useRef(false);
  const accuracyHistoryRef = useRef<number[]>([]);
  const inputLenRef = useRef(0);
  const correctCharsRef = useRef(0);

  const loadPassage = useCallback(() => {
    setPassage(getRandomPassage(PASSAGE_LENGTH[difficulty]));
    setInput("");
    setCursorPosition(0);
    setStartTime(null);
    setFailed(null);
    setShowResult(false);
    lastTimeRef.current = 0;
    resultShownRef.current = false;
    accuracyHistoryRef.current = [];
    setTimeout(() => inputRef.current?.focus(), 100);
  }, [difficulty]);

  useEffect(() => loadPassage(), [loadPassage]);

  const elapsedMs = startTime ? Date.now() - startTime : 0;
  const elapsedSec = elapsedMs / 1000;
  const cursorSpeed = CURSOR_SPEED[difficulty];
  const cursorAdvances = startTime !== null;
  const timeLimitSec = timerPreset * 60;
  const timeUp = startTime !== null && elapsedSec >= timeLimitSec;

  useEffect(() => {
    if (!cursorAdvances || failed || showResult) return;
    const tick = (t: number) => {
      if (lastTimeRef.current === 0) lastTimeRef.current = t;
      const dt = (t - lastTimeRef.current) / 1000;
      lastTimeRef.current = t;
      setCursorPosition((prev) => Math.min(passage.length, prev + cursorSpeed * dt));
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
  }, [cursorAdvances, cursorSpeed, passage.length, failed, showResult]);

  useEffect(() => {
    if (failed || !startTime) return;
    if (input.length > 0) {
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
        const order: SpellsDifficulty[] = ["noob", "basic", "pro"];
        const idx = order.indexOf(difficulty);
        if (idx < 0 || idx >= order.length - 1) return prev;
        const next = order[idx + 1];
        return prev.includes(next) ? prev : [...prev, next];
      });
    }
  }, [cursorPosition, input.length, failed, startTime, difficulty, timeUp]);

  correctCharsRef.current = passage.slice(0, input.length).split("").filter((c, i) => c === input[i]).length;
  inputLenRef.current = input.length;
  const errors = input.length - correctCharsRef.current;
  const accuracy = input.length > 0 ? Math.round((correctCharsRef.current / input.length) * 100) : 100;
  const wpm = startTime && elapsedSec > 0 ? Math.round((correctCharsRef.current / 5) / (elapsedSec / 60)) : 0;

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

  useEffect(() => {
    if (!isFullscreen) return;
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsFullscreen(false);
    };
    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, [isFullscreen]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (!startTime && input.length === 0 && passage.length > 0) setStartTime(Date.now());
  };

  const tabs = [
    { id: "noob" as const, label: "Noob" },
    { id: "basic" as const, label: "Basic" },
    { id: "pro" as const, label: "Pro" },
  ];

  return (
    <div className="space-y-6">
      <div className="text-center space-y-1">
        <h1 className="text-2xl font-medium text-white">Type Forge</h1>
        <p className="text-sm text-slate-400">Test your typing skills and practice here.</p>
      </div>
      <div className="h-px bg-white/10" />

      <div>
        <h2 className="text-lg font-medium text-cyan-400 mb-1">Spells</h2>
        <p className="text-sm text-slate-400 mb-4">
          Practice typing with syntax highlighting. Timer starts on first key press.
        </p>
        <div className="inline-flex h-10 p-0.5 rounded-lg bg-white/5 border border-white/10 gap-0">
          {tabs.map(({ id, label }) => {
            const locked = !unlocked.includes(id);
            return (
              <TooltipProvider key={id}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      onClick={() => { if (!locked) setDifficulty(id); }}
                      className={cn(
                        "px-4 py-2 text-sm font-semibold rounded-md transition-all duration-150",
                        locked && "cursor-not-allowed opacity-50 text-slate-500",
                        !locked && difficulty === id && "bg-cyan-500/20 text-cyan-400 border-b-2 border-cyan-400",
                        !locked && difficulty !== id && "text-slate-400 hover:text-white"
                      )}
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

        <div className="mt-4 flex items-center justify-between flex-wrap gap-2 py-2 px-3 rounded-lg bg-white/5 border border-white/10">
          <span className="text-slate-500 text-sm flex items-center gap-2">
            <Clock className="h-4 w-4" />
            {new Date().toLocaleTimeString("en-US", { hour12: false })} {new Date().toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
          </span>
          <div className="flex items-center gap-4 text-slate-400 text-sm">
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {startTime ? `${Math.floor(elapsedSec / 60)}:${String(Math.floor(elapsedSec % 60)).padStart(2, "0")}` : "00:00"}
            </span>
            <span className="flex items-center gap-1">
              <Zap className="h-4 w-4" />
              {wpm} WPM
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {timerPreset} min
            </span>
            <span className="flex items-center gap-1">
              {accuracy}%
            </span>
          </div>
        </div>

        <div className="flex gap-2 mb-2">
          {TIMER_PRESETS.map((m) => (
            <Button
              key={m}
              variant={timerPreset === m ? "default" : "outline"}
              size="sm"
              className={timerPreset === m ? "bg-cyan-600 hover:bg-cyan-500" : "border-white/20 text-slate-400"}
              onClick={() => setTimerPreset(m)}
            >
              {m} min
            </Button>
          ))}
        </div>

        <div className={cn(isFullscreen && "fixed inset-0 z-50 flex items-center justify-center p-6 bg-[#1A1B22]")}>
          <div className={cn("rounded-xl border border-white/10 bg-[#1E2026] overflow-hidden", isFullscreen && "w-full max-w-4xl max-h-[90vh] flex flex-col")}>
            <div className="flex items-center justify-between px-4 py-2 border-b border-white/10">
              <Select value="english" onValueChange={() => {}}>
                <SelectTrigger className="w-[120px] h-8 bg-transparent border-white/20 text-slate-300 text-sm">
                  <SelectValue placeholder="English" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="english">English</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex items-center gap-2 text-slate-500 text-sm">
                <span className="text-cyan-400">Spells</span>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={loadPassage}>
                  <RotateCcw className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setIsFullscreen(!isFullscreen)}>
                  <Maximize2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div
              className={cn("relative min-h-[220px] p-4 font-mono text-sm leading-[1.7] cursor-text overflow-auto", isFullscreen && "flex-1 min-h-0")}
              onClick={() => inputRef.current?.focus()}
            >
              {failed && (
                <div className="absolute inset-0 bg-red-500/10 flex items-center justify-center z-10 rounded-b-xl">
                  <p className="text-red-400 font-semibold">{failed}</p>
                  <Button variant="outline" size="sm" className="ml-4" onClick={loadPassage}>
                    Retry
                  </Button>
                </div>
              )}
              <div className="select-none break-all" aria-hidden>
                {passage.split("").map((char, i) => {
                  const typed = input[i];
                  const isCorrect = typed !== undefined ? typed === char : null;
                  const isCursor = Math.floor(cursorPosition) === i;
                  let cls = "text-slate-500";
                  if (isCursor) cls = "bg-cyan-500/30 border-l-2 border-cyan-400";
                  else if (isCorrect === true) cls = "text-cyan-400";
                  else if (isCorrect === false) cls = "text-red-400 bg-red-500/20";
                  return (
                    <span key={i} className={cls}>
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
                className="absolute inset-0 w-full h-full resize-none bg-transparent text-transparent caret-cyan-400 font-mono text-sm leading-[1.7] p-4 focus:outline-none"
                style={{ zIndex: 1 }}
                spellCheck={false}
                readOnly={!!failed || showResult}
                aria-label="Type the passage"
              />
            </div>
          </div>
        </div>
      </div>

      <Dialog open={showResult} onOpenChange={(open) => !open && setShowResult(false)}>
        <DialogContent className="bg-[#1E2026] border-white/10 text-white max-w-md backdrop-blur-sm">
          <DialogHeader>
            <DialogTitle className="text-cyan-400">Session Complete</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="text-center">
              <p className="text-4xl font-bold text-cyan-400">{wpm}</p>
              <p className="text-slate-400 text-sm">WPM</p>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-lg bg-white/5 p-3">
                <p className="text-slate-500">Accuracy</p>
                <p className="text-lg font-semibold text-white">{accuracy}%</p>
              </div>
              <div className="rounded-lg bg-white/5 p-3">
                <p className="text-slate-500">Errors</p>
                <p className="text-lg font-semibold text-white">{errors}</p>
              </div>
              <div className="rounded-lg bg-white/5 p-3 col-span-2">
                <p className="text-slate-500">Characters typed</p>
                <p className="text-lg font-semibold text-white">{input.length}</p>
              </div>
            </div>
            {accuracyHistoryRef.current.length > 0 && (
              <div className="rounded-lg bg-white/5 p-3">
                <p className="text-slate-500 text-sm mb-2">Accuracy over time</p>
                <div className="h-20 w-full flex items-end gap-0.5">
                  {accuracyHistoryRef.current.map((acc, i) => (
                    <div
                      key={i}
                      className="flex-1 min-w-0 rounded-t bg-cyan-500/60"
                      style={{ height: `${acc}%` }}
                      title={`${acc}%`}
                    />
                  ))}
                </div>
                <div className="flex justify-between text-xs text-slate-500 mt-1">
                  <span>0s</span>
                  <span>{accuracyHistoryRef.current.length}s</span>
                </div>
              </div>
            )}
            <div className="flex gap-2 pt-2">
              <Button
                className="flex-1 bg-cyan-600 hover:bg-cyan-500"
                onClick={() => { setShowResult(false); loadPassage(); }}
              >
                Retry
              </Button>
              <Button variant="outline" className="border-white/20" onClick={() => setShowResult(false)}>
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
