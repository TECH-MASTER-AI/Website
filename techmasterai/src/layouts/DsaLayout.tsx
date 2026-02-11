import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { DsaSidebar } from "@/components/dsa/DsaSidebar";
import { DsaFilterProvider } from "@/contexts/DsaFilterContext";
import { ChevronLeft, Bell, User, LogOut, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/contexts/ThemeContext";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useState, useEffect } from "react";
import { getProfilePhoto } from "@/features/dsa/profile/dsaProfileStore";
import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext";
import { addDuelLoss } from "@/features/dsa/duels/duelRating";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

/**
 * Global layout for DSA Practice section: Custom Header, Sidebar, Main Content.
 */
export function DsaLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { user, signOut } = useSupabaseAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [showLeaveDialog, setShowLeaveDialog] = useState(false);

  // Comprehensive protection against copy/paste/screenshot
  useEffect(() => {
    // Prevent copy, cut, paste
    const preventCopyPaste = (e: ClipboardEvent) => {
      e.preventDefault();
      toast.error('Copy/Paste is disabled in this section');
      return false;
    };

    // Prevent keyboard shortcuts
    const preventKeyboardShortcuts = (e: KeyboardEvent) => {
      // Prevent Ctrl+C, Ctrl+V, Ctrl+A, Ctrl+X, Ctrl+S, Ctrl+P
      if (e.ctrlKey || e.metaKey) {
        if (['c', 'v', 'a', 'x', 's', 'p'].includes(e.key.toLowerCase())) {
          e.preventDefault();
          toast.error('This action is disabled');
          return false;
        }
      }
      
      // Prevent PrintScreen, F12 (DevTools)
      if (e.key === 'PrintScreen' || e.keyCode === 44 || e.key === 'F12') {
        e.preventDefault();
        toast.error('Screenshots are disabled');
        return false;
      }
    };

    // Prevent right-click context menu
    const preventContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      toast.error('Right-click is disabled');
      return false;
    };

    // Prevent drag and drop
    const preventDragDrop = (e: DragEvent) => {
      e.preventDefault();
      return false;
    };

    // Add event listeners
    document.addEventListener('copy', preventCopyPaste);
    document.addEventListener('cut', preventCopyPaste);
    document.addEventListener('paste', preventCopyPaste);
    document.addEventListener('keydown', preventKeyboardShortcuts);
    document.addEventListener('contextmenu', preventContextMenu);
    document.addEventListener('dragstart', preventDragDrop);

    // Cleanup
    return () => {
      document.removeEventListener('copy', preventCopyPaste);
      document.removeEventListener('cut', preventCopyPaste);
      document.removeEventListener('paste', preventCopyPaste);
      document.removeEventListener('keydown', preventKeyboardShortcuts);
      document.removeEventListener('contextmenu', preventContextMenu);
      document.removeEventListener('dragstart', preventDragDrop);
    };
  }, []);
  
  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  const handleBackClick = () => {
    setShowLeaveDialog(true);
  };

  const handleLeaveConfirm = async () => {
    setShowLeaveDialog(false);
    
    // If leaving from Code Royale duel room, apply -5 points penalty
    if (location.pathname.startsWith('/dsa/duels/room/')) {
      await addDuelLoss('Left duel');
      toast.error('💔 You left the duel! -5 points penalty applied.');
    }
    
    navigate(-1);
  };
  
  // Sample notifications - replace with real data
  // Set to empty array to show "no notifications" state
  const [notifications, setNotifications] = useState<Array<{
    id: number;
    title: string;
    message: string;
    time: string;
    read: boolean;
  }>>([
    // Uncomment below to see notifications
    // { id: 1, title: "New Contest Available", message: "Weekly coding contest starts in 2 hours", time: "2h ago", read: false },
    // { id: 2, title: "Achievement Unlocked", message: "You've solved 50 problems!", time: "1d ago", read: false },
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;
  const profilePhoto = user ? getProfilePhoto() : null;
  const userName = user?.user_metadata?.username || user?.email?.split('@')[0] || 'User';
  const userEmail = user?.email || '';

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  // Dynamic page title based on current route
  const getPageTitle = () => {
    const path = location.pathname;
    
    if (path === '/dsa/dashboard') return 'Dashboard';
    if (path === '/dsa/problems' || path.startsWith('/dsa/problem/')) return 'Flow State';
    if (path === '/dsa/leaderboard') return 'Leaderboard';
    // Check for duel room first (more specific), then duels lobby
    if (path.startsWith('/dsa/duels/room/')) return 'Code Royale';
    if (path === '/dsa/duels' || path.startsWith('/dsa/duels')) return 'Code Royale';
    if (path === '/dsa/profile') return 'Profile';
    if (path === '/dsa/calendar') return 'Calendar';
    if (path === '/dsa/notes') return 'Notes';
    if (path === '/dsa/submissions') return 'Submissions';
    if (path === '/dsa/daily-challenge') return 'Daily Challenge';
    if (path === '/dsa/solo-challenge') return 'Solo Challenge';
    if (path.startsWith('/typeforge')) {
      if (path.includes('/code')) return 'Type Forge - Code';
      if (path.includes('/spells')) return 'Type Forge - Spells';
      if (path.includes('/fun')) return 'Type Forge - Fun';
      if (path.includes('/live-coding')) return 'Live Coding';
      return 'Type Forge';
    }
    
    return 'Flow State'; // Default fallback
  };


  return (
    <DsaFilterProvider>
      <div className={cn(
        "min-h-screen max-h-screen flex flex-col overflow-hidden relative selection:bg-cyan-500/30 selection:text-cyan-200 transition-colors duration-300",
        "bg-slate-50 dark:bg-[#0B0F19]"
      )}>
        {/* Galaxy/Cyber Background - visible only in dark mode */}
        <div className="fixed inset-0 z-0 pointer-events-none opacity-0 dark:opacity-100 transition-opacity duration-300">
          <div className="absolute inset-0 bg-[#0B0F19] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-[#0B0F19] to-black" />
          <div className="absolute top-0 left-0 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay"></div>
          <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-purple-500/10 blur-[120px]" />
          <div className="absolute -bottom-[20%] -right-[10%] w-[50%] h-[50%] rounded-full bg-cyan-500/10 blur-[120px]" />
        </div>

        <div className="relative z-10 flex flex-col h-screen overflow-hidden">
          {/* New Top Header Matching Design */}
          <header className={cn(
            "h-16 flex items-center justify-between px-6 border-b shrink-0 transition-colors duration-300 backdrop-blur-sm",
            "border-slate-200 dark:border-white/10 bg-white/80 dark:bg-[#0B0F19]"
          )}>
             <div className="flex items-center gap-4">
                {/* Sidebar Toggle Button - Hide on duel room */}
                {!location.pathname.startsWith("/dsa/duels/room/") && (
                  <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                      className={cn(
                          "text-muted-foreground transition-colors",
                          "hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10"
                      )}
                      title={isSidebarOpen ? "Hide sidebar" : "Show sidebar"}
                  >
                      {isSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                  </Button>
                )}
                
                <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={handleBackClick}
                    className={cn(
                        "text-muted-foreground transition-colors",
                        "hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10"
                    )}
                >
                    <ChevronLeft className="h-6 w-6" />
                </Button>
                <h2 className={cn(
                    "text-xl font-semibold tracking-tight transition-colors",
                    "text-slate-900 dark:text-white"
                )}>{getPageTitle()}</h2>
             </div>
             
             <div className="flex items-center gap-4">
                {/* Notification Bell with Popover */}
                <Popover>
                    <PopoverTrigger asChild>
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            className={cn(
                                "text-muted-foreground relative transition-colors",
                                "hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10"
                            )}
                        >
                            <Bell className="h-5 w-5" />
                            {unreadCount > 0 && (
                                <span className={cn(
                                    "absolute top-2 right-2 h-2 w-2 rounded-full border animate-pulse",
                                    "bg-red-500 border-white dark:border-[#0B0F19]"
                                )} />
                            )}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent 
                        className={cn(
                            "w-80 p-0 mr-4",
                            "bg-white dark:bg-[#111625] border-slate-200 dark:border-white/10"
                        )}
                        align="end"
                    >
                        <div className={cn(
                            "flex items-center justify-between p-4 border-b",
                            "border-slate-200 dark:border-white/10"
                        )}>
                            <h3 className={cn(
                                "font-semibold text-sm",
                                "text-slate-900 dark:text-white"
                            )}>
                                Notifications {unreadCount > 0 && `(${unreadCount})`}
                            </h3>
                            {unreadCount > 0 && (
                                <button 
                                    onClick={markAllAsRead}
                                    className={cn(
                                        "text-xs font-medium transition-colors",
                                        "text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300"
                                    )}
                                >
                                    Mark all read
                                </button>
                            )}
                        </div>
                        
                        <div className="max-h-[400px] overflow-y-auto">
                            {notifications.length === 0 ? (
                                <div className="p-8 text-center">
                                    <Bell className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-30" />
                                    <p className="text-sm text-muted-foreground">No notifications yet</p>
                                </div>
                            ) : (
                                notifications.map((notification) => (
                                    <div 
                                        key={notification.id}
                                        className={cn(
                                            "p-4 border-b transition-colors cursor-pointer",
                                            "border-slate-100 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/5",
                                            !notification.read && "bg-cyan-50/50 dark:bg-cyan-500/5"
                                        )}
                                    >
                                        <div className="flex items-start gap-3">
                                            {!notification.read && (
                                                <div className={cn(
                                                    "h-2 w-2 rounded-full mt-1.5 shrink-0",
                                                    "bg-cyan-500"
                                                )} />
                                            )}
                                            <div className="flex-1 min-w-0">
                                                <p className={cn(
                                                    "text-sm font-medium mb-1",
                                                    "text-slate-900 dark:text-white"
                                                )}>
                                                    {notification.title}
                                                </p>
                                                <p className="text-xs text-muted-foreground mb-1">
                                                    {notification.message}
                                                </p>
                                                <p className="text-xs text-muted-foreground opacity-60">
                                                    {notification.time}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </PopoverContent>
                </Popover>
                
                {/* User Profile Dropdown */}
                <Popover>
                    <PopoverTrigger asChild>
                        {user ? (
                            <button className="h-9 w-9 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 p-[2px] cursor-pointer hover:shadow-[0_0_15px_rgba(6,182,212,0.4)] transition-all">
                                {profilePhoto ? (
                                    <img 
                                        src={profilePhoto} 
                                        alt={userName}
                                        className="h-full w-full rounded-full object-cover"
                                    />
                                ) : (
                                    <div className={cn(
                                        "h-full w-full rounded-full flex items-center justify-center",
                                        "bg-[#0B0F19]"
                                    )}>
                                        <span className={cn(
                                            "text-xs font-bold",
                                            "text-white"
                                        )}>
                                            {userName.charAt(0).toUpperCase()}
                                        </span>
                                    </div>
                                )}
                            </button>
                        ) : (
                            <button className="h-9 w-9 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 p-[1px] cursor-pointer hover:shadow-[0_0_15px_rgba(6,182,212,0.4)] transition-shadow">
                                <div className="h-full w-full rounded-full bg-[#0B0F19] flex items-center justify-center">
                                    <User className="h-4 w-4 text-white" />
                                </div>
                            </button>
                        )}
                    </PopoverTrigger>
                    <PopoverContent 
                        className={cn(
                            "w-64 p-0 mr-4",
                            "bg-white dark:bg-[#111625] border-slate-200 dark:border-white/10"
                        )}
                        align="end"
                    >
                        {user ? (
                            <>
                                {/* User Info */}
                                <div className={cn(
                                    "p-4 border-b",
                                    "border-slate-200 dark:border-white/10"
                                )}>
                                    <div className="flex items-center gap-3">
                                        <div className="h-12 w-12 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 p-[2px]">
                                            {profilePhoto ? (
                                                <img 
                                                    src={profilePhoto} 
                                                    alt={userName}
                                                    className="h-full w-full rounded-full object-cover"
                                                />
                                            ) : (
                                                <div className={cn(
                                                    "h-full w-full rounded-full flex items-center justify-center",
                                                    "bg-[#0B0F19]"
                                                )}>
                                                    <span className={cn(
                                                        "text-lg font-bold",
                                                        "text-white"
                                                    )}>
                                                        {userName.charAt(0).toUpperCase()}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className={cn(
                                                "font-semibold text-sm truncate",
                                                "text-slate-900 dark:text-white"
                                            )}>
                                                {userName}
                                            </p>
                                            <p className="text-xs text-muted-foreground truncate">
                                                {userEmail}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Menu Items */}
                                <div className="py-2">
                                    <button
                                        onClick={() => navigate('/dsa/profile')}
                                        className={cn(
                                            "w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors",
                                            "hover:bg-slate-100 dark:hover:bg-white/5 text-slate-700 dark:text-slate-300"
                                        )}
                                    >
                                        <User className="h-4 w-4" />
                                        <span>View Profile</span>
                                    </button>
                                </div>

                                {/* Logout */}
                                <div className={cn(
                                    "border-t py-2",
                                    "border-slate-200 dark:border-white/10"
                                )}>
                                    <button
                                        onClick={handleLogout}
                                        className={cn(
                                            "w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors text-red-600 dark:text-red-400",
                                            "hover:bg-red-50 dark:hover:bg-red-500/10"
                                        )}
                                    >
                                        <LogOut className="h-4 w-4" />
                                        <span>Logout</span>
                                    </button>
                                </div>
                            </>
                        ) : (
                            <div className="p-4">
                                <p className="text-sm text-muted-foreground mb-4">Sign in to access your profile</p>
                                <div className="space-y-2">
                                    <Button 
                                        onClick={() => navigate('/login')}
                                        className="w-full"
                                        size="sm"
                                    >
                                        Login
                                    </Button>
                                    <Button 
                                        onClick={() => navigate('/signup')}
                                        variant="outline"
                                        className="w-full"
                                        size="sm"
                                    >
                                        Sign Up
                                    </Button>
                                </div>
                            </div>
                        )}
                    </PopoverContent>
                </Popover>
             </div>
          </header>

          <div className="flex flex-1 overflow-hidden">
            {!location.pathname.startsWith("/dsa/problem/") && !location.pathname.startsWith("/dsa/duels/room/") && isSidebarOpen && <DsaSidebar />}
            <main className={cn(
              "flex-1 flex flex-col min-w-0 overflow-y-auto transition-all duration-300",
              !location.pathname.startsWith("/dsa/problem/") && !location.pathname.startsWith("/dsa/duels/room/") && isSidebarOpen ? "ml-72" : "ml-0"
            )}>
              <Outlet />
            </main>
          </div>
          
        </div>

        {/* Leave Confirmation Dialog */}
        <AlertDialog open={showLeaveDialog} onOpenChange={setShowLeaveDialog}>
          <AlertDialogContent className={cn(
            "bg-white dark:bg-[#111625] border-slate-200 dark:border-white/10"
          )}>
            <AlertDialogHeader>
              <AlertDialogTitle className={cn(
                "text-slate-900 dark:text-white"
              )}>
                Leave this page?
              </AlertDialogTitle>
              <AlertDialogDescription>
                {location.pathname.startsWith('/dsa/duels/room/') 
                  ? "Are you sure you want to leave? You'll lose this duel and -5 points will be deducted."
                  : "Are you sure you want to leave?"}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Stay</AlertDialogCancel>
              <AlertDialogAction onClick={handleLeaveConfirm}>Leave</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* CSS Protection - Prevent text selection and screenshots */}
        <style>{`
          body {
            user-select: none !important;
            -webkit-user-select: none !important;
            -moz-user-select: none !important;
            -ms-user-select: none !important;
          }
          
          * {
            user-select: none !important;
            -webkit-user-select: none !important;
            -moz-user-select: none !important;
            -ms-user-select: none !important;
          }
          
          /* Allow selection only in input fields and Monaco editor */
          input, textarea, [contenteditable="true"], .monaco-editor, .monaco-editor * {
            user-select: text !important;
            -webkit-user-select: text !important;
            -moz-user-select: text !important;
            -ms-user-select: text !important;
          }
        `}</style>
      </div>
    </DsaFilterProvider>
  );
}
