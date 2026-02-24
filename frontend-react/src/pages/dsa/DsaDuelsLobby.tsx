import { useState, useRef, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Swords, Loader2, Users, Timer, Calendar, Zap } from "lucide-react";
import { getDuelWsUrl } from "@/features/dsa/duels/duelWsUrl";
import { useDuelUser } from "@/features/dsa/duels/useDuelUser";
import { getDuelRating, getRankTier, getDuelStats } from "@/features/dsa/duels/duelRating";
import { toast } from "sonner";

const COUNTDOWN_SEC = 4;
const BOT_FALLBACK_MS = 4000; // Match backend: 4s then auto-match with bot

function getDuelApiBase(): string {
  const api = import.meta.env.VITE_API_URL;
  if (api) return api.replace(/\/$/, "");
  if (typeof window !== "undefined") return window.location.origin;
  return "http://localhost:3001";
}

export default function DsaDuelsLobby() {
  const navigate = useNavigate();
  const user = useDuelUser();
  const [finding, setFinding] = useState(false);
  const [matchedWith, setMatchedWith] = useState<{
    roomId: string;
    opponent: string;
    problemId: string;
    isBot: boolean;
  } | null>(null);
  const [countdown, setCountdown] = useState(COUNTDOWN_SEC);
  const [queued, setQueued] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const fallbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const matchedRef = useRef(false);

  useEffect(() => {
    return () => {
      if (fallbackTimerRef.current) clearTimeout(fallbackTimerRef.current);
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!matchedWith) return;
    if (countdown < 0) {
      const params = new URLSearchParams({
        opponent: matchedWith.opponent,
        problemId: matchedWith.problemId || "",
      });
      if (matchedWith.isBot) params.set("bot", "1");
      const path = `/dsa/duels/room/${matchedWith.roomId}?${params.toString()}`;
      // Preload duel room chunk so we don't get a black screen (Suspense fallback) after navigate
      import("./DsaDuelRoom").then(() => {
        navigate(path, { replace: true });
        setMatchedWith(null);
        setCountdown(COUNTDOWN_SEC);
      });
      return;
    }
    if (countdown === 0) {
      const t = setTimeout(() => setCountdown(-1), 400);
      return () => clearTimeout(t);
    }
    const t = setInterval(() => setCountdown((c) => c - 1), 1000);
    return () => clearInterval(t);
  }, [matchedWith, countdown, navigate]);

  const applyMatched = (roomId: string, opponent: string, problemId: string, isBot: boolean) => {
    if (matchedRef.current) return;
    matchedRef.current = true;
    if (fallbackTimerRef.current) {
      clearTimeout(fallbackTimerRef.current);
      fallbackTimerRef.current = null;
    }
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    setFinding(false);
    setQueued(false);
    setMatchedWith({ roomId, opponent, problemId, isBot });
    setCountdown(COUNTDOWN_SEC);
  };

  const handleFindMatch = () => {
    if (!user) {
      toast.error("Please log in to join duels.");
      navigate("/login");
      return;
    }
    setFinding(true);
    setQueued(false);
    matchedRef.current = false;
    toast.info("Finding opponent... (AI match in 4s if no one is online)");

    // Fallback: if no "matched" after 6s, get bot room via REST
    fallbackTimerRef.current = setTimeout(async () => {
      fallbackTimerRef.current = null;
      if (matchedRef.current) return;
      try {
        const base = getDuelApiBase();
        const res = await fetch(`${base}/api/duels/bot-match`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ gender: user?.gender ?? undefined }),
        });
        if (!res.ok) throw new Error("Match failed");
        const data = await res.json();
        applyMatched(
          data.roomId,
          data.opponent || "Opponent",
          data.problemId || "",
          data.isBot === true
        );
        toast.success(`Matched with ${data.opponent || "Opponent"}. Good luck!`);
      } catch (e) {
        setFinding(false);
        setQueued(false);
        if (wsRef.current) {
          wsRef.current.close();
          wsRef.current = null;
        }
        toast.error("Could not start duel", {
          description: "Start the backend (npm run server) so duels and bot matches work.",
          duration: 8000,
        });
      }
    }, BOT_FALLBACK_MS);

    const wsUrl = getDuelWsUrl();
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      ws.send(
        JSON.stringify({
          type: "find_match",
          userId: user.id ?? "",
          username: user.username ?? "Player",
          gender: user?.gender ?? undefined,
        })
      );
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "queued") {
          setQueued(true);
        } else if (data.type === "matched") {
          applyMatched(
            data.roomId,
            data.opponent || "Opponent",
            data.problemId || "",
            data.isBot === true
          );
        } else if (data.type === "error") {
          setFinding(false);
          setQueued(false);
          if (fallbackTimerRef.current) {
            clearTimeout(fallbackTimerRef.current);
            fallbackTimerRef.current = null;
          }
          toast.error(data.message || "Matchmaking failed.");
        }
      } catch {
        // ignore parse errors
      }
    };

    ws.onerror = () => {
      // Keep finding true so fallback can still run
    };

    ws.onclose = (ev) => {
      if (ev.wasClean) return;
      // Only show connection error if we never got a match (fallback will try REST)
      if (finding && !queued) {
        toast.info("Reconnecting via server...");
      }
    };
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 p-6 relative">
      {finding && !matchedWith && (
        <div className="fixed inset-0 z-40 flex flex-col items-center justify-center overflow-hidden bg-background/80 backdrop-blur-md">
          <div className="relative flex flex-col items-center text-center px-8 max-w-sm">
            <div className="relative mb-6">
              <div className="h-20 w-20 rounded-full border-2 border-primary/30 flex items-center justify-center">
                <Loader2 className="h-10 w-10 text-primary animate-spin" />
              </div>
              <div className="absolute -inset-2 rounded-full border border-primary/20 animate-ping opacity-30" />
            </div>
            <h3 className="text-lg font-semibold mb-1">
              {queued ? "Waiting for opponent" : "Finding opponent..."}
            </h3>
            <p className="text-sm text-muted-foreground">
              {queued
                ? "AI opponent in a few seconds if no one joins"
                : "Connecting to matchmaking"}
            </p>
            <div className="mt-4 flex gap-1">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="h-1.5 w-1.5 rounded-full bg-primary/60 animate-pulse"
                  style={{ animationDelay: `${i * 0.2}s` }}
                />
              ))}
            </div>
          </div>
        </div>
      )}
      {matchedWith && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-background via-background to-primary/5">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,hsl(var(--primary)/0.15),transparent)]" />
          <div className="absolute inset-0 backdrop-blur-[1px]" />

          <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-md w-full">
            <div className="flex items-center gap-2 text-primary mb-2">
              <Zap className="h-5 w-5 animate-pulse" />
              <span className="text-sm font-semibold uppercase tracking-wider">Match found</span>
              <Zap className="h-5 w-5 animate-pulse" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold mb-6 bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
              Prepare for duel
            </h2>

            <div className="flex items-center justify-center gap-3 sm:gap-6 w-full mb-8">
              <div className="flex flex-col items-center gap-1.5 px-4 py-3 rounded-xl bg-muted/60 border border-border/50 shadow-sm">
                <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden">
                  {user?.photo ? (
                    <img src={user.photo} alt={user.username} className="h-full w-full rounded-full object-cover" />
                  ) : (
                    <span className="text-lg font-bold text-primary">{user?.username?.slice(0, 1) ?? "Y"}</span>
                  )}
                </div>
                <span className="text-sm font-medium truncate max-w-[80px]">{user?.username ?? "You"}</span>
              </div>
              <div className="flex flex-col items-center gap-1 shrink-0">
                <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center border-2 border-primary/40">
                  <Swords className="h-6 w-6 text-primary" />
                </div>
                <span className="text-xs font-semibold text-muted-foreground mt-1 uppercase tracking-wider">vs</span>
              </div>
              <div className="flex flex-col items-center gap-1.5 px-4 py-3 rounded-xl bg-muted/60 border border-border/50 shadow-sm">
                <div className="h-10 w-10 rounded-full bg-amber-500/20 flex items-center justify-center">
                {matchedWith.isBot ? (
                  <span className="text-lg font-bold text-amber-600 dark:text-amber-400">
                    {matchedWith.opponent.slice(0, 1)}
                  </span>
                ) : (
                    <span className="text-lg font-bold text-amber-600 dark:text-amber-400">
                      {matchedWith.opponent.slice(0, 1)}
                    </span>
                  )}
                </div>
                <span className="text-sm font-medium truncate max-w-[100px] flex items-center gap-1 justify-center">
                  {matchedWith.opponent}
                  {matchedWith.isBot && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-600 dark:text-amber-400 font-medium">
                      AI
                    </span>
                  )}
                </span>
              </div>
            </div>

            <p className="text-muted-foreground text-sm mb-4">
              Entering arena in
            </p>
            <div
              className="relative flex items-center justify-center mb-6"
              key={countdown}
            >
              <div
                className="absolute inset-0 rounded-full border-[3px] border-primary/20"
                style={{ width: 100, height: 100 }}
              />
              <div
                className="absolute rounded-full border-[3px] border-t-primary border-r-primary/50 border-b-primary/30 border-l-primary transition-all duration-1000"
                style={{
                  width: 100,
                  height: 100,
                  transform: `rotate(${countdown > 0 ? (COUNTDOWN_SEC - countdown) * 90 : 360}deg)`,
                }}
              />
              <div className="relative flex items-center justify-center w-24 h-24">
                <span className="text-4xl sm:text-5xl font-black tabular-nums text-primary drop-shadow-sm">
                  {countdown > 0 ? countdown : "Go!"}
                </span>
              </div>
            </div>
            {countdown > 0 ? (
              <p className="text-sm text-muted-foreground animate-pulse">
                {countdown === 1 ? "Get set..." : "Get ready..."}
              </p>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <p className="text-lg font-semibold text-primary flex items-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Entering arena...
                </p>
                <div className="h-1.5 w-40 rounded-full bg-muted overflow-hidden">
                  <div className="h-full w-full bg-primary rounded-full animate-pulse" />
                </div>
              </div>
            )}

            <p className="text-xs text-muted-foreground mt-6 max-w-xs">
              Same problem, same timer. First correct solution wins.
            </p>
          </div>
        </div>
      )}

      <div className="container max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold flex items-center justify-center gap-2">
            <Swords className="h-8 w-8 text-primary" />
            1v1 Duels
          </h1>
          <p className="text-muted-foreground mt-1">
            Compete with a random opponent online. Solve the DSA problem first to win and climb the rank.
          </p>
          {user && (() => {
            const rating = getDuelRating();
            const rank = getRankTier(rating);
            const stats = getDuelStats();
            return (
              <div className="mt-3 space-y-1">
                <p className="text-sm font-medium text-primary">
                  Rating: <span className="tabular-nums">{rating}</span>
                  {" · "}
                  <span className={rank.color}>{rank.icon} {rank.name}</span>
                </p>
                <p className="text-xs text-muted-foreground">
                  {stats.wins}W / {stats.losses}L
                  {stats.streak > 0 && <span className="text-green-500 ml-2">🔥 {stats.streak} win streak</span>}
                </p>
              </div>
            );
          })()}
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Find opponent
            </CardTitle>
            <CardDescription>
              You’ll be matched with someone online. Same problem, same timer. First correct solution wins.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!user ? (
              <p className="text-sm text-muted-foreground">
                Log in to join duels and improve your global rank.
              </p>
            ) : null}
            <Button
              size="lg"
              className="w-full gap-2"
              onClick={handleFindMatch}
              disabled={finding}
            >
              {finding ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  {queued ? "Waiting for opponent… (AI soon)" : "Finding opponent…"}
                </>
              ) : (
                <>
                  <Swords className="h-5 w-5" />
                  Find 1v1 match
                </>
              )}
            </Button>
            <p className="text-xs text-muted-foreground text-center">
              If no one is online, you’ll be matched with an AI opponent in a few seconds. Room includes: live chat, voice, AI. Winner gets +rank.
            </p>
          </CardContent>
        </Card>

        <div className="mt-8">
          <h2 className="text-lg font-semibold mb-4 text-center">Other ways to practice</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Card className="hover:border-primary/50 transition-colors">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Timer className="h-4 w-4 text-primary" />
                  Solo Challenge
                </CardTitle>
                <CardDescription>
                  Timed run, no opponent. Solve a random problem and get a score. No login required.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full" asChild>
                  <Link to="/dsa/duels/solo">Start solo</Link>
                </Button>
              </CardContent>
            </Card>
            <Card className="hover:border-primary/50 transition-colors">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-primary" />
                  Daily Challenge
                </CardTitle>
                <CardDescription>
                  One problem per day for everyone. Same challenge, compare times when leaderboard is connected.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full" asChild>
                  <Link to="/dsa/duels/daily">Today&apos;s challenge</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
