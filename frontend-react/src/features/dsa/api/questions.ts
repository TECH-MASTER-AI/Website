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

import { withApiBase } from "@/lib/apiBase";

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `Request failed (${res.status})`);
  }
  return res.json() as Promise<T>;
}

// Uses /api/dsa - dev proxy or VITE_API_URL in production
const BASE = withApiBase("/api/dsa");

export function fetchDsaQuestions() {
  return fetchJson<{ items: DsaQuestionListItem[] }>(`${BASE}/questions`);
}

export function fetchDsaQuestionById(id: string) {
  return fetchJson<{ item: DsaQuestionDetail }>(`${BASE}/questions/${encodeURIComponent(id)}`);
}
