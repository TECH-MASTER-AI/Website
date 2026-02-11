import { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, CheckCircle2, Circle, Flame, Star, ChevronDown, Minus, Sparkles } from "lucide-react";
import { fetchDsaQuestions } from "@/features/dsa/api/questions";
import { useDsaFilter } from "@/contexts/DsaFilterContext";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useTheme } from "@/contexts/ThemeContext";
import { supabase } from "@/lib/supabase";
import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext";
import { 
  getRecommendedProblems, 
  getUserActivityWithProblems,
  calculateSkillLevel,
  getRecommendedDistribution 
} from "@/utils/recommendationEngine";
import { getAllProblemsSuccessRates, type ProblemSuccessRate } from "@/features/dsa/api/successRate";

type Difficulty = "Easy" | "Medium" | "Hard";

interface ProblemRow {
  id: string;
  title: string;
  difficulty: Difficulty;
  acceptance: number;
  tags: string[];
}

export default function DsaProblems() {
  const navigate = useNavigate();
  const { user } = useSupabaseAuth(); // Use unified Supabase auth
  
  // Debug logging
  useEffect(() => {
    console.log('🔍 DsaProblems: Current user from context:', user?.id);
  }, [user]);
  
  const { 
    search, setSearch, 
    difficulty,
    status,
    tags,
  } = useDsaFilter();
  const { theme } = useTheme();

  const [activeTab, setActiveTab] = useState<"All" | "Favorite" | "Recommended">("Recommended");
  const [favorites, setFavorites] = useState<Set<string>>(() => {
    const saved = localStorage.getItem('dsa_favorites');
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });
  const [problems, setProblems] = useState<ProblemRow[]>([]);
  const [recommendedProblems, setRecommendedProblems] = useState<ProblemRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userSkillLevel, setUserSkillLevel] = useState<"beginner" | "intermediate" | "advanced">("beginner");
  
  // Real-time success rates
  const [successRates, setSuccessRates] = useState<Map<string, ProblemSuccessRate>>(new Map());
  
  // Load solved problems from Supabase database
  const [solvedProblems, setSolvedProblems] = useState<Set<string>>(new Set());

  // Load attempted problems from localStorage (for now)
  const [attemptedProblems, setAttemptedProblems] = useState<Set<string>>(() => {
    const saved = localStorage.getItem('dsa_attempted_problems');
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });

  // Fetch problems from API
  useEffect(() => {
    const loadProblems = async () => {
      try {
        setLoading(true);
        const data = await fetchDsaQuestions();
        setProblems(data.items);
        
        // Load real-time success rates
        const rates = await getAllProblemsSuccessRates();
        setSuccessRates(rates);
        
        // Fetch solved problems from database using DSA auth context
        if (user) {
          console.log('🔍 Fetching solved problems for user:', user.id);
          const { data: submissions, error: submissionsError } = await supabase
            .from('dsa_submissions')
            .select('problem_id')
            .eq('user_id', user.id)
            .eq('status', 'accepted');
          
          console.log('📊 Submissions query result:', { submissions, submissionsError });
          
          if (submissions) {
            const solvedSlugs = new Set(submissions.map(s => s.problem_id));
            console.log('✅ Solved problems:', Array.from(solvedSlugs));
            setSolvedProblems(solvedSlugs);
          }
        } else {
          console.log('❌ No user logged in');
        }
        
        // Calculate recommendations based on user activity
        const userActivity = getUserActivityWithProblems(data.items);
        const skillLevel = calculateSkillLevel(userActivity);
        setUserSkillLevel(skillLevel);
        
        const recommended = getRecommendedProblems(data.items, userActivity, 50);
        setRecommendedProblems(recommended);
        
        setError(null);
      } catch (err) {
        console.error('Failed to fetch problems:', err);
        setError('Failed to load problems. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    loadProblems();
  }, [user]); // Re-fetch when user changes

  // Recalculate recommendations when solved/attempted problems change
  useEffect(() => {
    if (problems.length > 0) {
      const userActivity = getUserActivityWithProblems(problems);
      const skillLevel = calculateSkillLevel(userActivity);
      setUserSkillLevel(skillLevel);
      
      const recommended = getRecommendedProblems(problems, userActivity, 50);
      setRecommendedProblems(recommended);
    }
  }, [solvedProblems, attemptedProblems, problems]);

  // Listen for storage changes to update solved problems in real-time
  useEffect(() => {
    const handleStorageChange = async () => {
      // Refetch solved problems from database using DSA auth context
      if (user) {
        const { data: submissions } = await supabase
          .from('dsa_submissions')
          .select('slug')
          .eq('user_id', user.id)
          .eq('status', 'accepted');
        
        if (submissions) {
          const solvedSlugs = new Set(submissions.map(s => s.slug));
          setSolvedProblems(solvedSlugs);
        }
      }
      
      // Still load attempted and favorites from localStorage
      const attempted = localStorage.getItem('dsa_attempted_problems');
      if (attempted) {
        setAttemptedProblems(new Set(JSON.parse(attempted)));
      }
      const favs = localStorage.getItem('dsa_favorites');
      if (favs) {
        setFavorites(new Set(JSON.parse(favs)));
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [user]); // Re-run when user changes

  // Real-time subscription for new submissions
  useEffect(() => {
    const setupRealtimeSubscription = async () => {
      if (!user) {
        console.log('❌ No user for real-time subscription');
        return;
      }

      console.log('🔔 Setting up real-time subscription for user:', user.id);

      // Subscribe to changes in dsa_submissions table for current user
      const channel = supabase
        .channel('dsa_submissions_changes')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'dsa_submissions',
            filter: `user_id=eq.${user.id}`,
          },
          (payload) => {
            console.log('🔔 New submission detected:', payload);
            // When a new submission is inserted, add to solved problems
            if (payload.new.status === 'accepted') {
              console.log('✅ Adding to solved problems:', payload.new.slug);
              setSolvedProblems(prev => {
                const next = new Set(prev);
                next.add(payload.new.slug);
                console.log('📊 Updated solved problems:', Array.from(next));
                return next;
              });
            }
          }
        )
        .subscribe();

      return () => {
        console.log('🔕 Cleaning up real-time subscription');
        supabase.removeChannel(channel);
      };
    };

    setupRealtimeSubscription();
  }, [user]); // Re-setup subscription when user changes

  const toggleFavorite = (e: React.MouseEvent, id: string) => {
    e.stopPropagation(); // Prevent row click navigation
    setFavorites(prev => {
        const next = new Set(prev);
        if (next.has(id)) {
            next.delete(id);
        } else {
            next.add(id);
        }
        // Save to localStorage
        localStorage.setItem('dsa_favorites', JSON.stringify(Array.from(next)));
        return next;
    });
  };

  // Remove the toggle function - problems should only be marked as solved through actual submission
  // const toggleSolved = (e: React.MouseEvent, id: string) => {
  //   e.stopPropagation();
  //   setSolvedProblems(prev => {
  //       const next = new Set(prev);
  //       if (next.has(id)) {
  //           next.delete(id);
  //       } else {
  //           next.add(id);
  //       }
  //       return next;
  //   });
  // };

  const filtered = useMemo(() => {
    // Use recommended problems for Recommended tab
    const sourceList = activeTab === "Recommended" ? recommendedProblems : problems;
    
    let list = sourceList.filter((p) => {
      const isFav = favorites.has(p.id);
      const isSolved = solvedProblems.has(p.id);
      const isAttempted = attemptedProblems.has(p.id);
      const currentStatus: "solved" | "attempted" | "unsolved" = isSolved ? "solved" : isAttempted ? "attempted" : "unsolved";
      
      const matchSearch =
        !search ||
        p.title.toLowerCase().includes(search.toLowerCase());
      const matchDiff = difficulty === "all" || p.difficulty === difficulty;
      const matchStatus =
        status === "all" ||
        (status === "solved" && currentStatus === "solved") ||
        (status === "unsolved" && currentStatus === "unsolved") ||
        (status === "attempted" && currentStatus === "attempted");

      const matchTag = tags.length === 0 || tags.some(t => p.tags.includes(t));
      
      // Tab filtering
      let matchTab = true;
      if (activeTab === "Favorite") matchTab = isFav;
      
      return matchSearch && matchDiff && matchStatus && matchTag && matchTab;
    });
    return list;
  }, [search, difficulty, status, tags, activeTab, favorites, solvedProblems, problems, recommendedProblems]);

  const difficultyColor = (d: Difficulty) =>
    d === "Easy" ? "text-green-400 bg-green-400/10 border-green-400/20" : 
    d === "Medium" ? "text-yellow-400 bg-yellow-400/10 border-yellow-400/20" : 
    "text-red-400 bg-red-400/10 border-red-400/20";

  if (loading) {
    return (
      <div className={cn(
        "h-full flex items-center justify-center",
        "bg-white dark:bg-[#0B0F19]"
      )}>
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto"></div>
          <p className="text-muted-foreground">Loading problems...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={cn(
        "h-full flex items-center justify-center",
        "bg-white dark:bg-[#0B0F19]"
      )}>
        <div className="text-center space-y-4">
          <p className="text-red-500">{error}</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className={cn(
        "h-full flex flex-col overflow-hidden transition-colors duration-300",
        "bg-white dark:bg-[#0B0F19]" 
    )}>
      {/* Fixed Header Section */}
      <div className="shrink-0 p-6 pb-2 space-y-4">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div className="space-y-1">
                <h1 className={cn(
                    "text-3xl font-bold tracking-tight mb-1 transition-colors",
                    "text-slate-900 dark:text-white"
                )}>Problems</h1>
                <p className="text-sm text-muted-foreground">Search your practice problems here and get started.</p>
            </div>
            
            {/* Skill Level Badge */}
            {activeTab === "Recommended" && (
              <div className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-xl border transition-all",
                "bg-cyan-500/10 border-cyan-500/20"
              )}>
                <Sparkles className={cn(
                  "h-4 w-4",
                  "text-cyan-400"
                )} />
                <div className="text-sm">
                  <span className="text-muted-foreground">Skill Level: </span>
                  <span className={cn(
                    "font-semibold capitalize",
                    "text-cyan-400"
                  )}>
                    {userSkillLevel}
                  </span>
                </div>
                <div className="text-xs text-muted-foreground ml-2">
                  ({solvedProblems.size} solved)
                </div>
              </div>
            )}
        </div>

        {/* Tabs */}
        <div className={cn(
            "pt-4 flex items-center gap-6 border-b mt-2 transition-colors",
            "border-slate-200 dark:border-white/50"
        )}>
            {["All Questions", "Favorite Questions", "Recommended"].map((tab) => {
                const tabKey = tab.split(" ")[0] as "All" | "Favorite" | "Recommended";
                const isActive = activeTab === tabKey;
                return (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tabKey)}
                        className={cn(
                            "pb-2 text-sm font-medium transition-all relative flex items-center gap-2",
                            isActive 
                                ? "text-cyan-600 dark:text-cyan-400" 
                                : cn("text-muted-foreground", "hover:text-slate-900 dark:hover:text-white")
                        )}
                    >
                        {tabKey === "Recommended" && <Sparkles className="h-3.5 w-3.5" />}
                        {tab}
                        {isActive && (
                            <div className={cn(
                                "absolute bottom-0 left-0 w-full h-0.5 rounded-t-full",
                                "bg-cyan-500 shadow-[0_0_10px_rgba(34,211,238,0.5)]"
                            )} />
                        )}
                    </button>
                )
            })}
        </div>

        {/* Recommendation Info Banner */}
        {activeTab === "Recommended" && (
          <div className={cn(
            "mt-2 p-3 rounded-xl border text-sm flex items-start gap-3",
            "bg-cyan-500/5 border-cyan-500/20 text-cyan-700 dark:text-cyan-300"
          )}>
            <Sparkles className={cn(
              "h-4 w-4 mt-0.5 shrink-0",
              "text-cyan-500"
            )} />
            <div>
              <p className="font-medium mb-1">Smart Recommendations</p>
              <p className="text-xs opacity-80">
                {userSkillLevel === "beginner" && "Starting with easier problems to build your foundation. Keep solving to unlock harder challenges!"}
                {userSkillLevel === "intermediate" && "Balanced mix of problems to strengthen your skills. You're making great progress!"}
                {userSkillLevel === "advanced" && "Challenging problems tailored for your skill level. Keep pushing your limits!"}
              </p>
            </div>
          </div>
        )}

        {/* Search Bar */}
        <div className="relative group mt-3">
            <Search className={cn(
                "absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground transition-colors",
                "group-focus-within:text-cyan-600 dark:group-focus-within:text-cyan-400"
            )} />
            <Input
            placeholder="Search Problems"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={cn(
                "pl-11 pr-4 h-10 border-[1.5px] rounded-xl transition-all text-sm",
                "bg-white dark:bg-[#111625] border-slate-200 dark:border-white/50 focus-visible:ring-cyan-500/20 focus-visible:border-cyan-500/50 text-slate-900 dark:text-white placeholder:text-muted-foreground/50"
            )}
            />
        </div>
      </div>

      {/* Scrollable Table Section */}
      <div className="flex-1 overflow-hidden px-6 pb-6">
        <div className={cn(
            "h-full rounded-2xl border-[1.5px] overflow-hidden flex flex-col",
            "border-slate-200 dark:border-white/50 bg-slate-50 dark:bg-[#111625]/50"
        )}>
            {/* Table Header Fixed */}
            <div className={cn(
                "border-[1.5px] backdrop-blur-sm z-10",
                "bg-white/80 dark:bg-[#111625]/80 border-slate-200 dark:border-white/50"
            )}>
                <Table>
                    <TableHeader>
                        <TableRow className="border-none hover:bg-transparent">
                            <TableHead className="w-16 text-muted-foreground font-medium pl-6 text-xs h-10">Status</TableHead>
                            <TableHead className="w-[200px] text-muted-foreground font-medium text-xs h-10">Title</TableHead>
                            <TableHead className="w-40 pl-8 text-muted-foreground font-medium text-left text-xs h-10">Difficulty Level</TableHead>
                            <TableHead className="w-32 pl-8 text-left text-muted-foreground font-medium text-xs h-10">Success Rate</TableHead>
                            <TableHead className="w-32 text-right text-muted-foreground font-medium pr-10 text-xs h-10">Action</TableHead>
                        </TableRow>
                    </TableHeader>
                </Table>
            </div>
            
            {/* Scrollable Body */}
            <ScrollArea className="flex-1 ">
                <Table>
                    <TableBody>
                        {filtered.map((row, index) => {
                        const isFavorite = favorites.has(row.id);
                        const isSolved = solvedProblems.has(row.id);
                        const isAttempted = attemptedProblems.has(row.id);

                        return (
                        <TableRow
                            key={row.id}
                            className={cn(
                                "cursor-pointer border-[1.5px] transition-all duration-300 group h-12",
                                "border-slate-200 dark:border-white/50 hover:bg-cyan-500/10 hover:border-l-4 hover:border-l-cyan-400 hover:shadow-[0_0_20px_rgba(34,211,238,0.1)] border-l-2 border-l-transparent dark:hover:bg-cyan-500/10"
                            )}
                            onClick={() => navigate(`/dsa/problem/${row.id}`)}
                        >
                            <TableCell className="pl-6 w-16 py-2">
                                <div className="focus:outline-none pointer-events-none">
                                    {isSolved ? (
                                        <CheckCircle2 className="h-4 w-4 text-green-500 fill-green-500/10" />
                                    ) : isAttempted ? (
                                        <div className="h-4 w-4 rounded-full bg-yellow-500/20 border-2 border-yellow-500 flex items-center justify-center">
                                            <Minus className="h-2.5 w-2.5 text-yellow-500" strokeWidth={3} />
                                        </div>
                                    ) : (
                                        <div className={cn(
                                            "h-4 w-4 rounded-full border-2 border-muted-foreground/30 transition-colors",
                                            "group-hover:border-cyan-400/50"
                                        )} />
                                    )}
                                </div>
                            </TableCell>
                            <TableCell className="py-2 w-[90px]">
                                <div className="flex items-center gap-3">
                                    <button 
                                        onClick={(e) => toggleFavorite(e, row.id)}
                                        className="focus:outline-none"
                                    >
                                        <Star 
                                            className={cn(
                                                "h-3.5 w-3.5 transition-colors", 
                                                isFavorite ? "text-yellow-500 fill-yellow-500" : "text-muted-foreground hover:text-yellow-500"
                                            )} 
                                        />
                                    </button>
                                    <span className={cn(
                                        "font-medium text-sm transition-colors",
                                        "text-slate-700 dark:text-white/90 group-hover:text-slate-900 dark:group-hover:text-white"
                                    )}>
                                        {row.title}
                                    </span>
                                </div>
                            </TableCell>
                            <TableCell className="text-center w-40 py-2">
                            <span className={cn("inline-flex items-left gap-1.5 px-2 py-0.5 rounded-full text-[10px] uppercase font-bold border", difficultyColor(row.difficulty))}>
                                {row.difficulty === "Medium" ? "Med." : row.difficulty}
                            </span>
                            </TableCell>
                            <TableCell className="text-center text-muted-foreground w-32 py-2 text-sm">
                                {successRates.has(row.id) 
                                  ? `${successRates.get(row.id)!.successRate.toFixed(1)}%`
                                  : `${row.acceptance}%`
                                }
                            </TableCell>
                            <TableCell className="text-right pr-6 w-32 py-2">
                                <Button 
                                    size="sm" 
                                    variant="outline"
                                    className={cn(
                                        "h-7 text-xs px-3 rounded-full transition-all bg-transparent",
                                        "border-cyan-500/20 text-cyan-600 dark:text-cyan-400 hover:bg-cyan-400 hover:text-white dark:hover:text-[#0B0F19]"
                                    )}
                                >
                                    Solve
                                </Button>
                            </TableCell>
                        </TableRow>
                        )})}
                    </TableBody>
                </Table>
            </ScrollArea>
        </div>
      </div>
    </div>
  );
}
