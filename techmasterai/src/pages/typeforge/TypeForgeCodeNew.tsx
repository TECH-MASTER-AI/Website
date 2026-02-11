import { useState, useRef, useEffect, useCallback } from "react";
import { useBlocker } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Clock, Globe, RotateCcw, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { getRandomCodeSnippet, getSyntaxClasses, type CodeLanguage } from "@/data/typingCodeSnippets";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type CodeDifficulty = "slow" | "moderate" | "fast" | "rapid";

const DIFFICULTY_CONFIG = {
  slow: { label: "Slow", minLines: 50, maxLines: 999 },
  moderate: { label: "Moderate", minLines: 80, maxLines: 999 },
  fast: { label: "Fast", minLines: 120, maxLines: 999 },
  rapid: { label: "Rapid", minLines: 180, maxLines: 999 }
};

// Cursor speed for each difficulty (characters per second)
const CURSOR_SPEED = {
  slow: 2,      // Very slow - easy to keep up
  moderate: 4,  // Moderate speed
  fast: 6,      // Fast - challenging
  rapid: 10     // Very fast - expert level
};

export default function TypeForgeCodeNew() {
  const [difficulty, setDifficulty] = useState<CodeDifficulty>("slow");
  const [language, setLanguage] = useState<CodeLanguage>("javascript");
  const [code, setCode] = useState("");
  const [input, setInput] = useState("");
  const [startTime, setStartTime] = useState<number | null>(null);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [cursorChasingEnabled, setCursorChasingEnabled] = useState(false);
  const [cursorPosition, setCursorPosition] = useState(0);
  const [failed, setFailed] = useState(false);
  
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const animationFrameRef = useRef<number>();
  const lastUpdateTimeRef = useRef<number>(0);

  // Cursor chasing animation
  useEffect(() => {
    if (!cursorChasingEnabled || !startTime || failed) {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      return;
    }

    const speed = CURSOR_SPEED[difficulty];
    
    const animate = (currentTime: number) => {
      if (!lastUpdateTimeRef.current) {
        lastUpdateTimeRef.current = currentTime;
      }

      const deltaTime = (currentTime - lastUpdateTimeRef.current) / 1000; // Convert to seconds
      lastUpdateTimeRef.current = currentTime;

      setCursorPosition(prev => {
        const newPos = prev + (speed * deltaTime);
        
        // Check if cursor is too far ahead (user is lagging)
        const lag = newPos - input.length;
        if (lag > 15) {
          setFailed(true);
          setIsTimerRunning(false);
          return prev;
        }
        
        // Stop at end of code
        if (newPos >= code.length) {
          return code.length;
        }
        
        return newPos;
      });

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [cursorChasingEnabled, startTime, difficulty, code.length, input.length, failed]);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimerSeconds(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  // Load code snippet
  const loadSnippet = useCallback(() => {
    const config = DIFFICULTY_CONFIG[difficulty];
    let snippet = getRandomCodeSnippet(language);
    const lines = snippet.split('\n');
    
    // Don't trim - show full snippet for more content
    // Only apply minimum line requirement
    if (lines.length < config.minLines) {
      // If snippet is too short, get another one and combine
      const additionalSnippet = getRandomCodeSnippet(language);
      snippet = snippet + '\n\n// Additional code section\n\n' + additionalSnippet;
    }
    
    setCode(snippet);
    setInput("");
    setStartTime(null);
    setIsTimerRunning(false);
    setTimerSeconds(0);
    setCursorPosition(0);
    setFailed(false);
    lastUpdateTimeRef.current = 0;
    
    setTimeout(() => inputRef.current?.focus(), 100);
  }, [difficulty, language]);

  useEffect(() => {
    loadSnippet();
  }, [difficulty, language, loadSnippet]);

  // Start timer on first input
  useEffect(() => {
    if (input.length === 1 && !startTime) {
      setStartTime(Date.now());
      setIsTimerRunning(true);
      if (cursorChasingEnabled) {
        lastUpdateTimeRef.current = 0;
      }
    }
  }, [input.length, startTime, cursorChasingEnabled]);

  // Calculate stats
  const correctChars = code.slice(0, input.length).split('').filter((c, i) => c === input[i]).length;
  const elapsedSec = startTime ? (Date.now() - startTime) / 1000 : 0;
  const wpm = startTime && elapsedSec > 0 ? Math.round((correctChars / 5) / (elapsedSec / 60)) : 0;

  // Real-time WPM update effect
  const [realtimeWpm, setRealtimeWpm] = useState(0);
  
  useEffect(() => {
    if (!startTime) {
      setRealtimeWpm(0);
      return;
    }

    const interval = setInterval(() => {
      const elapsed = (Date.now() - startTime) / 1000;
      if (elapsed > 0) {
        const chars = code.slice(0, input.length).split('').filter((c, i) => c === input[i]).length;
        const calculatedWpm = Math.round((chars / 5) / (elapsed / 60));
        setRealtimeWpm(calculatedWpm);
      }
    }, 100); // Update every 100ms for smooth real-time updates

    return () => clearInterval(interval);
  }, [startTime, input.length, code]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (value.length <= code.length) {
      setInput(value);
    }
  };

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

  // Format time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Get current date/time
  const getCurrentDateTime = () => {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0');
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const day = days[now.getDay()];
    const month = months[now.getMonth()];
    const date = now.getDate();
    
    return `${hours}:${minutes}:${seconds} ${day}, ${month} ${date}`;
  };

  const [currentTime, setCurrentTime] = useState(getCurrentDateTime());

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(getCurrentDateTime());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const syntaxClasses = code ? getSyntaxClasses(code, language) : [];
  const getSafeClassName = (index: number) => {
    try {
      return syntaxClasses[index] ?? "text-gray-300";
    } catch (error) {
      return "text-gray-300";
    }
  };

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col p-6">
      {/* Code Section Title */}
      <div className="mb-4">
        <h2 className="text-xl font-semibold theme-text-primary">Code</h2>
        <p className="text-sm theme-text-secondary mt-1">
          Practice typing code with syntax highlighting. Timer starts on first key press
        </p>
      </div>

      {/* Difficulty Tabs + Timer + Language */}
      <div className="flex items-center justify-between mb-6">
        {/* Difficulty Tabs */}
        <div className="flex gap-2">
          {(["slow", "moderate", "fast", "rapid"] as const).map((d) => {
            const config = DIFFICULTY_CONFIG[d];
            const isActive = difficulty === d;
            
            return (
              <Button
                key={d}
                variant={isActive ? "default" : "outline"}
                size="sm"
                onClick={() => setDifficulty(d)}
                className={cn(
                  "px-6 py-2 transition-all",
                  isActive && "bg-cyan-500 hover:bg-cyan-600 text-white border-none"
                )}
              >
                {config.label}
              </Button>
            );
          })}
        </div>

        {/* Timer and Language */}
        <div className="flex items-center gap-6">
          {/* Timer Display */}
          <div className="flex items-center gap-2 text-sm theme-text-secondary">
            <Clock className="h-4 w-4" />
            <span className="font-mono">{currentTime}</span>
          </div>

          {/* Language Selector */}
          <div className="flex items-center gap-2">
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as CodeLanguage)}
              className="px-3 py-1.5 rounded-md border theme-border-primary bg-transparent text-sm theme-text-primary focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
              <option value="javascript">JavaScript</option>
              <option value="typescript">TypeScript</option>
              <option value="python">Python</option>
              <option value="java">Java</option>
              <option value="cpp">C++</option>
              <option value="go">Go</option>
              <option value="rust">Rust</option>
            </select>
          </div>

          {/* Refresh Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => loadSnippet()}
            className="px-3"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>

          {/* Cursor Chasing Toggle */}
          <Button
            variant={cursorChasingEnabled ? "default" : "outline"}
            size="sm"
            onClick={() => setCursorChasingEnabled(!cursorChasingEnabled)}
            className={cn(
              "px-4 gap-2",
              cursorChasingEnabled && "bg-orange-500 hover:bg-orange-600 text-white"
            )}
          >
            <Zap className="h-4 w-4" />
            Cursor Chase
          </Button>
        </div>
      </div>

      {/* Code Typing Area */}
      <div className="flex-1 rounded-xl overflow-hidden border theme-border-primary bg-gradient-to-br from-slate-900/50 to-slate-800/50 backdrop-blur-sm flex">
        {/* Failure Overlay */}
        {failed && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-red-900/20 backdrop-blur-sm">
            <div className="bg-slate-900 border-2 border-red-500 rounded-xl p-8 text-center max-w-md">
              <div className="text-red-400 text-6xl mb-4">⚠️</div>
              <p className="text-xl font-semibold mb-4 text-red-400">
                Cursor overtook you! Stay in sync with the flow.
              </p>
              <Button 
                onClick={() => loadSnippet()}
                className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold px-6 py-3"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
            </div>
          </div>
        )}

        {/* Line Numbers */}
        <div className="w-16 bg-slate-900/80 border-r theme-border-primary p-4 font-mono text-sm text-gray-500 select-none overflow-hidden">
          {code.split('\n').map((_, i) => (
            <div 
              key={i} 
              className="text-right pr-2 leading-relaxed"
              style={{ lineHeight: '1.8rem' }}
            >
              {i + 1}
            </div>
          ))}
        </div>

        {/* Code Editor */}
        <div className="flex-1 p-6 overflow-auto relative">
          {/* Text Display */}
          <div 
            className="font-mono text-lg leading-relaxed cursor-text select-none whitespace-pre"
            onClick={() => inputRef.current?.focus()}
            style={{ tabSize: 2 }}
          >
            {code.split("").map((char, i) => {
              const typed = input[i];
              const isCorrect = typed !== undefined ? typed === char : null;
              const isCurrent = i === input.length;
              const isCursorChasing = cursorChasingEnabled && Math.floor(cursorPosition) === i;
              
              let className = getSafeClassName(i);
              
              if (isCursorChasing) {
                className += " border-l-2 border-orange-400 animate-pulse bg-orange-400/20";
              } else if (isCurrent) {
                className += " border-l-2 border-cyan-400 animate-pulse";
              }
              
              if (isCorrect === true) {
                className = "text-green-400";
              } else if (isCorrect === false) {
                className = "text-red-400 bg-red-400/20";
              }
              
              return (
                <span key={i} className={className}>
                  {char}
                </span>
              );
            })}
          </div>
          
          {/* Invisible Input */}
          <textarea
            ref={inputRef}
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            className="absolute inset-0 w-full h-full resize-none bg-transparent text-transparent font-mono text-lg focus:outline-none p-6 whitespace-pre"
            style={{ 
              caretColor: "transparent",
              tabSize: 2,
              lineHeight: '1.8rem'
            }}
            spellCheck={false}
            aria-label="Type the code"
          />
        </div>
      </div>

      {/* Stats Bar */}
      <div className="mt-6 flex items-center justify-center gap-12 text-center">
        <div>
          <div className="text-3xl font-bold theme-text-primary font-mono">{formatTime(timerSeconds)}</div>
          <div className="text-sm theme-text-secondary">Time</div>
        </div>
        
        <div>
          <div className="text-3xl font-bold text-cyan-400 font-mono">{realtimeWpm}</div>
          <div className="text-sm theme-text-secondary">WPM</div>
        </div>
        
        <div>
          <div className="text-3xl font-bold theme-text-primary font-mono">{formatTime(timerSeconds)}</div>
          <div className="text-sm theme-text-secondary">Duration</div>
        </div>
      </div>
    </div>
  );
}
