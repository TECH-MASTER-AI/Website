import { useMemo, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Flame, Trophy } from "lucide-react";
import { useDuelUser } from "@/features/dsa/duels/useDuelUser";
import {
  getActivityDates,
  getCurrentStreak,
  getLongestStreak,
} from "@/features/dsa/streak/dsaActivityStore";

const DAYS_IN_WEEK = 7;
const WEEKS = 12;

function dateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export default function DsaCalendar() {
  const user = useDuelUser();
  const [activityDates, setActivityDates] = useState(() => getActivityDates());

  useEffect(() => {
    setActivityDates(getActivityDates());
  }, []);

  const { gridDates, currentStreak, longestStreak } = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const totalDays = DAYS_IN_WEEK * WEEKS;
    const gridDates: { key: string; date: Date; isActive: boolean }[] = [];
    let start = new Date(today);
    start.setDate(start.getDate() - totalDays + 1);
    for (let i = 0; i < totalDays; i++) {
      const d = new Date(start);
      d.setDate(d.getDate() + i);
      const key = dateKey(d);
      gridDates.push({ key, date: d, isActive: activityDates.has(key) });
    }
    const currentStreak = getCurrentStreak();
    const longestStreak = getLongestStreak();
    return { gridDates, currentStreak, longestStreak };
  }, [activityDates]);

  if (!user) {
    return (
      <div className="flex-1 p-6 flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-muted-foreground">Log in to view your activity calendar and streak.</p>
          <Link to="/dsa/login" className="text-primary hover:underline font-medium">
            Log in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6">
      <div className="container max-w-3xl mx-auto space-y-6">
        <div className="flex items-center gap-2">
          <Calendar className="h-8 w-8 text-primary" />
          <h1 className="text-2xl font-bold">Activity & Streak</h1>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Flame className="h-5 w-5 text-orange-500" />
                Current streak
              </CardTitle>
              <CardDescription>Consecutive days with at least one activity</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-primary">{currentStreak} day{currentStreak !== 1 ? "s" : ""}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Trophy className="h-5 w-5 text-amber-500" />
                Longest streak
              </CardTitle>
              <CardDescription>Best consecutive days so far</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-primary">{longestStreak} day{longestStreak !== 1 ? "s" : ""}</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Last {WEEKS} weeks</CardTitle>
            <CardDescription>
              Each cell is a day. Filled = you had activity (solved a problem or submitted). Solve problems to build your streak.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div
              className="flex gap-0.5 flex-wrap"
              style={{ width: "min(100%, 420px)" }}
            >
              {gridDates.map(({ key, isActive }) => (
                <div
                  key={key}
                  className={`w-3 h-3 rounded-sm flex-shrink-0 ${
                    isActive ? "bg-primary" : "bg-muted"
                  }`}
                  title={key + (isActive ? " (activity)" : "")}
                />
              ))}
            </div>
            <div className="flex gap-4 mt-3 text-xs text-muted-foreground">
              <span>Less</span>
              <div className="flex gap-0.5">
                <div className="w-3 h-3 rounded-sm bg-muted" />
                <div className="w-3 h-3 rounded-sm bg-primary/50" />
                <div className="w-3 h-3 rounded-sm bg-primary" />
              </div>
              <span>More</span>
            </div>
          </CardContent>
        </Card>

        <p className="text-sm text-muted-foreground">
          Activity is recorded when you submit a solution on a problem page.{" "}
          <Link to="/dsa/problems" className="text-primary hover:underline">
            Go to Problems
          </Link>
        </p>
      </div>
    </div>
  );
}
