import { useState, useEffect } from "react";
import { Clock } from "lucide-react";

export function CodingClock() {
  const [time, setTime] = useState(() => new Date());

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const timeStr = time.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
  const dateStr = time.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  return (
    <div className="flex items-center gap-2 rounded-md border bg-muted/30 px-3 py-1.5 font-mono text-sm">
      <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
      <span className="tabular-nums">{timeStr}</span>
      <span className="text-muted-foreground text-xs hidden sm:inline">{dateStr}</span>
    </div>
  );
}
