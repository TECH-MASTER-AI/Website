import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User, Trophy, Activity, Flame, Swords, Camera, LogIn, Loader2, TrendingUp, ChevronRight } from "lucide-react";
import { useDuelUser } from "@/features/dsa/duels/useDuelUser";
import { getCombinedRating, getRankTier, calculateProblemsRating, getRankProgress, getAllRankTiers } from "@/features/dsa/duels/duelRating";
import { getCurrentStreak, getLongestStreak } from "@/features/dsa/streak/dsaActivityStore";
import { supabase } from "@/lib/supabase";
import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext";
import {
  getProfilePhoto,
  setProfilePhoto,
  getProfileGender,
  setProfileGender,
  getLoginStreak,
  recordLoginDay,
  type ProfileGender,
} from "@/features/dsa/profile/dsaProfileStore";

// Simple GitHub-style heatmap placeholder (grid of cells)
function HeatmapPlaceholder() {
  const rows = 7;
  const cols = 52;
  const total = rows * cols;
  const filled = Math.floor(total * 0.35);

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium">Submission activity</p>
      <div className="flex gap-0.5 flex-wrap max-w-full" style={{ width: "min(100%, 400px)" }}>
        {Array.from({ length: total }).map((_, i) => (
          <div
            key={i}
            className={`w-2 h-2 rounded-sm ${
              i < filled ? "bg-primary/60" : "bg-muted"
            }`}
            title={`${i < filled ? "1" : "0"} submission`}
          />
        ))}
      </div>
      <p className="text-xs text-muted-foreground">Less → More</p>
    </div>
  );
}

