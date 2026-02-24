/**
 * DSA profile: photo, gender, login streak, solved problems. Stored in localStorage.
 * Solved problems sync to backend when user is logged in (Firebase).
 */

const PHOTO_KEY = "dsa_profile_photo";
const GENDER_KEY = "dsa_profile_gender";
const LOGIN_STREAK_KEY = "dsa_login_streak"; // { lastDate: "YYYY-MM-DD", streak: number }
const SOLVED_PROBLEMS_KEY = "dsa_solved_problems"; // string[] of problem ids (slugs)

function dateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export type ProfileGender = "male" | "female";

export function getProfilePhoto(): string | null {
  return localStorage.getItem(PHOTO_KEY);
}

export function setProfilePhoto(dataUrlOrNull: string | null): void {
  if (dataUrlOrNull == null) localStorage.removeItem(PHOTO_KEY);
  else localStorage.setItem(PHOTO_KEY, dataUrlOrNull);
}

export function getProfileGender(): ProfileGender | null {
  const v = localStorage.getItem(GENDER_KEY);
  if (v === "male" || v === "female") return v;
  return null;
}

export function setProfileGender(g: ProfileGender | null): void {
  if (g == null) localStorage.removeItem(GENDER_KEY);
  else localStorage.setItem(GENDER_KEY, g);
}

/** Call when user logs in or opens app (e.g. profile page load while logged in). */
export function recordLoginDay(): void {
  const today = dateKey(new Date());
  let raw = localStorage.getItem(LOGIN_STREAK_KEY);
  let lastDate: string | null = null;
  let streak = 0;
  if (raw) {
    try {
      const o = JSON.parse(raw) as { lastDate?: string; streak?: number };
      lastDate = o.lastDate ?? null;
      streak = Math.max(0, o.streak ?? 0);
    } catch {
      /* ignore */
    }
  }
  if (lastDate === today) return; // already recorded today
  const yesterday = dateKey(new Date(Date.now() - 864e5));
  if (lastDate === yesterday) streak += 1;
  else if (lastDate != null) streak = 1; // gap: reset to 1
  else streak = 1;
  localStorage.setItem(LOGIN_STREAK_KEY, JSON.stringify({ lastDate: today, streak }));
}

/** Call once after successful DSA or main login to count login streak. */
export function recordLoginStreak(): void {
  recordLoginDay();
}

function getLoginStreakData(): { lastDate: string; streak: number } {
  const raw = localStorage.getItem(LOGIN_STREAK_KEY);
  if (!raw) return { lastDate: "", streak: 0 };
  try {
    const o = JSON.parse(raw) as { lastDate?: string; streak?: number };
    const lastDate = o.lastDate ?? "";
    let streak = Math.max(0, o.streak ?? 0);
    const today = dateKey(new Date());
    if (lastDate !== today) {
      const yesterday = dateKey(new Date(Date.now() - 864e5));
      if (lastDate !== yesterday) streak = 0; // gap: streak broken
      else streak = 0; // didn't log in today, so current streak is 0
    }
    return { lastDate, streak };
  } catch {
    return { lastDate: "", streak: 0 };
  }
}

export function getLoginStreak(): number {
  return getLoginStreakData().streak;
}

// --- Solved problems (real-time, used by profile + problems list) ---

export function getSolvedProblemIds(): string[] {
  try {
    const raw = localStorage.getItem(SOLVED_PROBLEMS_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw) as unknown;
    return Array.isArray(arr) ? arr.filter((x): x is string => typeof x === "string") : [];
  } catch {
    return [];
  }
}

/** Add a problem id to solved list (no duplicate). Dispatches storage event so other tabs/listeners update. */
export function addSolvedProblem(problemId: string): void {
  if (!problemId?.trim()) return;
  const id = problemId.trim();
  const list = getSolvedProblemIds();
  if (list.includes(id)) return;
  const next = [...list, id];
  localStorage.setItem(SOLVED_PROBLEMS_KEY, JSON.stringify(next));
  window.dispatchEvent(new StorageEvent("storage", { key: SOLVED_PROBLEMS_KEY, newValue: JSON.stringify(next) }));
}

/** Call after addSolvedProblem when user is logged in — sync to backend so problems_solved and submissions are updated. */
export async function syncSolvedToBackend(problemId: string, opts?: { language?: string; runtime_ms?: number; memory_mb?: number }): Promise<void> {
  try {
    const { getApiUrl, getAuthHeaders } = await import("@/lib/api");
    const { auth } = await import("@/lib/firebase");
    if (!auth?.currentUser) return;
    const token = await auth.currentUser.getIdToken();
    if (!token) return;
    await fetch(getApiUrl("/api/dsa/submissions"), {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        problem_id: problemId,
        status: "Accepted",
        language: opts?.language ?? "javascript",
        runtime_ms: opts?.runtime_ms ?? null,
        memory_mb: opts?.memory_mb ?? null,
      }),
    });
  } catch {
    // offline or backend down — localStorage already updated
  }
}
