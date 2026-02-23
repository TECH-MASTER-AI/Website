/**
 * Duel rating (ranking) stored in Supabase for real-time sync across devices.
 * +points on win, -points on loss.
 * +points for solving problems (real-time rank upgrade)
 * Includes rank tiers, win/loss history, and streak tracking.
 */

import { supabase } from "@/lib/supabase";

const DEFAULT_RATING = 900;
const WIN_POINTS = 10;
const LOSS_POINTS = 5;

// Points for solving problems
const EASY_PROBLEM_POINTS = 5;
const MEDIUM_PROBLEM_POINTS = 10;
const HARD_PROBLEM_POINTS = 20;

export interface RankTier {
  name: string;
  color: string;
  minRating: number;
  icon: string;
}

export interface DuelStats {
  wins: number;
  losses: number;
  streak: number;
  bestStreak: number;
  history: Array<{ result: "win" | "loss"; rating: number; opponent: string; timestamp: number }>;
}

const RANK_TIERS: RankTier[] = [
  { name: "Unranked",    color: "text-slate-400",   minRating: 0,    icon: "—" },
  { name: "Bronze III",  color: "text-amber-700",   minRating: 900,  icon: "🥉" },
  { name: "Bronze II",   color: "text-amber-600",   minRating: 950,  icon: "🥉" },
  { name: "Bronze I",    color: "text-amber-500",   minRating: 1000, icon: "🥉" },
  { name: "Silver III",  color: "text-slate-300",   minRating: 1050, icon: "🥈" },
  { name: "Silver II",   color: "text-slate-200",   minRating: 1100, icon: "🥈" },
  { name: "Silver I",    color: "text-white",       minRating: 1150, icon: "🥈" },
  { name: "Gold III",    color: "text-yellow-500",  minRating: 1200, icon: "🏅" },
  { name: "Gold II",     color: "text-yellow-400",  minRating: 1300, icon: "🏅" },
  { name: "Gold I",      color: "text-yellow-300",  minRating: 1400, icon: "🏅" },
  { name: "Platinum III", color: "text-cyan-500",   minRating: 1500, icon: "💎" },
  { name: "Platinum II",  color: "text-cyan-400",   minRating: 1600, icon: "💎" },
  { name: "Platinum I",   color: "text-cyan-300",   minRating: 1700, icon: "💎" },
  { name: "Diamond III",  color: "text-blue-500",   minRating: 1800, icon: "💠" },
  { name: "Diamond II",   color: "text-blue-400",   minRating: 1900, icon: "💠" },
  { name: "Diamond I",    color: "text-blue-300",   minRating: 2000, icon: "💠" },
  { name: "Master III",   color: "text-purple-500", minRating: 2100, icon: "👑" },
  { name: "Master II",    color: "text-purple-400", minRating: 2250, icon: "👑" },
  { name: "Master I",     color: "text-purple-300", minRating: 2400, icon: "👑" },
];

/**
 * Get current user's duel rating from Supabase
 */
export async function getDuelRating(): Promise<number> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return DEFAULT_RATING;

    const { data, error } = await supabase
      .from('dsa_users')
      .select('duel_rating')
      .eq('id', user.id)
      .single();

    if (error || !data) return DEFAULT_RATING;
    return data.duel_rating || DEFAULT_RATING;
  } catch {
    return DEFAULT_RATING;
  }
}

/**
 * Get rank tier for a given rating
 */
export function getRankTier(rating?: number): RankTier {
  const r = rating ?? DEFAULT_RATING;
  let tier = RANK_TIERS[0];
  for (const t of RANK_TIERS) {
    if (r >= t.minRating) tier = t;
  }
  return tier;
}

/**
 * Get duel stats from Supabase
 */
export async function getDuelStats(): Promise<DuelStats> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { wins: 0, losses: 0, streak: 0, bestStreak: 0, history: [] };

    const { data, error } = await supabase
      .from('dsa_users')
      .select('duel_wins, duel_losses, duel_streak, duel_best_streak')
      .eq('id', user.id)
      .single();

    if (error || !data) return { wins: 0, losses: 0, streak: 0, bestStreak: 0, history: [] };

    // Get history
    const { data: historyData } = await supabase
      .from('duel_history')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50);

    const history = (historyData || []).map(h => ({
      result: h.result as "win" | "loss",
      rating: h.new_rating,
      opponent: h.opponent_name || "Opponent",
      timestamp: new Date(h.created_at).getTime(),
    }));

    return {
      wins: data.duel_wins || 0,
      losses: data.duel_losses || 0,
      streak: data.duel_streak || 0,
      bestStreak: data.duel_best_streak || 0,
      history,
    };
  } catch {
    return { wins: 0, losses: 0, streak: 0, bestStreak: 0, history: [] };
  }
}

/**
 * Add a duel win - updates Supabase
 */
