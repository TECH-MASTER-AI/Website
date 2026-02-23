/**
 * WebSocket URL for duels.
 * - If VITE_API_URL is set, use that host with ws/wss.
 * - In dev (localhost), connect directly to backend port 3001 so duels work when backend runs separately.
 * - Otherwise same origin (e.g. production).
 */
export function getDuelWsUrl(): string {
  const apiUrl = import.meta.env.VITE_API_URL;
  if (apiUrl) {
    const wsProtocol = apiUrl.startsWith("https") ? "wss" : "ws";
    const host = apiUrl.replace(/^https?:\/\//, "").replace(/\/$/, "");
    return `${wsProtocol}://${host}/ws/duels`;
  }
  if (typeof window !== "undefined") {
    const isLocalhost =
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1";
    if (isLocalhost) {
      return "ws://localhost:3001/ws/duels";
    }
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    return `${protocol}//${window.location.host}/ws/duels`;
  }
  return "ws://localhost:3001/ws/duels";
}
