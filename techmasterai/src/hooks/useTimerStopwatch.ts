import { useState, useEffect, useCallback, useRef } from 'react';

export type TimerMode = 'idle' | 'stopwatch' | 'timer';

export function useTimerStopwatch() {
  const [mode, setMode] = useState<TimerMode>('idle');
  const [elapsed, setElapsed] = useState(0);
  const [remaining, setRemaining] = useState(0);
  const [totalDuration, setTotalDuration] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const onTimeUpRef = useRef<(() => void) | null>(null);

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!isActive || isPaused) {
      clearTimer();
      return;
    }

    intervalRef.current = setInterval(() => {
      if (mode === 'stopwatch') {
        setElapsed(prev => prev + 1);
      } else if (mode === 'timer') {
        setRemaining(prev => {
          if (prev <= 1) {
            setIsActive(false);
            onTimeUpRef.current?.();
            return 0;
          }
          return prev - 1;
        });
      }
    }, 1000);

    return clearTimer;
  }, [isActive, isPaused, mode, clearTimer]);

  const startStopwatch = useCallback(() => {
    setMode('stopwatch');
    setElapsed(0);
    setIsActive(true);
    setIsPaused(false);
  }, []);

  const startTimer = useCallback((minutes: number, onTimeUp?: () => void) => {
    const seconds = minutes * 60;
    setMode('timer');
    setTotalDuration(seconds);
    setRemaining(seconds);
    setIsActive(true);
    setIsPaused(false);
    onTimeUpRef.current = onTimeUp || null;
  }, []);

  const pause = useCallback(() => {
    setIsPaused(true);
  }, []);

  const resume = useCallback(() => {
    setIsPaused(false);
  }, []);

  const stop = useCallback(() => {
    clearTimer();
    setMode('idle');
    setIsActive(false);
    setIsPaused(false);
    setElapsed(0);
    setRemaining(0);
    setTotalDuration(0);
  }, [clearTimer]);

  const formatTime = useCallback((seconds: number): string => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }, []);

  const getDisplayTime = useCallback((): string => {
    if (mode === 'stopwatch') return formatTime(elapsed);
    if (mode === 'timer') return formatTime(remaining);
    return '0:00';
  }, [mode, elapsed, remaining, formatTime]);

  // Smooth color based on remaining time
  const getTimerColorClass = useCallback((): string => {
    if (mode === 'stopwatch') return 'text-cyan-400 bg-cyan-500/20 border-cyan-500/30';
    if (mode === 'timer') {
      if (remaining <= 300) return 'text-red-400 bg-red-500/20 border-red-500/30 animate-pulse';
      if (remaining <= 600) return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
      return 'text-cyan-400 bg-cyan-500/20 border-cyan-500/30';
    }
    return 'text-cyan-400 bg-cyan-500/20 border-cyan-500/30';
  }, [mode, remaining]);

  const getTimerIconColor = useCallback((): string => {
    if (!isActive) return 'text-slate-400';
    if (mode === 'stopwatch') return 'text-cyan-400';
    if (mode === 'timer') {
      if (remaining <= 300) return 'text-red-400';
      if (remaining <= 600) return 'text-yellow-400';
      return 'text-cyan-400';
    }
    return 'text-slate-400';
  }, [mode, remaining, isActive]);

  return {
    mode,
    elapsed,
    remaining,
    totalDuration,
    isActive,
    isPaused,
    startStopwatch,
    startTimer,
    pause,
    resume,
    stop,
    getDisplayTime,
    getTimerColorClass,
    getTimerIconColor,
    formatTime,
  };
}
