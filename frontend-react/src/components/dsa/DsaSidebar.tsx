import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { 
  Code2,
  Users,        
  Keyboard, 
  Play, 
  ChevronDown, 
  ChevronUp, 
  ChevronRight,
  Search,
  SquarePen,
  Calendar,
  FileText,
  Check
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useDsaFilter } from "@/contexts/DsaFilterContext";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useTheme } from "@/contexts/ThemeContext";

interface SidebarSectionProps {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

function SidebarSection({ title, defaultOpen = true, children }: SidebarSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const { theme } = useTheme();

  return (
    <div className={cn("py-2 pl-4 border-l ml-2 mt-1", theme === 'pastel' ? "border-rose-100" : "border-slate-200 dark:border-white/5")}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
            "flex items-center justify-between w-full mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground transition-colors",
            theme === 'pastel' ? "hover:text-rose-800" : "hover:text-slate-900 dark:hover:text-white"
        )}
      >
        <span>{title}</span>
        {isOpen ? <ChevronUp className="h-3 w-3 opacity-70" /> : <ChevronDown className="h-3 w-3 opacity-70" />}
      </button>
      {isOpen && <div className="space-y-2 animate-in slide-in-from-top-1 duration-200">{children}</div>}
    </div>
  );
}

export function DsaSidebar({ className }: { className?: string }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { 
    difficulty, setDifficulty,
    status, setStatus,
    tags, setTags 
  } = useDsaFilter();

  const [isDsaExpanded, setIsDsaExpanded] = useState(true);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleDifficultyChange = (val: "Easy" | "Medium" | "Hard") => {
    // Toggle: if already selected, deselect it; otherwise select it
    if (difficulty === val) {
      setDifficulty("all");
    } else {
      setDifficulty(val);
    }
  };

  const handleStatusChange = (val: "solved" | "unsolved" | "attempted") => {
    // Toggle: if already selected, deselect it; otherwise select it
    if (status === val) {
      setStatus("all");
    } else {
      setStatus(val as any);
    }
  };

  const toggleDsaMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDsaExpanded(!isDsaExpanded);
    if (!location.pathname.startsWith("/dsa/problems")) {
        navigate("/dsa/problems");
    }
  };

  return (
    <aside className={cn(
        "w-72 h-[calc(100vh-4rem)] fixed left-0 top-16 flex flex-col shrink-0 transition-colors duration-300 border-r z-40",
        theme === 'pastel' 
            ? "bg-white/50 border-rose-100" 
            : "bg-slate-50 dark:bg-[#0B0F19] border-slate-200 dark:border-white/10",
        className
    )}>
      {/* Logo Section */}
      <Link to="/" className="py-2 flex items-center justify-center cursor-pointer">
         <img className="h-20" src={theme !== 'dark' ? "/tmai-logo-dark.png" : "/tmai-logo.png"} alt="Techmaster AI" />
      </Link>

      <ScrollArea className="flex-1 px-4 pb-0">
        {/* Main Navigation */}
        <div className="space-y-1 mb-8">
          {/* DSA Practice Dropdown */}
          <div>
            <div 
                onClick={toggleDsaMenu}
                className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all relative cursor-pointer select-none",
                    ((location.pathname.startsWith("/dsa/problem") || location.pathname === "/dsa/problems") && location.pathname !== "/dsa/dashboard")
                    ? theme === 'pastel' ? "bg-rose-100 text-rose-700" : "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400"
                    : cn("text-muted-foreground", theme === 'pastel' ? "hover:text-slate-900 hover:bg-rose-50" : "hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-white/5")
                )}
            >
                {((location.pathname.startsWith("/dsa/problem") || location.pathname === "/dsa/problems") && location.pathname !== "/dsa/dashboard") && (
                    <div className={cn(
                        "absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 rounded-r-full",
                        theme === 'pastel' ? "bg-rose-400 shadow-[0_0_10px_rgba(251,113,133,0.4)]" : "bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.6)]"
                    )} />
                )}
                <Code2 className="h-4 w-4" />
                <span>DSA Practice</span>
                {isDsaExpanded ? (
                    <ChevronDown className="ml-auto h-4 w-4 opacity-50" />
                ) : (
                    <ChevronRight className="ml-auto h-4 w-4 opacity-50" />
                )}
            </div>

            {/* Nested Filters Dropdown */}
            {isDsaExpanded && (
                <div className="animate-in slide-in-from-top-2 duration-300">
                    {/* Difficulty Filter */}
                    <SidebarSection title="Difficulty Level">
                    <div className="space-y-2 pl-1">
                        {["Easy", "Medium", "Hard"].map((level) => (
                        <div 
                            key={level} 
                            className={cn(
                                "flex items-center space-x-3 group cursor-pointer px-2 py-1.5 rounded-md transition-all",
                                difficulty === level && (theme === 'pastel' 
                                    ? "bg-rose-50 border border-rose-200" 
                                    : "bg-cyan-500/10 border border-cyan-500/20")
                            )} 
                            onClick={() => handleDifficultyChange(level as any)}
                        >
                            <div className={cn(
                                "h-4 w-4 rounded border-2 flex items-center justify-center transition-all",
                                difficulty === level 
                                    ? theme === 'pastel' 
                                        ? "bg-rose-400 border-rose-400" 
                                        : "bg-cyan-500 border-cyan-500"
                                    : theme === 'pastel'
                                        ? "border-rose-200 bg-white"
                                        : "border-slate-300 dark:border-white/20 bg-white dark:bg-white/5"
                            )}>
                                {difficulty === level && (
                                    <Check className="h-3 w-3 text-white" strokeWidth={3} />
                                )}
                            </div>
                            <label
                            className={cn(
                                "text-xs font-medium leading-none cursor-pointer transition-colors",
                                difficulty === level
                                    ? theme === 'pastel' ? "text-rose-700" : "text-cyan-600 dark:text-cyan-400"
                                    : cn("text-muted-foreground", theme === 'pastel' ? "group-hover:text-slate-900" : "group-hover:text-slate-900 dark:group-hover:text-white")
                            )}
                            >
                            {level}
                            </label>
                        </div>
                        ))}
                    </div>
                    </SidebarSection>

                    {/* Status Filter */}
                    <SidebarSection title="Status">
                    <div className="space-y-2 pl-1">
                        {[
                            { label: "Solved", value: "solved" },
                            { label: "Unsolved", value: "unsolved" },
                            { label: "Attempted", value: "attempted" }
                        ].map((s) => (
                        <div 
                            key={s.value} 
                            className={cn(
                                "flex items-center space-x-3 group cursor-pointer px-2 py-1.5 rounded-md transition-all",
                                status === s.value && (theme === 'pastel' 
                                    ? "bg-rose-50 border border-rose-200" 
                                    : "bg-cyan-500/10 border border-cyan-500/20")
                            )} 
                            onClick={() => handleStatusChange(s.value as any)}
                        >
                            <div className={cn(
                                "h-4 w-4 rounded border-2 flex items-center justify-center transition-all",
                                status === s.value 
                                    ? theme === 'pastel' 
                                        ? "bg-rose-400 border-rose-400" 
                                        : "bg-cyan-500 border-cyan-500"
                                    : theme === 'pastel'
                                        ? "border-rose-200 bg-white"
                                        : "border-slate-300 dark:border-white/20 bg-white dark:bg-white/5"
                            )}>
                                {status === s.value && (
                                    <Check className="h-3 w-3 text-white" strokeWidth={3} />
                                )}
                            </div>
                            <label
                            className={cn(
                                "text-xs font-medium leading-none cursor-pointer transition-colors",
                                status === s.value
                                    ? theme === 'pastel' ? "text-rose-700" : "text-cyan-600 dark:text-cyan-400"
                                    : cn("text-muted-foreground", theme === 'pastel' ? "group-hover:text-slate-900" : "group-hover:text-slate-900 dark:group-hover:text-white")
                            )}
                            >
                            {s.label}
                            </label>
                        </div>
                        ))}
                    </div>
                    </SidebarSection>

                    {/* Search Tags */}
                    <SidebarSection title="Search Tags">
                        <div className="relative mt-1 pr-2">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                            <Input 
                                placeholder="Search Tags" 
                                className={cn(
                                    "h-8 pl-8 rounded-lg text-[10px] placeholder:text-muted-foreground/50 focus-visible:ring-1",
                                    theme === 'pastel' 
                                        ? "bg-white border-rose-100 focus-visible:ring-rose-400/50 focus-visible:border-rose-400/50 text-slate-900" 
                                        : "bg-white dark:bg-[#111625] border-slate-200 dark:border-white/10 focus-visible:ring-cyan-500/50 focus-visible:border-cyan-500/50 text-slate-900 dark:text-white"
                                )} 
                            />
                        </div>
                    </SidebarSection>
                </div>
            )}
          </div>
        </div>
        
        {/* Divider */}
        <div className={cn("h-px my-4 mx-2", theme === 'pastel' ? "bg-rose-100" : "bg-slate-200 dark:bg-white/5")} />

        {/* Lower Links */}
        <div className="space-y-1">
            <Link
                to="/dsa/duels"
                className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all relative",
                    location.pathname.startsWith("/dsa/duels")
                        ? theme === 'pastel' ? "bg-rose-100 text-rose-700" : "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400"
                        : cn("text-muted-foreground", theme === 'pastel' ? "hover:text-slate-900 hover:bg-rose-50" : "hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-white/5")
                )}
            >
                {location.pathname.startsWith("/dsa/duels") && (
                    <div className={cn(
                        "absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 rounded-r-full",
                        theme === 'pastel' ? "bg-rose-400 shadow-[0_0_10px_rgba(251,113,133,0.4)]" : "bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.6)]"
                    )} />
                )}
                <Users className="h-4 w-4" />
                <span>1v1 Code Arena</span>
            </Link>
             <Link
                to="/typeforge"
                className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all relative",
                    location.pathname.startsWith("/typeforge")
                        ? theme === 'pastel' ? "bg-rose-100 text-rose-700" : "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400"
                        : cn("text-muted-foreground", theme === 'pastel' ? "hover:text-slate-900 hover:bg-rose-50" : "hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-white/5")
                )}
            >
                {location.pathname.startsWith("/typeforge") && (
                    <div className={cn(
                        "absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 rounded-r-full",
                        theme === 'pastel' ? "bg-rose-400 shadow-[0_0_10px_rgba(251,113,133,0.4)]" : "bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.6)]"
                    )} />
                )}
                <Keyboard className="h-4 w-4" />
                <span>Type Forge</span>
            </Link>
             <Link
                to="/dsa/live"
                className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all relative",
                    location.pathname === "/dsa/live"
                        ? theme === 'pastel' ? "bg-rose-100 text-rose-700" : "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400"
                        : cn("text-muted-foreground", theme === 'pastel' ? "hover:text-slate-900 hover:bg-rose-50" : "hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-white/5")
                )}
            >
                {location.pathname === "/dsa/live" && (
                    <div className={cn(
                        "absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 rounded-r-full",
                        theme === 'pastel' ? "bg-rose-400 shadow-[0_0_10px_rgba(251,113,133,0.4)]" : "bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.6)]"
                    )} />
                )}
                <Play className="h-4 w-4" />
                <span>Live Coding</span>
            </Link>
        </div>

      </ScrollArea>

      {/* Fixed Footer Icons */}
      <div className={cn(
          "h-12 border-t grid grid-cols-3 shrink-0",
          theme === 'pastel' 
            ? "bg-white/50 border-rose-100" 
            : "border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0B0F19]"
      )}>
         <Link
             to="/dsa/problems"
             className={cn(
                 "flex items-center justify-center border-r transition-colors group",
                 theme === 'pastel' ? "border-rose-100 hover:bg-rose-50" : "border-slate-200 dark:border-white/5 hover:bg-slate-200 dark:hover:bg-white/5"
             )}
             title="Problems"
         >
            <SquarePen className={cn("h-4 w-4 text-muted-foreground", theme === 'pastel' ? "group-hover:text-rose-900" : "group-hover:text-slate-900 dark:group-hover:text-white")} />
         </Link>
         <Link
             to="/dsa/calendar"
             className={cn(
                 "flex items-center justify-center border-r transition-colors group",
                 theme === 'pastel' ? "border-rose-100 hover:bg-rose-50" : "border-slate-200 dark:border-white/5 hover:bg-slate-200 dark:hover:bg-white/5"
             )}
             title="Activity & Streak"
         >
            <Calendar className={cn("h-4 w-4 text-muted-foreground", theme === 'pastel' ? "group-hover:text-rose-900" : "group-hover:text-slate-900 dark:group-hover:text-white")} />
         </Link>
         <Link
             to="/dsa/profile"
             className={cn(
                 "flex items-center justify-center transition-colors group",
                 theme === 'pastel' ? "hover:bg-rose-50" : "hover:bg-slate-200 dark:hover:bg-white/5"
             )}
             title="Profile"
         >
            <FileText className={cn("h-4 w-4 text-muted-foreground", theme === 'pastel' ? "group-hover:text-rose-900" : "group-hover:text-slate-900 dark:group-hover:text-white")} />
         </Link>
      </div>
    </aside>
  );
}
