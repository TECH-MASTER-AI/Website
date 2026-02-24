import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { List, FileCode, User } from "lucide-react";
import { useDsaAuth } from "@/features/dsa/auth/DsaAuthContext";
import { getProfilePhoto } from "@/features/dsa/profile/dsaProfileStore";

export default function DsaDashboard() {
  const { user } = useDsaAuth();
  const profilePhoto = getProfilePhoto();

  return (
    <div className="flex-1 p-6">
      <div className="container max-w-4xl mx-auto space-y-8">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="h-14 w-14 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 p-[2px] shrink-0">
            {profilePhoto ? (
              <img src={profilePhoto} alt="" className="h-full w-full rounded-full object-cover" />
            ) : (
              <div className="h-full w-full rounded-full bg-muted flex items-center justify-center">
                <span className="text-xl font-bold text-primary">
                  {user?.username?.charAt(0).toUpperCase() ?? "D"}
                </span>
              </div>
            )}
          </div>
          <div>
            <h1 className="text-2xl font-bold">
              {user ? `Welcome, ${user.username}` : "DSA Practice Dashboard"}
            </h1>
            <p className="text-muted-foreground mt-1">
              Track progress and solve problems.
            </p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Button variant="outline" className="h-auto flex flex-col items-start gap-2 p-4" asChild>
            <Link to="/dsa/problems">
              <List className="h-5 w-5" />
              <span className="font-medium">Problems</span>
              <span className="text-xs text-muted-foreground">Browse & solve</span>
            </Link>
          </Button>
          <Button variant="outline" className="h-auto flex flex-col items-start gap-2 p-4" asChild>
            <Link to="/dsa/submissions">
              <FileCode className="h-5 w-5" />
              <span className="font-medium">Submissions</span>
              <span className="text-xs text-muted-foreground">Your attempts</span>
            </Link>
          </Button>
          <Button variant="outline" className="h-auto flex flex-col items-start gap-2 p-4" asChild>
            <Link to="/dsa/profile">
              <User className="h-5 w-5" />
              <span className="font-medium">Profile</span>
              <span className="text-xs text-muted-foreground">Stats & heatmap</span>
            </Link>
          </Button>
        </div>

        {user && (
          <div className="rounded-lg border bg-card p-4">
            <h2 className="font-semibold mb-2">Quick stats</h2>
            <p className="text-sm text-muted-foreground">
              Rating: {user.rating ?? 0} · Problems solved: {user.problemsSolved ?? 0}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
