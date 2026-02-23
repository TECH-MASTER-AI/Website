import { Clock, Zap, CheckCircle2, AlertCircle, Play, Pause, RotateCcw, Maximize2, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";

interface TypeForgeStatsProps {
  timerSeconds: number;
  isTimerRunning: boolean;
  wpm: number;
  accuracy: number;
  errors: number;
  progress: number;
  onStartTimer: () => void;
  onStopTimer: () => void;
  onResetTimer: () => void;
  onOpenNotes?: () => void;
}

export function TypeForgeStats({
  timerSeconds,
  isTimerRunning,
  wpm,
  accuracy,
  errors,
  progress,
  onStartTimer,
  onStopTimer,
  onResetTimer,
}: TypeForgeStatsProps) {
  const [timerPreset, setTimerPreset] = useState("5");
  const [isFullscreen, setIsFullscreen] = useState(false);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimerColor = () => {
    const presetSeconds = parseInt(timerPreset) * 60;
    const remaining = presetSeconds - timerSeconds;
    
    if (remaining <= 300) return "#EF4444"; // Red - 5 min remaining
    if (remaining <= 600) return "#FBBF24"; // Yellow - 10 min remaining
    return "var(--theme-accent)"; // Cyan - default
  };

  const getAccuracyColor = () => {
    if (accuracy >= 90) return "#10B981"; // Green
    if (accuracy >= 70) return "#FBBF24"; // Yellow
    return "#EF4444"; // Red
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  return (
    <div 
      className="flex items-center justify-between gap-4 p-4 rounded-lg theme-card-bg backdrop-blur-sm border border-white/10"
      style={{
        background: "var(--theme-card-bg)",
        backdropFilter: "blur(20px)",
        border: "1px solid var(--theme-border-primary)"
      }}
    >
      {/* Stats Display */}
      <div className="flex items-center gap-6 flex-wrap">
        {/* Timer */}
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4" style={{ color: getTimerColor() }} />
          <span 
            className="text-lg font-bold"
            style={{ color: getTimerColor() }}
          >
            {formatTime(timerSeconds)}
          </span>
        </div>

        {/* WPM */}
        <div className="flex items-center gap-2">
          <Zap className="h-4 w-4 theme-text-primary" />
          <span className="text-lg font-bold theme-text-primary">
            {wpm}
          </span>
          <span className="text-sm theme-text-secondary">WPM</span>
        </div>

        {/* Accuracy */}
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4" style={{ color: getAccuracyColor() }} />
          <span 
            className="text-lg font-bold"
            style={{ color: getAccuracyColor() }}
          >
            {accuracy}%
          </span>
        </div>

        {/* Errors */}
        <div className="flex items-center gap-2">
          <AlertCircle className="h-4 w-4 theme-text-muted" />
          <span className="text-lg font-bold theme-text-primary">
            {errors}
          </span>
          <span className="text-sm theme-text-secondary">errors</span>
        </div>

        {/* Progress Bar */}
        <div className="flex-1 min-w-[120px] max-w-[200px]">
          <Progress 
            value={progress} 
            className="h-2"
            style={{
              background: "var(--theme-bg-tertiary)",
            }}
          />
        </div>
      </div>

      {/* Timer Controls */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Timer Preset */}
        <Select value={timerPreset} onValueChange={setTimerPreset}>
          <SelectTrigger className="w-[80px] h-8 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1">1 min</SelectItem>
            <SelectItem value="3">3 min</SelectItem>
            <SelectItem value="5">5 min</SelectItem>
            <SelectItem value="10">10 min</SelectItem>
          </SelectContent>
        </Select>

        {/* Start/Pause Button */}
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={isTimerRunning ? onStopTimer : onStartTimer}
        >
          {isTimerRunning ? (
            <Pause className="h-4 w-4" />
          ) : (
            <Play className="h-4 w-4" />
          )}
        </Button>

        {/* Reset Button */}
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={onResetTimer}
        >
          <RotateCcw className="h-4 w-4" />
        </Button>

        {/* Fullscreen Button */}
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={toggleFullscreen}
        >
          <Maximize2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}