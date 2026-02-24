export type Difficulty = "Easy" | "Medium" | "Hard";

export interface DsaQuestionListItem {
  id: string; // slug
  title: string;
  difficulty: Difficulty;
  acceptance: number; // percent integer
  tags: string[];
}

export interface DsaQuestionDetail extends DsaQuestionListItem {
  description: string;
  examples: Array<{ input: string; output: string; explanation?: string }>;
  constraints: string[];
  testCases: unknown[]; // used later by judge; keep flexible for now
  isPremium: boolean;
  likes: number;
  dislikes: number;
}

export class DsaApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public body?: { error?: string }
  ) {
    super(message);
    this.name = "DsaApiError";
  }
}

async function fetchJson<T>(url: string): Promise<T> {
  let res: Response;
  try {
    res = await fetch(url);
  } catch (networkErr) {
    throw new DsaApiError(
      "Could not reach the server. Make sure the backend is running (e.g. npm run server)."
    );
  }
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    let message = `Request failed (${res.status})`;
    try {
      const json = JSON.parse(text) as { error?: string };
      if (json?.error) message = json.error;
    } catch {
      if (text) message = text;
    }
    throw new DsaApiError(message, res.status, { error: message });
  }
  return res.json() as Promise<T>;
}

// Uses /api/dsa - proxied to backend in dev (vite), rewritten to Netlify function in prod (netlify.toml)
const BASE = "/api/dsa";

export function fetchDsaQuestions() {
  return fetchJson<{ items: DsaQuestionListItem[] }>(`${BASE}/questions`);
}

export function fetchDsaQuestionById(id: string) {
  return fetchJson<{ item: DsaQuestionDetail }>(`${BASE}/questions/${encodeURIComponent(id)}`);
}

/** One problem slug per day (same for everyone). */
export function fetchDailySlug() {
  return fetchJson<{ slug: string }>(`${BASE}/daily-slug`);
}

/** One random problem slug. */
export function fetchRandomSlug() {
  return fetchJson<{ slug: string }>(`${BASE}/random-slug`);
}