export default function DsaProfile() {
  const user = useDuelUser();
  const { user: supabaseUser } = useSupabaseAuth();
  const [photo, setPhotoState] = useState<string | null>(() => getProfilePhoto());
  const [gender, setGenderState] = useState<ProfileGender | null>(() => getProfileGender());
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Real-time stats from Supabase
  const [stats, setStats] = useState({ easy: 0, medium: 0, hard: 0, total: 0 });
  const [loadingStats, setLoadingStats] = useState(true);
  const [currentRating, setCurrentRating] = useState(900);
  const [previousRating, setPreviousRating] = useState(900);

  const currentStreak = getCurrentStreak();
  const longestStreak = getLongestStreak();
  const loginStreak = getLoginStreak();
  const rankTier = getRankTier(currentRating);
  const rankProgress = getRankProgress(currentRating);
  const allTiers = getAllRankTiers();

  // Load initial rating
  useEffect(() => {
    const loadRating = async () => {
      const rating = await getCombinedRating();
      setCurrentRating(rating);
      setPreviousRating(rating);
    };
    loadRating();
  }, []);

  // Fetch real solved problems from Supabase
  useEffect(() => {
    const fetchSolvedProblems = async () => {
      if (!supabaseUser) {
        setLoadingStats(false);
        return;
      }

      try {
        setLoadingStats(true);

        // Fetch all accepted submissions for this user
        const { data: submissions, error: submissionsError } = await supabase
          .from('dsa_submissions')
          .select('problem_id')
          .eq('user_id', supabaseUser.id)
          .eq('status', 'accepted')
          .order('created_at', { ascending: false });

        if (submissionsError) {
          console.error('Error fetching submissions:', submissionsError);
          throw submissionsError;
        }

        console.log('📊 Fetched submissions:', submissions);

        // Get unique problem IDs (in case user solved same problem multiple times)
        const uniqueProblemIds = [...new Set(submissions?.map(s => s.problem_id) || [])];
        
        console.log('📊 Unique problem IDs:', uniqueProblemIds);

        // Fetch difficulties for these problems from dsa_questions
        const { data: questions, error: questionsError } = await supabase
          .from('dsa_questions')
          .select('id, difficulty')
          .in('id', uniqueProblemIds.map(id => parseInt(id)).filter(id => !isNaN(id)));

        if (questionsError) {
          console.error('Error fetching questions:', questionsError);
          // Continue with 0 stats if we can't fetch questions
        }

        console.log('📊 Fetched questions:', questions);

        // Count by difficulty
        let easy = 0, medium = 0, hard = 0;
        questions?.forEach((q: any) => {
          if (q.difficulty === 'Easy') easy++;
          else if (q.difficulty === 'Medium') medium++;
          else if (q.difficulty === 'Hard') hard++;
        });

        console.log('📊 Stats:', { easy, medium, hard });

        setStats({
          easy,
          medium,
          hard,
          total: easy + medium + hard
        });

        // Update rating based on problems solved
        setPreviousRating(currentRating);
        const newRating = calculateProblemsRating(easy, medium, hard);
        setCurrentRating(newRating);
        
        console.log('🏆 Rating updated:', { previous: currentRating, new: newRating, tier: getRankTier(newRating).name });
      } catch (error) {
        console.error('Error fetching solved problems:', error);
        // Fallback to 0 if error
        setStats({ easy: 0, medium: 0, hard: 0, total: 0 });
      } finally {
        setLoadingStats(false);
      }
    };

    fetchSolvedProblems();

    // Subscribe to real-time updates
    const channel = supabase
      .channel('profile-submissions')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'dsa_submissions',
          filter: supabaseUser ? `user_id=eq.${supabaseUser.id}` : undefined
        },
        () => {
          console.log('🔄 Real-time update received, refetching...');
          // Refetch when new submission is added
          fetchSolvedProblems();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabaseUser]);

  useEffect(() => {
    if (user) recordLoginDay();
  }, [user]);

  useEffect(() => {
    setPhotoState(getProfilePhoto());
    setGenderState(getProfileGender());
  }, [user?.id]);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setProfilePhoto(dataUrl);
      setPhotoState(dataUrl);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleGenderSelect = (g: ProfileGender) => {
    setProfileGender(g);
    setGenderState(g);
  };

  if (!user) {
    return (
      <div className="flex-1 p-6 flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-muted-foreground">Log in to view your profile and stats.</p>
          <Button asChild>
            <Link to="/login">Log in</Link>
          </Button>
        </div>
      </div>
    );
  }

  const easy = stats.easy;
  const medium = stats.medium;
  const hard = stats.hard;
  const totalSolved = stats.total;

  return (
    <div className="flex-1 p-6">
      <div className="container max-w-2xl mx-auto space-y-6">
        {/* Profile header with photo */}
        <div className="flex items-start gap-6 flex-wrap">
          <div className="relative group">
            <div className="h-24 w-24 rounded-full overflow-hidden border-2 border-border bg-muted flex items-center justify-center shrink-0">
              {photo ? (
                <img src={photo} alt="Profile" className="h-full w-full object-cover" />
              ) : (
                <User className="h-12 w-12 text-muted-foreground" />
              )}
            </div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
            >
              <Camera className="h-8 w-8 text-white" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handlePhotoChange}
            />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold">{user.username}</h1>
            <p className="text-muted-foreground text-sm">{user.email}</p>
            <div className="flex flex-wrap items-center gap-3 mt-2 text-sm">
              <span className="flex items-center gap-1 text-orange-600 dark:text-orange-400">
                <Flame className="h-4 w-4" />
                {currentStreak} day solve streak
              </span>
              <span className="flex items-center gap-1 text-primary">
                <LogIn className="h-4 w-4" />
                {loginStreak} day login streak
              </span>
              <Link to="/dsa/calendar" className="text-primary hover:underline">
                View calendar
              </Link>
            </div>
          </div>
        </div>

        {/* Profile settings: gender (for 1v1 bot) */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Profile settings</CardTitle>
            <CardDescription>
              Used for Code Royale: your opponent replies as the opposite gender (male → female name, female → male name). Set at login; change here if needed.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Button
                variant={gender === "male" ? "default" : "outline"}
                size="sm"
                onClick={() => handleGenderSelect("male")}
              >
                Male
              </Button>
              <Button
                variant={gender === "female" ? "default" : "outline"}
                size="sm"
                onClick={() => handleGenderSelect("female")}
              >
                Female
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Stats: 1v1 ranking, problems, streaks */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              Stats & ranking
            </CardTitle>
            <CardDescription>
              Your Code Royale rank, practice streaks, and problem stats.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {loadingStats ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : (
              <>
                {/* Rank Badge - Show prominently with progress bar */}
                <div className="rounded-lg border-2 border-primary/50 bg-gradient-to-br from-primary/10 to-primary/5 p-4 mb-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Current Rank</p>
                      <div className="flex items-center gap-2">
                        <span className="text-3xl">{rankTier.icon}</span>
                        <div>
                          <p className={`text-xl font-bold ${rankTier.color}`}>{rankTier.name}</p>
                          <p className="text-sm text-muted-foreground">Rating: {currentRating}</p>
                        </div>
                      </div>
                    </div>
                    {currentRating > previousRating && (
                      <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                        <TrendingUp className="h-4 w-4" />
                        <span className="text-sm font-semibold">+{currentRating - previousRating}</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Progress Bar to Next Rank */}
                  {rankProgress.next && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Progress to {rankProgress.next.name}</span>
                        <span className="font-medium text-primary">{rankProgress.pointsNeeded} pts needed</span>
                      </div>
                      <div className="relative h-3 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary to-primary/80 rounded-full transition-all duration-500"
                          style={{ width: `${rankProgress.progress}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{rankProgress.current.name}</span>
                        <ChevronRight className="h-3 w-3" />
                        <span className={rankProgress.next.color}>{rankProgress.next.icon} {rankProgress.next.name}</span>
                      </div>
                    </div>
                  )}
                  
                  {!rankProgress.next && (
                    <div className="text-center py-2">
                      <p className="text-sm font-semibold text-primary">🎉 Maximum Rank Achieved!</p>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="rounded-lg border bg-muted/30 p-3">
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Swords className="h-3.5 w-3.5" />
                      Code Royale ranking
                    </p>
                    <p className="text-xl font-bold tabular-nums mt-0.5">{currentRating}</p>
                  </div>
                  <div className="rounded-lg border bg-muted/30 p-3">
                    <p className="text-xs text-muted-foreground">Problems solved</p>
                    <p className="text-xl font-bold tabular-nums mt-0.5">{totalSolved}</p>
                  </div>
                  <div className="rounded-lg border bg-muted/30 p-3">
                    <p className="text-xs text-muted-foreground">Solve streak</p>
                    <p className="text-xl font-bold tabular-nums mt-0.5">{currentStreak} days</p>
                  </div>
                  <div className="rounded-lg border bg-muted/30 p-3">
                    <p className="text-xs text-muted-foreground">Login streak</p>
                    <p className="text-xl font-bold tabular-nums mt-0.5">{loginStreak} days</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary" className="bg-green-500/20 text-green-600 dark:text-green-400">
                    Easy: {easy} (+5 pts each)
                  </Badge>
                  <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-600 dark:text-yellow-400">
                    Medium: {medium} (+10 pts each)
                  </Badge>
                  <Badge variant="secondary" className="bg-red-500/20 text-red-600 dark:text-red-400">
                    Hard: {hard} (+20 pts each)
                  </Badge>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Rank Ladder - Show all tiers */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              Rank Ladder
            </CardTitle>
            <CardDescription>
              All rank tiers and rating requirements. Win duels or solve problems to climb!
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {allTiers.slice(1).reverse().map((tier, index) => {
                const isCurrentTier = currentRating >= tier.minRating && 
                  (index === 0 || currentRating < allTiers[allTiers.length - index].minRating);
                
                return (
                  <div 
                    key={tier.name}
                    className={`flex items-center justify-between p-3 rounded-lg border transition-all ${
                      isCurrentTier 
                        ? 'bg-primary/10 border-primary/50 shadow-sm' 
                        : 'bg-muted/30 border-border/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{tier.icon}</span>
                      <div>
                        <p className={`font-semibold ${tier.color} ${isCurrentTier ? 'text-base' : 'text-sm'}`}>
                          {tier.name}
                          {isCurrentTier && <span className="ml-2 text-xs text-primary">(Current)</span>}
                        </p>
                        <p className="text-xs text-muted-foreground">{tier.minRating}+ rating</p>
                      </div>
                    </div>
                    {currentRating >= tier.minRating && (
                      <div className="text-green-600 dark:text-green-400">
                        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Activity
            </CardTitle>
            <CardDescription>
              Solve problems to build your streak. View full calendar for details.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <HeatmapPlaceholder />
            <Button variant="outline" className="mt-4" asChild>
              <Link to="/dsa/calendar">Open Calendar & Streak</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
