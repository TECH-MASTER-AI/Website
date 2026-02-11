import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { 
  Code2,
  Wand2,
  Rocket,
  Play,
  ChevronDown,
  ChevronRight
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useTheme } from "@/contexts/ThemeContext";

export function TypeForgeSidebar({ className }: { className?: string }) {
  const location = useLocation();
  const { theme } = useTheme();
  const [isTypeForgeExpanded, setIsTypeForgeExpanded] = useState(true);

  const toggleTypeForgeMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsTypeForgeExpanded(!isTypeForgeExpanded);
  };

  return (
    <aside className={cn(
        "w-72 h-[calc(100vh-4rem)] fixed left-0 top-16 flex flex-col shrink-0 transition-colors duration-300 border-r z-40",
        "bg-slate-50 dark:bg-[#0B0F19] border-slate-200 dark:border-white/10",
        className
    )}>
      {/* Logo Section */}
      <Link to="/" className="py-2 flex items-center justify-center cursor-pointer">
         <img className="h-20" src={theme !== 'dark' ? "/tmai-logo-dark.png" : "/tmai-logo.png"} alt="Techmaster AI" />
      </Link>

      <ScrollArea className="flex-1 px-4 pb-0">
        {/* Main Navigation */}
        <div className="space-y-1 mb-8">
          {/* Flow State (DSA Practice) Link */}
          <Link
            to="/dsa/problems"
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all relative",
              location.pathname.startsWith("/dsa/problem")
                ? "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400"
                : "text-muted-foreground hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-white/5"
            )}
          >
            {location.pathname.startsWith("/dsa/problem") && (
              <div className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 rounded-r-full bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.6)]" />
            )}
            <Code2 className="h-4 w-4" />
            <span>Flow State</span>
          </Link>

          {/* Code Royale (1v1 Duels) Link */}
          <Link
            to="/dsa/duels"
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all relative",
              location.pathname.startsWith("/dsa/duels")
                ? "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400"
                : "text-muted-foreground hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-white/5"
            )}
          >
            {location.pathname.startsWith("/dsa/duels") && (
              <div className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 rounded-r-full bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.6)]" />
            )}
            <Code2 className="h-4 w-4" />
            <span>Code Royale</span>
          </Link>

          {/* Typing Forge Dropdown */}
          <div>
            <div 
              onClick={toggleTypeForgeMenu}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all relative cursor-pointer select-none",
                location.pathname.startsWith("/typeforge")
                  ? "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400"
                  : "text-muted-foreground hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-white/5"
              )}
            >
              {location.pathname.startsWith("/typeforge") && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 rounded-r-full bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.6)]" />
              )}
              <Wand2 className="h-4 w-4" />
              <span>Typing Forge</span>
              {isTypeForgeExpanded ? (
                <ChevronDown className="ml-auto h-4 w-4 opacity-50" />
              ) : (
                <ChevronRight className="ml-auto h-4 w-4 opacity-50" />
              )}
            </div>

            {/* Nested TypeForge Sub-items */}
            {isTypeForgeExpanded && (
              <div className="animate-in slide-in-from-top-2 duration-300 py-2 pl-4 border-l ml-2 mt-1" style={{ borderColor: 'rgba(255, 255, 255, 0.05)' }}>
                <div className="space-y-1">
                  <Link
                    to="/typeforge/code"
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all relative",
                      location.pathname === "/typeforge/code"
                        ? "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400"
                        : "text-muted-foreground hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-white/5"
                    )}
                  >
                    {location.pathname === "/typeforge/code" && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 rounded-r-full bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.6)]" />
                    )}
                    <Code2 className="h-3.5 w-3.5" />
                    <span>Code</span>
                  </Link>

                  <Link
                    to="/typeforge/spells"
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all relative",
                      location.pathname === "/typeforge/spells" || location.pathname === "/typeforge"
                        ? "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400"
                        : "text-muted-foreground hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-white/5"
                    )}
                  >
                    {(location.pathname === "/typeforge/spells" || location.pathname === "/typeforge") && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 rounded-r-full bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.6)]" />
                    )}
                    <Wand2 className="h-3.5 w-3.5" />
                    <span>Spells</span>
                  </Link>

                  <Link
                    to="/typeforge/astrotypes"
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all relative",
                      location.pathname === "/typeforge/astrotypes"
                        ? "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400"
                        : "text-muted-foreground hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-white/5"
                    )}
                  >
                    {location.pathname === "/typeforge/astrotypes" && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 rounded-r-full bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.6)]" />
                    )}
                    <Rocket className="h-3.5 w-3.5" />
                    <span>Astro Types</span>
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Live Coding - Separate from TypeForge */}
          <Link
            to="/livecoding"
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all relative",
              location.pathname === "/livecoding"
                ? "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400"
                : "text-muted-foreground hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-white/5"
            )}
          >
            {location.pathname === "/livecoding" && (
              <div className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 rounded-r-full bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.6)]" />
            )}
            <Play className="h-4 w-4" />
            <span>Live Coding</span>
          </Link>
        </div>
      </ScrollArea>
    </aside>
  );
}
