/**
 * API client: base URL and auth headers (Firebase ID token).
 * Use for all backend API calls when user is logged in.
 */

function getApiBase(): string {
  if (import.meta.env.DEV) return ''; // Vite proxy to backend
  return import.meta.env.VITE_API_URL || '';
}

export function getApiUrl(path: string): string {
  const base = getApiBase();
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${base}${p}`;
}

export async function getAuthHeaders(): Promise<HeadersInit> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  const { auth } = await import('@/lib/firebase');
  if (!auth?.currentUser) return headers;
  try {
    const token = await auth.currentUser.getIdToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
  } catch {
    // ignore
  }
  return headers;
}

export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const url = getApiUrl(path);
  const headers = { ...(await getAuthHeaders()), ...options.headers } as HeadersInit;
  const res = await fetch(url, { ...options, headers });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Request failed ${res.status}`);
  }
  return res.json() as Promise<T>;
}
