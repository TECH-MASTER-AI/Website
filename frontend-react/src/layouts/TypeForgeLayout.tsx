import { useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Clock,
  ChevronRight,
  ChevronDown,
  Users,
  Keyboard,
  Code2,
  Sparkles,
  Gamepad2,
  Play,
  ArrowLeft,
  Sun,
  Bell,
  User,
  StickyNote,
  Calendar,
  Menu,
} from "lucide-react";

const SIDEBAR_WIDTH = 240;
const TOP_BAR_HEIGHT = 56;

export function TypeForgeLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const isTypeForge = location.pathname.startsWith("/typeforge");
  const [typeForgeOpen, setTypeForgeOpen] = useState(true);

  const isCode = location.pathname === "/typeforge" || location.pathname === "/typeforge/code";
  const isSpells = location.pathname === "/typeforge/spells";
  const isFun = location.pathname === "/typeforge/fun";
  const isLiveCoding = location.pathname === "/typeforge/live-coding";

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground transition-[width] duration-150 font-sans">
      {/* Fixed top bar */}
      <header
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between border-b border-border bg-background"
        style={{ height: TOP_BAR_HEIGHT, padding: "0 24px" }}
      >
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="p-1.5 rounded-lg transition-colors hover:opacity-80 text-foreground"
            aria-label="Back"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <span className="text-base font-semibold text-foreground">
            Type Forge
          </span>
        </div>
        <div className="flex items-center gap-4">
          <button type="button" className="p-2 rounded-lg transition-colors hover:opacity-80 text-muted-foreground" aria-label="Theme">
            <Sun className="h-5 w-5" />
          </button>
          <button type="button" className="p-2 rounded-lg transition-colors hover:opacity-80 text-muted-foreground" aria-label="Notifications">
            <Bell className="h-5 w-5" />
          </button>
          <button type="button" className="p-2 rounded-lg transition-colors hover:opacity-80 text-muted-foreground" aria-label="Profile">
            <User className="h-5 w-5" />
          </button>
        </div>
      </header>

      <div className="flex flex-1" style={{ paddingTop: TOP_BAR_HEIGHT }}>
        {/* Fixed left sidebar */}
        <aside
          className="fixed left-0 bottom-0 z-40 flex flex-col border-r border-border bg-card text-card-foreground transition-[width] duration-150"
          style={{
            top: TOP_BAR_HEIGHT,
            width: SIDEBAR_WIDTH,
            padding: "16px 12px",
          }}
        >
          <div className="flex-1 overflow-y-auto">
            <div className="font-semibold mb-6 text-foreground">
              TMAI
            </div>

            <nav>
              <Link
                to="/"
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 mb-1.5",
                  !isTypeForge ? "bg-muted text-primary" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <LayoutDashboard className="h-4 w-4 shrink-0" />
                <span>Dashboard</span>
              </Link>

              <Link
                to="/dsa/problems"
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 mb-1.5",
                  location.pathname.startsWith("/dsa") && !isTypeForge ? "bg-muted text-primary" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Clock className="h-4 w-4 shrink-0" />
                <span>DSA Practice</span>
                <ChevronRight className="h-3.5 w-3.5 ml-auto text-muted-foreground" />
              </Link>

              <Link
                to="/dsa/duels"
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 mb-1.5",
                  location.pathname.startsWith("/dsa/duels") ? "bg-muted text-primary" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Users className="h-4 w-4 shrink-0" />
                <span>1v1 Code Arena</span>
              </Link>

              <div className="mb-1.5">
                <button
                  type="button"
                  onClick={() => setTypeForgeOpen(!typeForgeOpen)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium w-full transition-all duration-150",
                    isTypeForge ? "bg-muted text-primary" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Keyboard className={cn("h-4 w-4 shrink-0", isTypeForge && "text-primary")} />
                  <span>Type Forge</span>
                  {typeForgeOpen ? (
                    <ChevronDown className="h-3.5 w-3.5 ml-auto text-muted-foreground" />
                  ) : (
                    <ChevronRight className="h-3.5 w-3.5 ml-auto text-muted-foreground" />
                  )}
                </button>
                {typeForgeOpen && (
                  <div className="mt-2 space-y-0">
                    <Link
                      to="/typeforge/code"
                      className={cn(
                        "flex items-center gap-2 text-sm font-medium transition-all duration-150 rounded-lg py-2 pl-5",
                        isCode ? "text-primary border border-primary rounded-lg my-2" : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <Code2 className="h-3.5 w-3.5" />
                      Code
                    </Link>
                    <Link
                      to="/typeforge/spells"
                      className={cn(
                        "flex items-center gap-2 text-sm font-medium transition-all duration-150 rounded-lg py-2 pl-5",
                        isSpells ? "text-primary border border-primary rounded-lg my-2" : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <Sparkles className="h-3.5 w-3.5" />
                      Spells
                    </Link>
                    <Link
                      to="/typeforge/fun"
                      className={cn(
                        "flex items-center gap-2 text-sm font-medium transition-all duration-150 rounded-lg py-2 pl-5",
                        isFun ? "text-primary border border-primary rounded-lg my-2" : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <Gamepad2 className="h-3.5 w-3.5" />
                      Fun
                    </Link>
                  </div>
                )}
              </div>

              <Link
                to="/typeforge/live-coding"
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150",
                  isLiveCoding ? "bg-muted text-primary" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Play className="h-4 w-4 shrink-0" />
                <span>Live Coding</span>
              </Link>
            </nav>
          </div>

          <div className="h-12 grid grid-cols-3 shrink-0 border-t border-border">
            <Link
              to="/dsa/profile"
              className="flex items-center justify-center transition-colors hover:opacity-80 text-muted-foreground border-r border-border"
              title="Profile & Notes"
            >
              <StickyNote className="h-4 w-4" />
            </Link>
            <Link
              to="/dsa/calendar"
              className="flex items-center justify-center transition-colors hover:opacity-80 text-muted-foreground border-r border-border"
              title="Calendar"
            >
              <Calendar className="h-4 w-4" />
            </Link>
            <button
              type="button"
              className="flex items-center justify-center transition-colors hover:opacity-80 text-muted-foreground"
              title="Menu"
            >
              <Menu className="h-4 w-4" />
            </button>
          </div>
        </aside>

        {/* Main content — padding 32px 64px, maxWidth 1200 */}
        <main
          className="flex-1 flex flex-col min-h-0 bg-background"
          style={{ marginLeft: SIDEBAR_WIDTH }}
        >
          <div className="flex-1 w-full mx-auto min-h-0" style={{ maxWidth: 1200, padding: "32px 64px" }}>
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

export default TypeForgeLayout;
