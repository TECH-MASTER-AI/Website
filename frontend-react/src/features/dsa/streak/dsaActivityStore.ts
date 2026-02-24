/**
 * DSA activity store: track days with submissions/solves for streak and calendar.
 * Uses localStorage keyed by user (main or DSA) so streak works for both logins.
 */

const STORAGE_KEY = "dsa_activity_dates";

function dateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function parseStoredDates(raw: string): Set<string> {
  try {
    const arr = JSON.parse(raw) as string[];
    return new Set(Array.isArray(arr) ? arr : []);
  } catch {
    return new Set();
  }
}

export function getActivityDates(): Set<string> {
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? parseStoredDates(raw) : new Set();
}

export function recordActivity(): void {
  const key = dateKey(new Date());
  const set = getActivityDates();
  set.add(key);
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...set]));
}

export function getCurrentStreak(): number {
  const set = getActivityDates();
  if (set.size === 0) return 0;
  const today = dateKey(new Date());
  if (!set.has(today)) return 0;
  let streak = 0;
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  while (true) {
    const k = dateKey(d);
    if (!set.has(k)) break;
    streak++;
    d.setDate(d.getDate() - 1);
  }
  return streak;
}

export function getLongestStreak(): number {
  const set = getActivityDates();
  if (set.size === 0) return 0;
  const sorted = [...set].sort();
  let max = 1;
  let current = 1;
  for (let i = 1; i < sorted.length; i++) {
    const prev = new Date(sorted[i - 1]).getTime();
    const curr = new Date(sorted[i]).getTime();
    const diffDays = (curr - prev) / (24 * 60 * 60 * 1000);
    if (diffDays === 1) current++;
    else current = 1;
    max = Math.max(max, current);
  }
  return max;
}

export function getDatesForCalendar(weeks = 12): string[] {
  const set = getActivityDates();
  return [...set];
}
