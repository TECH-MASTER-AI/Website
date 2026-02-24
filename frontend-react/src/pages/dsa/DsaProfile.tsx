import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User, Trophy, Activity, Flame, Swords, Camera, LogIn } from "lucide-react";
import { useDuelUser } from "@/features/dsa/duels/useDuelUser";
import { useDsaAuth } from "@/features/dsa/auth/DsaAuthContext";
import { getDuelRating } from "@/features/dsa/duels/duelRating";
import { getCurrentStreak, getLongestStreak } from "@/features/dsa/streak/dsaActivityStore";
import { getApiUrl } from "@/lib/api";
import {
  getProfilePhoto,
  setProfilePhoto,
  getProfileGender,
  setProfileGender,
  getLoginStreak,
  recordLoginDay,
  getSolvedProblemIds,
  type ProfileGender,
} from "@/features/dsa/profile/dsaProfileStore";
import { getDsaProblemById } from "@/data/dsaProblems";
import { getActivityDates } from "@/features/dsa/streak/dsaActivityStore";
import { StickyNotes } from "@/components/dsa/StickyNotes";

/** Activity heatmap from real data: last 12 weeks, filled = days with activity */
function ActivityHeatmap() {
  const dates = getActivityDates();
  const cells: { date: string; active: boolean }[] = [];
  const d = new Date();
  for (let i = 0; i < 12 * 7; i++) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    const key = `${y}-${m}-${day}`;
    cells.push({ date: key, active: dates.has(key) });
    d.setDate(d.getDate() - 1);
  }
  cells.reverse();
  return (
    <div className="space-y-2">
      <p className="text-sm font-medium">Submission activity (last 12 weeks)</p>
      <div className="flex gap-0.5 flex-wrap max-w-full" style={{ width: "min(100%, 400px)" }}>
        {cells.map((c, i) => (
          <div
            key={i}
            className={`w-2 h-2 rounded-sm ${c.active ? "bg-primary/70" : "bg-muted"}`}
            title={c.active ? `${c.date} — 1 submission` : `${c.date} — 0`}
          />
        ))}
      </div>
      <p className="text-xs text-muted-foreground">Older ← → Today</p>
    </div>
  );
}