export async function addDuelWin(opponent: string = "Opponent"): Promise<number> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return DEFAULT_RATING;

    // Get current stats
    const { data: currentData } = await supabase
      .from('dsa_users')
      .select('duel_rating, duel_wins, duel_streak, duel_best_streak')
      .eq('id', user.id)
      .single();

    const currentRating = currentData?.duel_rating || DEFAULT_RATING;
    const newRating = currentRating + WIN_POINTS;
    const currentWins = currentData?.duel_wins || 0;
    const currentStreak = Math.max(0, currentData?.duel_streak || 0) + 1;
    const bestStreak = Math.max(currentData?.duel_best_streak || 0, currentStreak);

    // Update user stats
    await supabase
      .from('dsa_users')
      .update({
        duel_rating: newRating,
        duel_wins: currentWins + 1,
        duel_streak: currentStreak,
        duel_best_streak: bestStreak,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id);

    // Add to history
    await supabase
      .from('duel_history')
      .insert({
        user_id: user.id,
        result: 'win',
        rating_change: WIN_POINTS,
        new_rating: newRating,
        opponent_name: opponent,
      });

    return newRating;
  } catch (error) {
    console.error('Error adding duel win:', error);
    return DEFAULT_RATING;
  }
}

/**
 * Add a duel loss - updates Supabase
 */
export async function addDuelLoss(opponent: string = "Opponent"): Promise<number> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return DEFAULT_RATING;

    // Get current stats
    const { data: currentData } = await supabase
      .from('dsa_users')
      .select('duel_rating, duel_losses, duel_streak')
      .eq('id', user.id)
      .single();

    const currentRating = currentData?.duel_rating || DEFAULT_RATING;
    const newRating = Math.max(0, currentRating - LOSS_POINTS);
    const currentLosses = currentData?.duel_losses || 0;
    const currentStreak = Math.min(0, currentData?.duel_streak || 0) - 1;

    // Update user stats
    await supabase
      .from('dsa_users')
      .update({
        duel_rating: newRating,
        duel_losses: currentLosses + 1,
        duel_streak: currentStreak,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id);

    // Add to history
    await supabase
      .from('duel_history')
      .insert({
        user_id: user.id,
        result: 'loss',
        rating_change: -LOSS_POINTS,
        new_rating: newRating,
        opponent_name: opponent,
      });

    return newRating;
  } catch (error) {
    console.error('Error adding duel loss:', error);
    return DEFAULT_RATING;
  }
}

export function getWinPoints(): number {
  return WIN_POINTS;
}

export function getLossPoints(): number {
  return LOSS_POINTS;
}

/**
 * Calculate rating based on problems solved
 */
export function calculateProblemsRating(easy: number, medium: number, hard: number): number {
  return DEFAULT_RATING + 
    (easy * EASY_PROBLEM_POINTS) + 
    (medium * MEDIUM_PROBLEM_POINTS) + 
    (hard * HARD_PROBLEM_POINTS);
}

/**
 * Get the combined rating (from both duels and problems)
 */
export async function getCombinedRating(): Promise<number> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return DEFAULT_RATING;

    const { data } = await supabase
      .from('dsa_users')
      .select('duel_rating')
      .eq('id', user.id)
      .single();

    if (!data) return DEFAULT_RATING;
    
    // Return only duel rating (not combined with problems rating)
    return data.duel_rating || DEFAULT_RATING;
  } catch {
    return DEFAULT_RATING;
  }
}

/**
 * Get points for solving a problem by difficulty
 */
export function getProblemPoints(difficulty: 'Easy' | 'Medium' | 'Hard'): number {
  switch (difficulty) {
    case 'Easy': return EASY_PROBLEM_POINTS;
    case 'Medium': return MEDIUM_PROBLEM_POINTS;
    case 'Hard': return HARD_PROBLEM_POINTS;
    default: return 0;
  }
}

/**
 * Get the next rank tier
 */
export function getNextRankTier(currentRating: number): RankTier | null {
  const currentIndex = RANK_TIERS.findIndex(tier => {
    const nextTier = RANK_TIERS[RANK_TIERS.indexOf(tier) + 1];
    return currentRating >= tier.minRating && (!nextTier || currentRating < nextTier.minRating);
  });
  
  if (currentIndex === -1 || currentIndex >= RANK_TIERS.length - 1) {
    return null;
  }
  
  return RANK_TIERS[currentIndex + 1];
}

/**
 * Get progress to next rank (0-100)
 */
export function getRankProgress(currentRating: number): {
  current: RankTier;
  next: RankTier | null;
  progress: number;
  pointsNeeded: number;
  pointsInCurrentTier: number;
} {
  const current = getRankTier(currentRating);
  const next = getNextRankTier(currentRating);
  
  if (!next) {
    return {
      current,
      next: null,
      progress: 100,
      pointsNeeded: 0,
      pointsInCurrentTier: 0,
    };
  }
  
  const tierStart = current.minRating;
  const tierEnd = next.minRating;
  const tierRange = tierEnd - tierStart;
  const pointsInCurrentTier = currentRating - tierStart;
  const progress = Math.min(100, Math.max(0, (pointsInCurrentTier / tierRange) * 100));
  const pointsNeeded = tierEnd - currentRating;
  
  return {
    current,
    next,
    progress,
    pointsNeeded,
    pointsInCurrentTier,
  };
}

/**
 * Get all rank tiers (for displaying rank ladder)
 */
export function getAllRankTiers(): RankTier[] {
  return RANK_TIERS;
}
