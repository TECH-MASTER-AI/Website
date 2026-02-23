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
import { 
  RotateCcw, Maximize2, Trophy, Target, Flame, Star, Clock, Zap, 
  X, Award, TrendingUp, Eye,
  Code2, Sparkles, Volume2, VolumeX
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type CodeDifficulty = "beginner" | "intermediate" | "advanced" | "expert";

const CURSOR_SPEED: Record<CodeDifficulty, number> = {
  beginner: 0.8,
  intermediate: 1.5,
  advanced: 2.5,
  expert: 4.0,
};

const DIFFICULTY_CONFIG = {
  beginner: { 
    label: "Beginner", 
    color: "from-green-400 to-emerald-500",
    minLines: 40,
    maxLines: 60,
    description: "Simple functions and basic logic"
  },
  intermediate: { 
    label: "Intermediate", 
    color: "from-blue-400 to-cyan-500",
    minLines: 60,
    maxLines: 90,
    description: "Classes, APIs, and complex logic"
  },
  advanced: { 
    label: "Advanced", 
    color: "from-purple-400 to-pink-500",
    minLines: 90,
    maxLines: 120,
    description: "Full applications and systems"
  },
  expert: { 
    label: "Expert", 
    color: "from-red-400 to-orange-500",
    minLines: 120,
    maxLines: 150,
    description: "Enterprise-level architecture"
  }
};

function getSnippetForDifficulty(lang: CodeLanguage, diff: CodeDifficulty): string {
  let full = getRandomCodeSnippet(lang);
  const config = DIFFICULTY_CONFIG[diff];
  
  // Split into lines for better control
  const lines = full.split('\n');
  
  // If we have enough lines, just trim to max
  if (lines.length >= config.minLines) {
    if (lines.length > config.maxLines) {
      return lines.slice(0, config.maxLines).join('\n');
    }
    return full;
  }
  
  // If we need more lines, try to get another snippet and combine carefully
  let attempts = 0;
  while (lines.length < config.minLines && attempts < 3) {
    const additionalSnippet = getRandomCodeSnippet(lang);
    const additionalLines = additionalSnippet.split('\n');
    
    // Add a separator comment and the new snippet
    lines.push('', '// Additional code section', '');
    lines.push(...additionalLines);
    attempts++;
    
    // Safety check to prevent infinite strings
    if (lines.length > config.maxLines * 2) {
      break;
    }
  }
  
  // Final trim to max length
  const finalLines = lines.slice(0, Math.min(lines.length, config.maxLines));
  return finalLines.join('\n');
}

// Create a stable snippet cache to prevent continuous changes
const snippetCache = new Map<string, string>();

function getStableSnippet(lang: CodeLanguage, diff: CodeDifficulty, forceNew: boolean = false): string {
  const cacheKey = `${lang}-${diff}`;
  
  if (!forceNew && snippetCache.has(cacheKey)) {
    return snippetCache.get(cacheKey)!;
  }
  
  const snippet = getSnippetForDifficulty(lang, diff);
  snippetCache.set(cacheKey, snippet);
  return snippet;
}

interface TypeForgeCodeProps {
  onStartTimer?: () => void;
  onStopTimer?: () => void;
  onResetTimer?: () => void;
  onUpdateStats?: (wpm: number, accuracy: number, errors: number, progress: number) => void;
  isTimerRunning?: boolean;
  timerSeconds?: number;
}
export function TypeForgeCode({
  onStartTimer,
  onStopTimer,
  onResetTimer,
  onUpdateStats,
  isTimerRunning,
  timerSeconds = 0,
}: TypeForgeCodeProps = {}) {
  // Core state
  const [difficulty, setDifficulty] = useState<CodeDifficulty>("beginner");
  const [unlocked, setUnlocked] = useState<CodeDifficulty[]>(["beginner", "intermediate", "advanced", "expert"]);
  const [language, setLanguage] = useState<string>("javascript");
  const [code, setCode] = useState("");
  const [input, setInput] = useState("");
  const [cursorPosition, setCursorPosition] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [failed, setFailed] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // Game state
  const [combo, setCombo] = useState(0);
  const [score, setScore] = useState(0);
  const [xp, setXp] = useState(0);
  const [level, setLevel] = useState(1);
  const [perfectLines, setPerfectLines] = useState(0);
  const [speedBursts, setSpeedBursts] = useState(0);
  
  // Visual feedback state
  const [showCombo, setShowCombo] = useState(false);
  const [showPerfectLine, setShowPerfectLine] = useState(false);
  const [showSpeedBurst, setShowSpeedBurst] = useState(false);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [glowEffect, setGlowEffect] = useState(false);
  const [lineGlow, setLineGlow] = useState<number | null>(null);
  
  // Remove unused creepy animation states that were causing re-renders
  
  // Settings
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showStats, setShowStats] = useState(true);
  const [fontSize] = useState(18); // Remove setFontSize as it's unused
  
  // Internal timer state
  const [internalTimerRunning, setInternalTimerRunning] = useState(false);
  const [internalTimerSeconds, setInternalTimerSeconds] = useState(0);
  
  // Refs
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const codeDisplayRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>();
  const lastTimeRef = useRef<number>(0);
  const resultShownRef = useRef(false);
  const accuracyHistoryRef = useRef<number[]>([]);
  const lastWpmRef = useRef<number>(0);
  const currentLineRef = useRef<number>(0);
  const audioContextRef = useRef<AudioContext | null>(null);

  const snippetLang: CodeLanguage = language === "java" ? "javascript" : (language as CodeLanguage);
  
  // Use internal timer if no external timer provided
  const currentTimerSeconds = timerSeconds || internalTimerSeconds;
  
  // Internal timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (internalTimerRunning && !isTimerRunning) {
      interval = setInterval(() => {
        setInternalTimerSeconds(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [internalTimerRunning, isTimerRunning]);

  // Audio feedback
  const playSound = useCallback((type: 'correct' | 'error' | 'combo' | 'complete' | 'perfect') => {
    if (!soundEnabled || !audioContextRef.current) return;
    
    const ctx = audioContextRef.current;
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    const frequencies = {
      correct: 800,
      error: 200,
      combo: 1200,
      complete: 600,
      perfect: 1000
    };
    
    oscillator.frequency.setValueAtTime(frequencies[type], ctx.currentTime);
    gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
    
    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.1);
  }, [soundEnabled]);

  // Initialize audio context
  useEffect(() => {
    if (soundEnabled && !audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  }, [soundEnabled]);

  // Load new snippet - STABLE VERSION to prevent continuous changes
  const loadSnippet = useCallback((forceNew: boolean = false) => {
    try {
      // Stop any running animations first
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = undefined;
      }
      
      const newCode = getStableSnippet(snippetLang, difficulty, forceNew);
      setCode(newCode);
      setInput("");
      setCursorPosition(0);
      setStartTime(null);
      setFailed(null);
      setShowResult(false);
      setCombo(0);
      setPerfectLines(0);
      setSpeedBursts(0);
      lastTimeRef.current = 0;
      resultShownRef.current = false;
      accuracyHistoryRef.current = [];
      lastWpmRef.current = 0;
      currentLineRef.current = 0;
      setLineGlow(null);
      
      // Reset timer
      if (onResetTimer) {
        onResetTimer();
      } else {
        setInternalTimerRunning(false);
        setInternalTimerSeconds(0);
      }
      
      setTimeout(() => inputRef.current?.focus(), 100);
    } catch (error) {
      console.error('Error loading snippet:', error);
      // Fallback to a simple snippet
      setCode(`// Simple fallback code
function hello() {
  console.log("Hello, World!");
  return "Welcome to TypeForge!";
}

const message = hello();
console.log(message);`);
      setInput("");
      setCursorPosition(0);
      setStartTime(null);
      setFailed(null);
      setShowResult(false);
    }
  }, [snippetLang, difficulty, onResetTimer]); // Only essential dependencies

  // Load snippet only when language or difficulty changes - PREVENT CONTINUOUS CHANGES
  useEffect(() => {
    loadSnippet(false); // Never force new on automatic reload
  }, [snippetLang, difficulty]); // Remove loadSnippet from dependencies to prevent infinite loop

  // Cleanup effect to stop all animations on unmount
  useEffect(() => {
    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);
  // Fullscreen handling
  useEffect(() => {
    if (!isFullscreen) return;
    
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsFullscreen(false);
    };
    
    const onResize = () => {
      if (codeDisplayRef.current) {
        codeDisplayRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    };
    
    window.addEventListener("keydown", onEsc);
    window.addEventListener("resize", onResize);
    
    return () => {
      window.removeEventListener("keydown", onEsc);
      window.removeEventListener("resize", onResize);
    };
  }, [isFullscreen]);

  // Game mechanics calculations
  const elapsedMs = startTime ? Date.now() - startTime : 0;
  const elapsedSec = elapsedMs / 1000;
  const cursorSpeed = CURSOR_SPEED[difficulty];
  const cursorAdvances = startTime !== null && !failed && !showResult && input.length > 0;

  const correctChars = code.slice(0, input.length).split("").filter((c, i) => c === input[i]).length;
  const errors = input.length - correctChars;
  const accuracy = input.length > 0 ? Math.round((correctChars / input.length) * 100) : 100;
  const wpm = startTime && elapsedSec > 0 ? Math.round((correctChars / 5) / (elapsedSec / 60)) : 0;
  const progress = Math.min(100, (input.length / code.length) * 100);

  // Calculate level and XP
  const requiredXpForLevel = (level: number) => level * 1000;
  const currentLevelXp = xp % requiredXpForLevel(level + 1);
  const xpProgress = (currentLevelXp / requiredXpForLevel(level + 1)) * 100;

  // Update parent stats
  useEffect(() => {
    if (onUpdateStats) {
      onUpdateStats(wpm, accuracy, errors, progress);
    }
  }, [wpm, accuracy, errors, progress, onUpdateStats]);

  // Start timer on first input
  useEffect(() => {
    if (input.length === 1 && !startTime) {
      setStartTime(Date.now());
      if (onStartTimer) {
        onStartTimer();
      } else {
        setInternalTimerRunning(true);
      }
    }
  }, [input.length, startTime, onStartTimer]);

  // Speed burst detection
  useEffect(() => {
    if (wpm > lastWpmRef.current + 25 && wpm > 80) {
      setSpeedBursts(prev => prev + 1);
      setShowSpeedBurst(true);
      setGlowEffect(true);
      playSound('combo');
      
      setTimeout(() => {
        setShowSpeedBurst(false);
        setGlowEffect(false);
      }, 2000);
    }
    lastWpmRef.current = wpm;
  }, [wpm, playSound]);
  // Line completion detection
  useEffect(() => {
    const lines = input.split('\n');
    const currentLine = lines.length - 1;
    
    if (currentLine > currentLineRef.current) {
      const lineStart = input.lastIndexOf('\n', input.length - 2) + 1;
      const lineEnd = input.lastIndexOf('\n');
      const lineText = input.slice(lineStart, lineEnd === -1 ? input.length : lineEnd);
      const expectedLineText = code.slice(lineStart, lineStart + lineText.length);
      
      const lineAccuracy = lineText.length > 0 ? 
        (lineText.split('').filter((c, i) => c === expectedLineText[i]).length / lineText.length) * 100 : 100;
      
      if (lineText === expectedLineText && lineText.trim().length > 5) {
        setPerfectLines(prev => prev + 1);
        setCombo(prev => prev + 1);
        setLineGlow(currentLine);
        setShowPerfectLine(true);
        playSound('perfect');
        
        setTimeout(() => {
          setShowPerfectLine(false);
          setLineGlow(null);
        }, 1500);
        
        if (combo > 0 && combo % 5 === 0) {
          setShowCombo(true);
          setTimeout(() => setShowCombo(false), 2000);
        }
      } else if (lineAccuracy < 95) {
        setCombo(0); // Break combo on poor accuracy
      }
      
      currentLineRef.current = currentLine;
    }
  }, [input, code, combo, playSound]);

  // Cursor movement animation - FIXED to prevent continuous running
  useEffect(() => {
    // Clear any existing animation first
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = undefined;
    }

    if (!cursorAdvances || failed || showResult) {
      return;
    }
    
    const tick = (t: number) => {
      if (lastTimeRef.current === 0) lastTimeRef.current = t;
      const dt = (t - lastTimeRef.current) / 1000;
      lastTimeRef.current = t;
      
      setCursorPosition((prev) => {
        const newPos = Math.min(code.length, prev + cursorSpeed * dt);
        return newPos;
      });
    };
    
    const startAnimation = (t: number) => {
      lastTimeRef.current = t;
      const loop = (t2: number) => {
        tick(t2);
        // Check conditions before continuing
        if (cursorPosition < code.length && !failed && !showResult && startTime !== null && input.length > 0) {
          rafRef.current = requestAnimationFrame(loop);
        } else {
          // Stop animation when conditions are no longer met
          rafRef.current = undefined;
        }
      };
      rafRef.current = requestAnimationFrame(loop);
    };
    
    rafRef.current = requestAnimationFrame(startAnimation);
    
    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = undefined;
      }
    };
  }, [cursorAdvances, cursorSpeed, code.length, failed, showResult, startTime, input.length]); // Added missing dependencies

  // Game over conditions and completion
  useEffect(() => {
    if (failed || !startTime) return;
    
    // Check cursor lag (only for non-beginner modes)
    if (difficulty !== "beginner" && input.length > 0) {
      const lag = cursorPosition - input.length;
      if (lag > 15) {
        setFailed("Cursor overtook you! Stay in sync with the flow.");
        if (onStopTimer) {
          onStopTimer();
        } else {
          setInternalTimerRunning(false);
        }
        playSound('error');
        return;
      }
      if (input.length - cursorPosition > 12) {
        setFailed("Too far ahead! Match the cursor rhythm.");
        if (onStopTimer) {
          onStopTimer();
        } else {
          setInternalTimerRunning(false);
        }
        playSound('error');
        return;
      }
    }
    
    // Check completion
    if (input.length >= code.length && !resultShownRef.current) {
      resultShownRef.current = true;
      if (onStopTimer) {
        onStopTimer();
      } else {
        setInternalTimerRunning(false);
      }
      
      // Calculate final score and rewards
      const timeBonus = Math.max(0, 300 - elapsedSec) * 10;
      const accuracyBonus = accuracy > 95 ? 500 : accuracy > 90 ? 300 : accuracy > 85 ? 100 : 0;
      const comboBonus = combo * 50;
      const perfectLineBonus = perfectLines * 100;
      const speedBurstBonus = speedBursts * 200;
      
      const finalScore = Math.round(
        wpm * 10 + 
        timeBonus + 
        accuracyBonus + 
        comboBonus + 
        perfectLineBonus + 
        speedBurstBonus
      );
      
      const earnedXp = Math.round(finalScore * 0.8 + perfectLines * 50 + (accuracy > 95 ? 200 : 0));
      
      setScore(finalScore);
      const newXp = xp + earnedXp;
      setXp(newXp);
      
      // Check for level up
      const newLevel = Math.floor(newXp / 1000) + 1;
      if (newLevel > level) {
        setLevel(newLevel);
        setShowLevelUp(true);
        setTimeout(() => setShowLevelUp(false), 3000);
      }
      
      setShowResult(true);
      playSound('complete');
      
      // All levels are already unlocked - just show completion celebration
    }
  }, [cursorPosition, input.length, failed, startTime, difficulty, wpm, accuracy, combo, perfectLines, speedBursts, code.length, onStopTimer, elapsedSec, xp, level, playSound]);
  // Auto-scroll to keep current line visible
  useEffect(() => {
    if (codeDisplayRef.current && input.length > 0) {
      const lines = input.split('\n');
      const currentLineIndex = lines.length - 1;
      const lineHeight = fontSize * 1.6; // Approximate line height
      const scrollTop = Math.max(0, (currentLineIndex - 10) * lineHeight);
      
      codeDisplayRef.current.scrollTop = scrollTop;
    }
  }, [input, fontSize]);

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
  };

  const syntaxClasses = code ? getSyntaxClasses(code, snippetLang) : [];

  // Safety check for syntax classes
  const getSafeClassName = (index: number) => {
    try {
      return syntaxClasses[index] ?? "text-gray-300";
    } catch (error) {
      return "text-gray-300";
    }
  };

  // Fullscreen component
  if (isFullscreen) {
    return (
      <div className="fixed inset-0 z-50 bg-black text-white overflow-hidden">
        {/* Fullscreen Header */}
        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-900 to-black border-b border-gray-700">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Code2 className="h-6 w-6 text-cyan-400" />
              <span className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                TypeForge Code
              </span>
            </div>
            
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-gray-800 border border-gray-600">
              <div className={`w-2 h-2 rounded-full ${DIFFICULTY_CONFIG[difficulty].color.replace('from-', 'bg-').split(' ')[0]}`} />
              <span className="text-sm font-medium">{DIFFICULTY_CONFIG[difficulty].label}</span>
            </div>
          </div>

          {/* Live Stats Bar */}
          {showStats && (
            <div className="flex items-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-yellow-400" />
                <span className="font-mono text-lg font-bold text-yellow-400">{wpm}</span>
                <span className="text-gray-400">WPM</span>
              </div>
              
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-green-400" />
                <span className="font-mono text-lg font-bold text-green-400">{accuracy}%</span>
                <span className="text-gray-400">ACC</span>
              </div>
              
              <div className="flex items-center gap-2">
                <Flame className="h-4 w-4 text-orange-400" />
                <span className="font-mono text-lg font-bold text-orange-400">{combo}</span>
                <span className="text-gray-400">COMBO</span>
              </div>
              
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-purple-400" />
                <span className="font-mono text-lg font-bold text-purple-400">{score.toLocaleString()}</span>
                <span className="text-gray-400">SCORE</span>
              </div>
              
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-blue-400" />
                <span className="font-mono text-lg font-bold text-blue-400">
                  {Math.floor(currentTimerSeconds / 60)}:{(currentTimerSeconds % 60).toString().padStart(2, '0')}
                </span>
              </div>
            </div>
          )}

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="text-gray-400 hover:text-white"
            >
              {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowStats(!showStats)}
              className="text-gray-400 hover:text-white"
            >
              <Eye className="h-4 w-4" />
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsFullscreen(false)}
              className="text-gray-400 hover:text-white"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
        {/* Progress Bar */}
        <div className="h-1 bg-gray-800">
          <div 
            className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Main Editor Area */}
        <div className="flex-1 flex relative overflow-hidden">
          {/* Line Numbers */}
          <div className="w-20 bg-gray-900 border-r border-gray-700 p-4 font-mono text-sm text-gray-500 select-none overflow-hidden">
            {code.split('\n').map((_, i) => (
              <div 
                key={i} 
                className={cn(
                  "text-right pr-4 leading-relaxed transition-colors",
                  lineGlow === i && "text-cyan-400 font-bold"
                )}
                style={{ lineHeight: `${fontSize * 1.6}px` }}
              >
                {i + 1}
              </div>
            ))}
          </div>

          {/* Code Area */}
          <div className="flex-1 relative bg-black">
            {failed && (
              <div className="absolute inset-0 flex items-center justify-center z-20 bg-red-900/20 backdrop-blur-sm">
                <div className="bg-gray-900 border border-red-500 rounded-xl p-8 text-center max-w-md shadow-2xl">
                  <div className="text-red-400 text-6xl mb-4">⚠️</div>
                  <p className="text-xl font-semibold mb-4 text-red-400">{failed}</p>
                  <Button 
                    onClick={() => loadSnippet(true)}
                    className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold px-6 py-3"
                  >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Try Again
                  </Button>
                </div>
              </div>
            )}

            <div 
              ref={codeDisplayRef}
              className={cn(
                "h-full p-6 font-mono leading-relaxed cursor-text overflow-auto typeforge-code-display",
                glowEffect && "animate-pulse"
              )}
              onClick={() => inputRef.current?.focus()}
              style={{ 
                fontSize: `${fontSize}px`,
                lineHeight: `${fontSize * 1.6}px`
              }}
            >
              {/* Code Display with Enhanced Syntax Highlighting - REAL CODE ALIGNMENT */}
              <div className="select-none code-preserve-formatting typeforge-code-display" aria-hidden>
                {code.split("").map((char, i) => {
                  const typed = input[i];
                  const isCorrect = typed !== undefined ? typed === char : null;
                  const isCursor = Math.floor(cursorPosition) === i;
                  
                  let className = getSafeClassName(i);
                  
                  if (isCursor) {
                    className += " border-l-2 border-cyan-400 animate-pulse bg-cyan-400/10";
                  } else if (isCorrect === true) {
                    className = "text-green-400";
                  } else if (isCorrect === false) {
                    className = "text-red-400 bg-red-400/20 animate-pulse";
                  }
                  
                  return (
                    <span 
                      key={i} 
                      className={className}
                    >
                      {char}
                    </span>
                  );
                })}
              </div>
              
              {/* Invisible Input Overlay */}
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                className="absolute inset-0 w-full h-full resize-none bg-transparent text-transparent font-mono focus:outline-none typeforge-code-display"
                style={{ 
                  fontSize: `${fontSize}px`,
                  lineHeight: `${fontSize * 1.6}px`,
                  caretColor: "transparent",
                  whiteSpace: "pre",
                  tabSize: 2
                }}
                spellCheck={false}
                readOnly={!!failed || showResult}
                aria-label="Type the code"
              />
            </div>
          </div>
        </div>

        {/* Game Feedback Animations */}
        {showPerfectLine && (
          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 pointer-events-none">
            <div className="px-8 py-4 rounded-xl text-2xl font-bold animate-bounce bg-gradient-to-r from-green-400 to-emerald-500 text-black shadow-2xl">
              ✨ Perfect Line! ✨
            </div>
          </div>
        )}
        
        {showCombo && (
          <div className="fixed top-1/4 right-8 z-50 pointer-events-none">
            <div className="px-8 py-4 rounded-xl text-3xl font-bold animate-pulse bg-gradient-to-r from-orange-400 to-red-500 text-white shadow-2xl">
              🔥 {combo}x COMBO! 🔥
            </div>
          </div>
        )}
        
        {showSpeedBurst && (
          <div className="fixed top-1/4 left-8 z-50 pointer-events-none">
            <div className="px-8 py-4 rounded-xl text-2xl font-bold animate-bounce bg-gradient-to-r from-yellow-400 to-orange-500 text-black shadow-2xl">
              ⚡ Speed Burst! ⚡
            </div>
          </div>
        )}

        {showLevelUp && (
          <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-12 py-8 rounded-2xl text-4xl font-bold animate-bounce shadow-2xl border-4 border-white">
              🎉 LEVEL UP! 🎉
              <div className="text-xl mt-2">Level {level}</div>
            </div>
          </div>
        )}
      </div>
    );
  }
  // Regular (non-fullscreen) component
  return (
    <div className="space-y-6">
      {/* Difficulty Selection with Enhanced UI */}
      <div className="flex justify-center gap-3">
        {(["beginner", "intermediate", "advanced", "expert"] as const).map((d) => {
          const config = DIFFICULTY_CONFIG[d];
          const isActive = difficulty === d;
          
          return (
            <TooltipProvider key={d}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={isActive ? "default" : "outline"}
                    size="lg"
                    onClick={() => setDifficulty(d)}
                    className={cn(
                      "px-8 py-4 transition-all duration-300 relative overflow-hidden",
                      isActive && `bg-gradient-to-r ${config.color} text-white border-none shadow-lg`,
                      !isActive && "hover:scale-105 hover:shadow-md"
                    )}
                  >
                    <span className="font-semibold relative z-10">{config.label}</span>
                    {isActive && (
                      <div className="absolute inset-0 bg-white/20 animate-pulse" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <div className="text-center">
                    <div className="font-semibold">{config.label}</div>
                    <div className="text-sm text-gray-400">{config.description}</div>
                    <div className="text-xs text-cyan-400 mt-1">
                      {config.minLines}-{config.maxLines} lines of code
                    </div>
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          );
        })}
      </div>

      {/* Enhanced Stats Display */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 rounded-xl p-4 text-center">
          <Zap className="h-6 w-6 text-yellow-400 mx-auto mb-2" />
          <div className="text-2xl font-bold text-yellow-400">{wpm}</div>
          <div className="text-sm text-gray-400">WPM</div>
        </div>
        
        <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-xl p-4 text-center">
          <Target className="h-6 w-6 text-green-400 mx-auto mb-2" />
          <div className="text-2xl font-bold text-green-400">{accuracy}%</div>
          <div className="text-sm text-gray-400">Accuracy</div>
        </div>
        
        <div className="bg-gradient-to-br from-orange-500/10 to-red-500/10 border border-orange-500/20 rounded-xl p-4 text-center">
          <Flame className="h-6 w-6 text-orange-400 mx-auto mb-2" />
          <div className="text-2xl font-bold text-orange-400">{combo}</div>
          <div className="text-sm text-gray-400">Combo</div>
        </div>
        
        <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-xl p-4 text-center">
          <Star className="h-6 w-6 text-purple-400 mx-auto mb-2" />
          <div className="text-2xl font-bold text-purple-400">{score.toLocaleString()}</div>
          <div className="text-sm text-gray-400">Score</div>
        </div>
        
        <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-xl p-4 text-center">
          <Clock className="h-6 w-6 text-blue-400 mx-auto mb-2" />
          <div className="text-2xl font-bold text-blue-400">
            {Math.floor(currentTimerSeconds / 60)}:{(currentTimerSeconds % 60).toString().padStart(2, '0')}
          </div>
          <div className="text-sm text-gray-400">Time</div>
        </div>
      </div>

      {/* Code Editor */}
      <div className="max-w-6xl mx-auto">
        <div className="rounded-2xl overflow-hidden bg-gradient-to-br from-gray-900 to-black border border-gray-700 shadow-2xl">
          {/* Editor Header */}
          <div className="flex items-center justify-between p-6 bg-gradient-to-r from-gray-800 to-gray-900 border-b border-gray-700">
            <div className="flex items-center gap-4">
              <Select value={language} onValueChange={(v) => setLanguage(v)}>
                <SelectTrigger className="w-[160px] bg-gray-800 border-gray-600">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="javascript">JavaScript</SelectItem>
                  <SelectItem value="typescript">TypeScript</SelectItem>
                  <SelectItem value="python">Python</SelectItem>
                  <SelectItem value="sql">SQL</SelectItem>
                  <SelectItem value="html">HTML</SelectItem>
                </SelectContent>
              </Select>
              
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-gray-700 border border-gray-600">
                <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${DIFFICULTY_CONFIG[difficulty].color}`} />
                <span className="text-sm font-medium text-gray-300">{DIFFICULTY_CONFIG[difficulty].label} Mode</span>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={() => loadSnippet(true)} className="text-gray-400 hover:text-white">
                <RotateCcw className="h-4 w-4" />
              </Button>
              
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setIsFullscreen(true)}
                className="text-gray-400 hover:text-white"
              >
                <Maximize2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
          {/* Editor Content */}
          <div className="flex">
            {/* Line Numbers */}
            <div className="w-16 p-4 font-mono text-sm text-gray-500 select-none bg-gray-900 border-r border-gray-700">
              {code.split('\n').map((_, i) => (
                <div key={i} className="leading-7 text-right pr-2">
                  {i + 1}
                </div>
              ))}
            </div>
            
            {/* Code Area */}
            <div className="flex-1 relative">
              {failed && (
                <div className="absolute inset-0 flex items-center justify-center z-20 bg-red-900/20 backdrop-blur-sm">
                  <div className="bg-gray-900 border border-red-500 rounded-xl p-6 text-center max-w-md shadow-2xl">
                    <p className="text-lg font-semibold mb-4 text-red-400">{failed}</p>
                    <Button 
                      onClick={() => loadSnippet(true)}
                      className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white"
                    >
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Try Again
                    </Button>
                  </div>
                </div>
              )}
              
              <div 
                className="min-h-[500px] p-6 font-mono text-base leading-7 cursor-text overflow-auto bg-black typeforge-code-display"
                onClick={() => inputRef.current?.focus()}
              >
                {/* Code Display with Syntax Highlighting - REAL CODE ALIGNMENT */}
                <div className="select-none code-preserve-formatting typeforge-code-display" aria-hidden>
                  {code.split("").map((char, i) => {
                    const typed = input[i];
                    const isCorrect = typed !== undefined ? typed === char : null;
                    const isCursor = Math.floor(cursorPosition) === i;
                    
                    let className = getSafeClassName(i);
                    
                    if (isCursor) {
                      className += " border-l-2 border-cyan-400 animate-pulse";
                    } else if (isCorrect === true) {
                      className = "text-green-400";
                    } else if (isCorrect === false) {
                      className = "text-red-400 bg-red-400/20";
                    }
                    
                    return (
                      <span 
                        key={i} 
                        className={className}
                      >
                        {char}
                      </span>
                    );
                  })}
                </div>
                
                {/* Invisible Input Overlay */}
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="absolute inset-0 w-full h-full resize-none bg-transparent text-transparent font-mono text-base leading-7 p-6 focus:outline-none typeforge-code-display"
                  style={{ 
                    caretColor: "transparent",
                    whiteSpace: "pre",
                    tabSize: 2
                  }}
                  spellCheck={false}
                  readOnly={!!failed || showResult}
                  aria-label="Type the code"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Game Feedback Animations */}
      {showPerfectLine && (
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 pointer-events-none">
          <div className="px-6 py-3 rounded-full text-xl font-bold animate-bounce bg-gradient-to-r from-green-400 to-emerald-500 text-black shadow-2xl">
            ✨ Perfect Line! ✨
          </div>
        </div>
      )}
      
      {showCombo && (
        <div className="fixed top-1/3 right-8 z-50 pointer-events-none">
          <div className="px-8 py-4 rounded-xl text-2xl font-bold animate-pulse bg-gradient-to-r from-orange-400 to-red-500 text-white shadow-2xl">
            🔥 {combo}x COMBO! 🔥
          </div>
        </div>
      )}
      
      {showSpeedBurst && (
        <div className="fixed top-1/4 left-8 z-50 pointer-events-none">
          <div className="px-6 py-3 rounded-xl text-xl font-bold animate-bounce bg-gradient-to-r from-yellow-400 to-orange-500 text-black shadow-2xl">
            ⚡ Speed Burst! ⚡
          </div>
        </div>
      )}
      {/* Enhanced Results Modal */}
      <Dialog open={showResult} onOpenChange={(open) => !open && setShowResult(false)}>
        <DialogContent className="max-w-4xl bg-gradient-to-br from-gray-900 to-black border border-gray-700 text-white">
          <DialogHeader>
            <DialogTitle className="text-3xl font-bold text-center bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              🎉 Coding Session Complete! 🎉
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-8">
            {/* Main Performance Stats */}
            <div className="grid grid-cols-2 gap-8">
              <div className="text-center p-8 rounded-2xl bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/20">
                <Target className="h-12 w-12 mx-auto mb-4 text-cyan-400" />
                <div className="text-5xl font-bold text-cyan-400 mb-2">{wpm}</div>
                <div className="text-lg text-gray-300">Words Per Minute</div>
                <div className="text-sm text-gray-400 mt-2">
                  {wpm > 100 ? "🚀 Lightning Fast!" : wpm > 80 ? "⚡ Excellent!" : wpm > 60 ? "👍 Great!" : "📈 Keep Practicing!"}
                </div>
              </div>
              
              <div className="text-center p-8 rounded-2xl bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20">
                <Trophy className="h-12 w-12 mx-auto mb-4 text-green-400" />
                <div className="text-5xl font-bold text-green-400 mb-2">{accuracy}%</div>
                <div className="text-lg text-gray-300">Accuracy</div>
                <div className="text-sm text-gray-400 mt-2">
                  {accuracy > 95 ? "🎯 Perfect!" : accuracy > 90 ? "✨ Excellent!" : accuracy > 85 ? "👌 Good!" : "🎯 Focus on Accuracy!"}
                </div>
              </div>
            </div>
            
            {/* Game Achievement Stats */}
            <div className="grid grid-cols-4 gap-4">
              <div className="text-center p-6 rounded-xl bg-gradient-to-br from-orange-500/10 to-red-500/10 border border-orange-500/20">
                <Flame className="h-8 w-8 text-orange-400 mx-auto mb-2" />
                <div className="text-3xl font-bold text-orange-400">{combo}</div>
                <div className="text-sm text-gray-400">Max Combo</div>
              </div>
              
              <div className="text-center p-6 rounded-xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20">
                <Star className="h-8 w-8 text-purple-400 mx-auto mb-2" />
                <div className="text-3xl font-bold text-purple-400">{score.toLocaleString()}</div>
                <div className="text-sm text-gray-400">Final Score</div>
              </div>
              
              <div className="text-center p-6 rounded-xl bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border border-yellow-500/20">
                <Sparkles className="h-8 w-8 text-yellow-400 mx-auto mb-2" />
                <div className="text-3xl font-bold text-yellow-400">{perfectLines}</div>
                <div className="text-sm text-gray-400">Perfect Lines</div>
              </div>
              
              <div className="text-center p-6 rounded-xl bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/20">
                <TrendingUp className="h-8 w-8 text-cyan-400 mx-auto mb-2" />
                <div className="text-3xl font-bold text-cyan-400">{speedBursts}</div>
                <div className="text-sm text-gray-400">Speed Bursts</div>
              </div>
            </div>
            
            {/* Level Progress */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Award className="h-8 w-8 text-indigo-400" />
                  <div>
                    <div className="text-2xl font-bold text-indigo-400">Level {level}</div>
                    <div className="text-sm text-gray-400">Coding Master</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-indigo-400">+{Math.round(score * 0.8)} XP</div>
                  <div className="text-sm text-gray-400">Experience Gained</div>
                </div>
              </div>
              
              <div className="w-full bg-gray-700 rounded-full h-3 mb-2">
                <div 
                  className="h-3 rounded-full bg-gradient-to-r from-indigo-400 to-purple-500 transition-all duration-1000"
                  style={{ width: `${xpProgress}%` }}
                />
              </div>
              <div className="text-xs text-gray-400 text-center">
                {currentLevelXp.toLocaleString()} / {requiredXpForLevel(level + 1).toLocaleString()} XP to next level
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex gap-4 pt-4">
              <Button
                className="flex-1 font-semibold py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white"
                onClick={() => { setShowResult(false); loadSnippet(true); }}
              >
                <RotateCcw className="h-5 w-5 mr-2" />
                Code Another Challenge
              </Button>
              
              <Button
                variant="outline"
                className="px-8 py-3 border-gray-600 text-gray-300 hover:bg-gray-800"
                onClick={() => setShowResult(false)}
              >
                Close
              </Button>
              
              <Button
                className="px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white"
                onClick={() => setIsFullscreen(true)}
              >
                <Maximize2 className="h-4 w-4 mr-2" />
                Fullscreen Mode
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default TypeForgeCode;