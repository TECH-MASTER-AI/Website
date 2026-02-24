/**
 * Duel rating (ranking) stored in localStorage.
 * +points on win, -points on loss.
 * Includes rank tiers, win/loss history, and streak tracking.
 */

const STORAGE_KEY = "dsa_duel_rating";
const STATS_KEY = "dsa_duel_stats";
const DEFAULT_RATING = 1000;
const WIN_POINTS = 10;
const LOSS_POINTS = 5;

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
  { name: "Platinum",    color: "text-cyan-400",    minRating: 1500, icon: "💎" },
  { name: "Diamond",     color: "text-blue-400",    minRating: 1700, icon: "💠" },
  { name: "Master",      color: "text-purple-400",  minRating: 2000, icon: "👑" },
];

export function getDuelRating(): number {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw == null) return DEFAULT_RATING;
    const n = parseInt(raw, 10);
    return Number.isNaN(n) ? DEFAULT_RATING : Math.max(0, n);
  } catch {
    return DEFAULT_RATING;
  }
}

export function getRankTier(rating?: number): RankTier {
  const r = rating ?? getDuelRating();
  let tier = RANK_TIERS[0];
  for (const t of RANK_TIERS) {
    if (r >= t.minRating) tier = t;
  }
  return tier;
}

export function getDuelStats(): DuelStats {
  try {
    const raw = localStorage.getItem(STATS_KEY);
    if (!raw) return { wins: 0, losses: 0, streak: 0, bestStreak: 0, history: [] };
    return JSON.parse(raw);
  } catch {
    return { wins: 0, losses: 0, streak: 0, bestStreak: 0, history: [] };
  }
}

function saveStats(stats: DuelStats) {
  // Keep last 50 history entries
  if (stats.history.length > 50) stats.history = stats.history.slice(-50);
  localStorage.setItem(STATS_KEY, JSON.stringify(stats));
}

export function addDuelWin(opponent: string = "Opponent"): number {
  const current = getDuelRating();
  const next = current + WIN_POINTS;
  localStorage.setItem(STORAGE_KEY, String(next));

  const stats = getDuelStats();
  stats.wins++;
  stats.streak = Math.max(0, stats.streak) + 1;
  stats.bestStreak = Math.max(stats.bestStreak, stats.streak);
  stats.history.push({ result: "win", rating: next, opponent, timestamp: Date.now() });
  saveStats(stats);

  return next;
}

export function addDuelLoss(opponent: string = "Opponent"): number {
  const current = getDuelRating();
  const next = Math.max(0, current - LOSS_POINTS);
  localStorage.setItem(STORAGE_KEY, String(next));

  const stats = getDuelStats();
  stats.losses++;
  stats.streak = Math.min(0, stats.streak) - 1;
  stats.history.push({ result: "loss", rating: next, opponent, timestamp: Date.now() });
  saveStats(stats);

  return next;
}

export function getWinPoints(): number {
  return WIN_POINTS;
}

export function getLossPoints(): number {
  return LOSS_POINTS;
}
