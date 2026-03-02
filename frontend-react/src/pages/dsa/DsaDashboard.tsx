import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { List, Trophy, User } from "lucide-react";
import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext";
import { getProfilePhoto } from "@/features/dsa/profile/dsaProfileStore";

export default function DsaDashboard() {
  const { user } = useSupabaseAuth();
  const profilePhoto = getProfilePhoto();
  
  // Get username from user metadata or email
  const username = user?.user_metadata?.username || user?.email?.split('@')[0] || 'Player';

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
                  {username.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>
          <div>
            <h1 className="text-2xl font-bold">
              {user ? `Welcome, ${username}` : "DSA Dashboard"}
            </h1>
            <p className="text-muted-foreground mt-1">
              Track progress, solve problems, and climb the leaderboard.
            </p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Button variant="outline" className="h-auto flex flex-col items-start gap-2 p-4" asChild>
            <Link to="/dsa/problems">
              <List className="h-5 w-5" />
              <span className="font-medium">Problems</span>
              <span className="text-xs text-muted-foreground">Browse & solve</span>
            </Link>
          </Button>
          <Button variant="outline" className="h-auto flex flex-col items-start gap-2 p-4" asChild>
            <Link to="/dsa/leaderboard">
              <Trophy className="h-5 w-5" />
              <span className="font-medium">Leaderboard</span>
              <span className="text-xs text-muted-foreground">Rankings</span>
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
      </div>
    </div>
  );
}
