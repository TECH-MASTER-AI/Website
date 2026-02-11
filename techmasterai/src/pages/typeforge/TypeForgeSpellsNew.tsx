import { useState, useRef, useEffect, useCallback } from "react";
import { useBlocker } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Clock, Globe, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { getRandomPassage, type PassageLength } from "@/data/typingPassages";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type SpellDifficulty = "noob" | "basic" | "pro";

const SPELL_DIFFICULTY_CONFIG = {
  noob: { 
    label: "Noob", 
    minWords: 50,
    maxWords: 100,
  },
  basic: { 
    label: "Basic", 
    minWords: 100,
    maxWords: 200,
  },
  pro: { 
    label: "Pro", 
    minWords: 200,
    maxWords: 350,
  }
};

export default function TypeForgeSpellsNew() {
  const [difficulty, setDifficulty] = useState<SpellDifficulty>("noob");
  const [passage, setPassage] = useState("");
  const [input, setInput] = useState("");
  const [startTime, setStartTime] = useState<number | null>(null);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  
  const inputRef = useRef<HTMLTextAreaElement>(null);

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

  // Load passage
  const loadPassage = useCallback(() => {
    const lengthMap: Record<SpellDifficulty, PassageLength> = {
      noob: "short",
      basic: "medium", 
      pro: "long",
    };
    
    setPassage(getRandomPassage(lengthMap[difficulty]));
    setInput("");
    setStartTime(null);
    setIsTimerRunning(false);
    setTimerSeconds(0);
    
    setTimeout(() => inputRef.current?.focus(), 100);
  }, [difficulty]);

  useEffect(() => {
    loadPassage();
  }, [difficulty, loadPassage]);

  // Start timer on first input
  useEffect(() => {
    if (input.length === 1 && !startTime) {
      setStartTime(Date.now());
      setIsTimerRunning(true);
    }
  }, [input.length, startTime]);

  // Calculate stats
  const words = passage.split(' ');
  const correctChars = passage.slice(0, input.length).split('').filter((c, i) => c === input[i]).length;
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
        const chars = passage.slice(0, input.length).split('').filter((c, i) => c === input[i]).length;
        const calculatedWpm = Math.round((chars / 5) / (elapsed / 60));
        setRealtimeWpm(calculatedWpm);
      }
    }, 100); // Update every 100ms for smooth real-time updates

    return () => clearInterval(interval);
  }, [startTime, input.length, passage]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (value.length <= passage.length) {
      setInput(value);
    }
  };

  // Format time for display
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

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col p-6">
      {/* Spells Section Title */}
      <div className="mb-4">
        <h2 className="text-xl font-semibold theme-text-primary">Spells</h2>
      </div>

      {/* Difficulty Tabs + Timer + Language */}
      <div className="flex items-center justify-between mb-6">
        {/* Difficulty Tabs */}
        <div className="flex gap-2">
          {(["noob", "basic", "pro"] as const).map((d) => {
            const config = SPELL_DIFFICULTY_CONFIG[d];
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
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-md border theme-border-primary">
            <Globe className="h-4 w-4 theme-text-secondary" />
            <span className="text-sm theme-text-primary">English</span>
          </div>

          {/* Refresh Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => loadPassage()}
            className="px-3"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Typing Practice Area */}
      <div className="flex-1 rounded-xl overflow-hidden border theme-border-primary bg-gradient-to-br from-slate-900/50 to-slate-800/50 backdrop-blur-sm">
        <div className="h-full p-8 overflow-auto relative">
          {/* Text Display */}
          <div 
            className="font-mono text-2xl leading-relaxed cursor-text select-none"
            onClick={() => inputRef.current?.focus()}
          >
            {words.map((word, wordIndex) => (
              <span key={wordIndex} className="inline">
                {word.split('').map((char, charIndex) => {
                  const globalIndex = words.slice(0, wordIndex).join(' ').length + 
                    (wordIndex > 0 ? 1 : 0) + charIndex;
                  const typedChar = input[globalIndex];
                  const isCorrect = typedChar !== undefined ? typedChar === char : null;
                  const isCurrent = globalIndex === input.length;
                  
                  let className = "text-gray-500";
                  
                  if (isCurrent) {
                    className += " border-l-2 border-cyan-400 animate-pulse";
                  } else if (isCorrect === true) {
                    className = "text-white";
                  } else if (isCorrect === false) {
                    className = "text-red-400 bg-red-400/20";
                  }
                  
                  return (
                    <span key={charIndex} className={className}>
                      {char}
                    </span>
                  );
                })}
                {wordIndex < words.length - 1 && (
                  <span
                    className={`
                      ${words.slice(0, wordIndex + 1).join(' ').length === input.length 
                        ? "border-l-2 border-cyan-400 animate-pulse" 
                        : input.length > words.slice(0, wordIndex + 1).join(' ').length
                          ? "text-white"
                          : "text-gray-500"
                      }
                    `}
                  >
                    {' '}
                  </span>
                )}
              </span>
            ))}
          </div>
          
          {/* Invisible Input */}
          <textarea
            ref={inputRef}
            value={input}
            onChange={handleInputChange}
            className="absolute inset-0 w-full h-full resize-none bg-transparent text-transparent font-mono text-2xl focus:outline-none p-8"
            style={{ caretColor: "transparent" }}
            spellCheck={false}
            aria-label="Type the text"
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
