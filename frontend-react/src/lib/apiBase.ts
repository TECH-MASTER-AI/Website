const rawApiBase = import.meta.env.VITE_API_URL as string | undefined;
const fallbackApiBase = import.meta.env.DEV ? "http://localhost:3001" : "";

export const API_BASE_URL = (rawApiBase || fallbackApiBase).replace(/\/$/, "");

export function withApiBase(path: string): string {
  if (!API_BASE_URL) {
    return path;
  }
  return path.startsWith("/") ? `${API_BASE_URL}${path}` : `${API_BASE_URL}/${path}`;
}