export default function DsaProfile() {
  const user = useDuelUser();
  const { user: dsaUser, firebaseUser, token } = useDsaAuth();
  const [photo, setPhotoState] = useState<string | null>(() => getProfilePhoto());
  const displayPhoto =
    (dsaUser && "profile_photo_url" in dsaUser && dsaUser.profile_photo_url) ||
    photo ||
    firebaseUser?.photoURL ||
    null;
  const [gender, setGenderState] = useState<ProfileGender | null>(() => getProfileGender());
  const [solvedIds, setSolvedIds] = useState<string[]>(() => getSolvedProblemIds());
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentStreak = getCurrentStreak();
  const longestStreak = getLongestStreak();
  const loginStreak = getLoginStreak();
  const duelRating = getDuelRating();

  useEffect(() => {
    if (user) recordLoginDay();
  }, [user]);

  useEffect(() => {
    setPhotoState(getProfilePhoto());
    setGenderState(getProfileGender());
  }, [user?.id]);

  useEffect(() => {
    setSolvedIds(getSolvedProblemIds());
    const onUpdate = () => setSolvedIds(getSolvedProblemIds());
    window.addEventListener("storage", onUpdate);
    return () => window.removeEventListener("storage", onUpdate);
  }, []);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = reader.result as string;
      setProfilePhoto(dataUrl);
      setPhotoState(dataUrl);
      if (token) {
        try {
          const res = await fetch(getApiUrl("/api/auth/profile"), {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ profile_photo_url: dataUrl }),
          });
          if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            if (err?.error?.includes("Invalid")) {
              return;
            }
          }
        } catch {
          // Offline or backend down; local photo still saved
        }
      }
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleGenderSelect = (g: ProfileGender) => {
    setProfileGender(g);
    setGenderState(g);
  };

  if (!user) {
    return (
      <div className="flex-1 p-6 flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-muted-foreground">Log in to view your profile and stats.</p>
          <Button asChild>
            <Link to="/dsa/login">Log in</Link>
          </Button>
        </div>
      </div>
    );
  }

  const localSolved = solvedIds.length;
  const backendSolved = dsaUser?.problemsSolved;
  const totalSolved =
    typeof backendSolved === "number" && backendSolved >= 0 ? Math.max(backendSolved, localSolved) : localSolved;

  return (
    <div className="flex-1 p-6">
      <div className="container max-w-2xl mx-auto space-y-6">
        {/* Profile header with photo */}
        <div className="flex items-start gap-6 flex-wrap">
          <div className="relative group">
            <div className="h-24 w-24 rounded-full overflow-hidden border-2 border-border bg-muted flex items-center justify-center shrink-0">
              {displayPhoto ? (
                <img src={displayPhoto} alt="Profile" className="h-full w-full object-cover" />
              ) : (
                <User className="h-12 w-12 text-muted-foreground" />
              )}
            </div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
            >
              <Camera className="h-8 w-8 text-white" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handlePhotoChange}
            />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold">{user.username}</h1>
            <p className="text-muted-foreground text-sm">{user.email}</p>
            <div className="flex flex-wrap items-center gap-3 mt-2 text-sm">
              <span className="flex items-center gap-1 text-orange-600 dark:text-orange-400">
                <Flame className="h-4 w-4" />
                {currentStreak} day solve streak
              </span>
              <span className="flex items-center gap-1 text-primary">
                <LogIn className="h-4 w-4" />
                {loginStreak} day login streak
              </span>
              <Link to="/dsa/calendar" className="text-primary hover:underline">
                View calendar
              </Link>
            </div>
          </div>
        </div>

        {/* Profile settings: gender (for 1v1 bot) */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Profile settings</CardTitle>
            <CardDescription>
              Used for 1v1 duels: your opponent replies as the opposite gender (male → female name, female → male name). Set at login; change here if needed.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Button
                variant={gender === "male" ? "default" : "outline"}
                size="sm"
                onClick={() => handleGenderSelect("male")}
              >
                Male
              </Button>
              <Button
                variant={gender === "female" ? "default" : "outline"}
                size="sm"
                onClick={() => handleGenderSelect("female")}
              >
                Female
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Stats: 1v1 ranking, problems, streaks */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              Stats & ranking
            </CardTitle>
            <CardDescription>
              Your 1v1 duel rank, practice streaks, and problem stats.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="rounded-lg border bg-muted/30 p-3">
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Swords className="h-3.5 w-3.5" />
                  1v1 Duel ranking
                </p>
                <p className="text-xl font-bold tabular-nums mt-0.5">{duelRating}</p>
              </div>
              <div className="rounded-lg border bg-muted/30 p-3">
                <p className="text-xs text-muted-foreground">Problems solved</p>
                <p className="text-xl font-bold tabular-nums mt-0.5">{totalSolved}</p>
              </div>
              <div className="rounded-lg border bg-muted/30 p-3">
                <p className="text-xs text-muted-foreground">Solve streak</p>
                <p className="text-xl font-bold tabular-nums mt-0.5">{currentStreak} days</p>
              </div>
              <div className="rounded-lg border bg-muted/30 p-3">
                <p className="text-xs text-muted-foreground">Login streak</p>
                <p className="text-xl font-bold tabular-nums mt-0.5">{loginStreak} days</p>
              </div>
            </div>
            {totalSolved > 0 && (
              <p className="text-xs text-muted-foreground">
                {typeof backendSolved === "number" && backendSolved >= 0
                  ? "Synced with your account when logged in."
                  : "Stored on this device. Log in to sync with backend."}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Solved questions list — real data */}
        {solvedIds.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-primary" />
                Solved questions ({solvedIds.length})
              </CardTitle>
              <CardDescription>
                Problems you have solved. Click to open the problem again.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-1.5 max-h-60 overflow-y-auto">
                {[...solvedIds].reverse().map((problemId) => {
                  const p = getDsaProblemById(problemId);
                  const title = p?.title ?? problemId;
                  return (
                    <li key={problemId}>
                      <Link
                        to={`/dsa/problem/${problemId}`}
                        className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-muted transition-colors"
                      >
                        <span className="text-primary">✓</span>
                        <span className="font-medium truncate">{title}</span>
                        {p?.difficulty && (
                          <Badge variant="secondary" className="text-xs shrink-0">
                            {p.difficulty}
                          </Badge>
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
              <Button variant="outline" size="sm" className="mt-3" asChild>
                <Link to="/dsa/problems">View all problems</Link>
              </Button>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Activity
            </CardTitle>
            <CardDescription>
              Days you submitted or solved a problem. View full calendar for details.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ActivityHeatmap />
            <Button variant="outline" className="mt-4" asChild>
              <Link to="/dsa/calendar">Open Calendar & Streak</Link>
            </Button>
          </CardContent>
        </Card>

        {/* Sticky Notes */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">My Notes</CardTitle>
            <CardDescription>
              Quick sticky notes. Stored on this device.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <StickyNotes />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
