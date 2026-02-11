import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Trophy, Loader2, Info } from "lucide-react";
import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext";
import { supabase } from "@/lib/supabase";
import { calculateProblemsRating, getRankTier, getAllRankTiers } from "@/features/dsa/duels/duelRating";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface LeaderboardRow {
  rank: number;
  username: string;
  userId: string;
  rating: number;
  problemsSolved: number;
  rankTier: string;
  rankIcon: string;
  rankColor: string;
}

const PAGE_SIZE = 20;

export default function DsaLeaderboard() {
  const { user } = useSupabaseAuth();
  const [page, setPage] = useState(1);
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('Fetching leaderboard data...');
      console.log('Current user:', user?.id);

      // Try to fetch submissions - this will only work if RLS allows it
      // For now, we'll use a service role key or create a public view
      const { data: submissionsData, error: submissionsError } = await supabase
        .from('dsa_submissions')
        .select('user_id, problem_id, status, created_at');

      console.log('Submissions query result:', { data: submissionsData, error: submissionsError });

      // If RLS blocks us, we'll only see our own submissions
      // In that case, show a message to admin to fix RLS policies
      if (submissionsError) {
        console.error('Supabase error:', submissionsError);
        
        // Check if it's an RLS error
        if (submissionsError.message?.includes('policy') || submissionsError.code === 'PGRST301') {
          setError('Leaderboard requires database policy update. Please add a public read policy for dsa_submissions table.');
          setLoading(false);
          return;
        }
        
        throw submissionsError;
      }

      if (!submissionsData || submissionsData.length === 0) {
        console.log('No submissions found in database');
        setLeaderboardData([]);
        setLoading(false);
        return;
      }

      console.log(`Found ${submissionsData.length} total submissions`);

      // Count UNIQUE problems solved per user (only Accepted submissions - case insensitive)
      const userStats = new Map<string, Set<number>>();
      const acceptedCount = submissionsData.filter(s => s.status?.toLowerCase() === 'accepted').length;
      
      console.log(`Accepted submissions: ${acceptedCount}`);

      submissionsData?.forEach((submission) => {
        // Only count Accepted submissions (case-insensitive)
        if (submission.status?.toLowerCase() === 'accepted') {
          if (!userStats.has(submission.user_id)) {
            userStats.set(submission.user_id, new Set());
          }
          userStats.get(submission.user_id)?.add(submission.problem_id);
        }
      });

      console.log('User stats:', Array.from(userStats.entries()).map(([id, problems]) => ({
        userId: id,
        problemCount: problems.size,
        isCurrentUser: id === user?.id
      })));

      // Create leaderboard entries with difficulty breakdown
      const leaderboard: LeaderboardRow[] = [];
      
      for (const [userId, problemsSet] of userStats.entries()) {
        const problemsSolved = problemsSet.size;
        
        // Skip users with 0 problems solved
        if (problemsSolved === 0) continue;

        // Get username - prioritize current user
        let username = 'Anonymous';
        
        if (user && user.id === userId) {
          username = user.email?.split('@')[0] || 'You';
          console.log('Found current user in leaderboard:', username, 'Problems:', problemsSolved);
        } else {
          // For other users, use a generic name (since we can't access auth.users)
          username = `User_${userId.slice(0, 8)}`;
        }
        
        // Count problems by difficulty for this user
        let easy = 0, medium = 0, hard = 0;
        submissionsData?.forEach((sub) => {
          if (sub.user_id === userId && sub.status?.toLowerCase() === 'accepted') {
            const difficulty = sub.dsa_questions?.difficulty;
            if (difficulty === 'Easy') easy++;
            else if (difficulty === 'Medium') medium++;
            else if (difficulty === 'Hard') hard++;
          }
        });
        
        // Calculate rating based on problems solved (same formula as profile)
        const rating = calculateProblemsRating(easy, medium, hard);
        const tier = getRankTier(rating);

        leaderboard.push({
          rank: 0,
          username,
          userId,
          rating,
          problemsSolved,
          rankTier: tier.name,
          rankIcon: tier.icon,
          rankColor: tier.color,
        });
      }

      console.log('Leaderboard entries created:', leaderboard.length);

      // Sort by problems solved (descending), then by rating
      leaderboard.sort((a, b) => {
        if (b.problemsSolved !== a.problemsSolved) {
          return b.problemsSolved - a.problemsSolved;
        }
        return b.rating - a.rating;
      });

      // Assign ranks
      leaderboard.forEach((entry, index) => {
        entry.rank = index + 1;
      });

      console.log('Final leaderboard:', leaderboard);
      setLeaderboardData(leaderboard);
    } catch (err) {
      console.error('Error fetching leaderboard:', err);
      setError(`Failed to load leaderboard: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.ceil(leaderboardData.length / PAGE_SIZE) || 1;
  const paginated = leaderboardData.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  if (loading) {
    return (
      <div className="flex-1 p-6 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading leaderboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 p-6 flex items-center justify-center">
        <div className="text-center max-w-md">
          <p className="text-destructive mb-4">{error}</p>
          {error.includes('policy') && (
            <div className="bg-muted p-4 rounded-lg text-left text-sm mb-4">
              <p className="font-semibold mb-2">Fix Required:</p>
              <p className="text-muted-foreground mb-2">Run this SQL in Supabase SQL Editor:</p>
              <code className="block bg-background p-2 rounded text-xs overflow-x-auto">
                CREATE POLICY "Public can view all submissions for leaderboard" ON dsa_submissions<br/>
                FOR SELECT USING (true);
              </code>
            </div>
          )}
          <button 
            onClick={fetchLeaderboard}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6">
      <div className="container max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-2xl font-bold">Leaderboard</h1>
              <p className="text-muted-foreground text-sm mt-0.5">
                Top users by problems solved • Real-time rankings
              </p>
            </div>
          </div>
          <button
            onClick={fetchLeaderboard}
            className="px-4 py-2 text-sm bg-primary/10 text-primary rounded-md hover:bg-primary/20 transition-colors"
          >
            Refresh
          </button>
        </div>

        {leaderboardData.length === 0 ? (
          <div className="rounded-md border p-8 text-center">
            <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No users on the leaderboard yet.</p>
            <p className="text-sm text-muted-foreground mt-2">Start solving problems to appear here!</p>
          </div>
        ) : (
          <>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-20">Rank</TableHead>
                    <TableHead>Username</TableHead>
                    <TableHead className="text-right">Rating</TableHead>
                    <TableHead className="text-right">Problems Solved</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginated.map((row) => {
                    const isCurrentUser = user?.id === row.userId;
                    return (
                      <TableRow
                        key={row.userId}
                        className={isCurrentUser ? "bg-primary/10 font-medium" : ""}
                      >
                        <TableCell>
                          <span className={row.rank <= 3 ? "font-bold text-primary" : ""}>
                            {row.rank <= 3 && "🏆 "}#{row.rank}
                          </span>
                        </TableCell>
                        <TableCell>
                          {row.username}
                          {isCurrentUser && (
                            <span className="ml-2 text-xs text-primary font-semibold">(You)</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right font-mono">{row.rating}</TableCell>
                        <TableCell className="text-right font-mono">{row.problemsSolved}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            {totalPages > 1 && (
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      onClick={(e) => { e.preventDefault(); if (page > 1) setPage(page - 1); }}
                      className={page <= 1 ? "pointer-events-none opacity-50" : ""}
                    />
                  </PaginationItem>
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((pageNum) => (
                    <PaginationItem key={pageNum}>
                      <PaginationLink 
                        href="#" 
                        onClick={(e) => { e.preventDefault(); setPage(pageNum); }} 
                        isActive={page === pageNum}
                      >
                        {pageNum}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      onClick={(e) => { e.preventDefault(); if (page < totalPages) setPage(page + 1); }}
                      className={page >= totalPages ? "pointer-events-none opacity-50" : ""}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            )}
          </>
        )}
      </div>
    </div>
  );
}
