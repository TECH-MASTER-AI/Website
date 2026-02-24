import { useLocation, useNavigate } from "react-router-dom";
import { Outlet } from "react-router-dom";
import { DsaSidebar } from "@/components/dsa/DsaSidebar";
import { DsaFilterProvider } from "@/contexts/DsaFilterContext";
import { ChevronLeft, Bell, User, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/contexts/ThemeContext";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { ThemeSelector } from "@/components/ThemeSelector";
import { getProfilePhoto } from "@/features/dsa/profile/dsaProfileStore";
import { useDsaAuth } from "@/features/dsa/auth/DsaAuthContext";

/**
 * Global layout for DSA Practice section: Custom Header, Sidebar, Main Content.
 */
export function DsaLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { theme } = useTheme();
  
  const { user: dsaUser, firebaseUser, logout: dsaLogout } = useDsaAuth();
  const [legacyUser, setLegacyUser] = useState<{ name: string; email: string; photo?: string } | null>(null);

  useEffect(() => {
    const userStr = localStorage.getItem('techmasterai_user');
    if (userStr) {
      try {
        setLegacyUser(JSON.parse(userStr));
      } catch {
        setLegacyUser(null);
      }
    } else {
      setLegacyUser(null);
    }
    const onStorage = () => {
      const s = localStorage.getItem('techmasterai_user');
      setLegacyUser(s ? JSON.parse(s) : null);
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const currentUser = dsaUser
    ? { name: dsaUser.username, email: dsaUser.email, photo: undefined }
    : legacyUser;

  const handleLogout = async () => {
    localStorage.removeItem('techmasterai_admin');
    localStorage.removeItem('techmasterai_user');
    if (dsaUser) await dsaLogout();
    toast.success('Logged out successfully');
    navigate('/');
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
  const profilePhoto = currentUser
    ? (getProfilePhoto() || firebaseUser?.photoURL || currentUser.photo)
    : null;

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };


  return (
    <DsaFilterProvider>
      <div className={cn(
        "min-h-screen max-h-screen flex flex-col overflow-hidden relative selection:bg-cyan-500/30 selection:text-cyan-200 transition-colors duration-300",
        theme === 'pastel' ? "bg-[#FFF0F5]" : "bg-slate-50 dark:bg-[#0B0F19]"
      )}>
        {/* Galaxy/Cyber Background - visible only in dark mode */}
        <div className="fixed inset-0 z-0 pointer-events-none opacity-0 dark:opacity-100 transition-opacity duration-300">
          <div className="absolute inset-0 bg-[#0B0F19] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-[#0B0F19] to-black" />
          <div className="absolute top-0 left-0 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay"></div>
          <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-purple-500/10 blur-[120px]" />
          <div className="absolute -bottom-[20%] -right-[10%] w-[50%] h-[50%] rounded-full bg-cyan-500/10 blur-[120px]" />
        </div>

        {/* Pastel Background Gradients using CSS for smoothness */}
        {theme === 'pastel' && (
           <div className="fixed inset-0 z-0 pointer-events-none">
              <div className="absolute inset-0 bg-gradient-to-br from-rose-50 via-purple-50 to-blue-50 opacity-80" />
              <div className="absolute -top-[10%] -left-[10%] w-[60%] h-[60%] rounded-full bg-pink-200/20 blur-[100px]" />
              <div className="absolute top-[20%] right-[10%] w-[40%] h-[40%] rounded-full bg-purple-200/20 blur-[100px]" />
           </div>
        )}

        <div className="relative z-10 flex flex-col h-screen overflow-hidden">
          {/* New Top Header Matching Design */}
          <header className={cn(
            "h-16 flex items-center justify-between px-6 border-b shrink-0 transition-colors duration-300 backdrop-blur-sm",
            theme === 'pastel' 
                ? "bg-white/60 border-rose-100" 
                : "border-slate-200 dark:border-white/10 bg-white/80 dark:bg-[#0B0F19]"
          )}>
             <div className="flex items-center gap-4">
                <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => navigate(-1)}
                    className={cn(
                        "text-muted-foreground transition-colors",
                         theme === 'pastel' ? "hover:bg-rose-100 hover:text-rose-900" : "hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10"
                    )}
                >
                    <ChevronLeft className="h-6 w-6" />
                </Button>
                <h2 className={cn(
                    "text-xl font-semibold tracking-tight transition-colors",
                    theme === 'pastel' ? "text-slate-800" : "text-slate-900 dark:text-white"
                )}>DSA Practice</h2>
             </div>
             
             <div className="flex items-center gap-4">
                 {/* Theme Selector - Three options in a row */}
                 <ThemeSelector />

                {/* Notification Bell with Popover */}
                <Popover>
                    <PopoverTrigger asChild>
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            className={cn(
                                "text-muted-foreground relative transition-colors",
                                theme === 'pastel' ? "hover:bg-rose-100 hover:text-rose-900" : "hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10"
                            )}
                        >
                            <Bell className="h-5 w-5" />
                            {unreadCount > 0 && (
                                <span className={cn(
                                    "absolute top-2 right-2 h-2 w-2 rounded-full border animate-pulse",
                                    theme === 'pastel' ? "bg-rose-400 border-white" : "bg-red-500 border-white dark:border-[#0B0F19]"
                                )} />
                            )}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent 
                        className={cn(
                            "w-80 p-0 mr-4",
                            theme === 'pastel' 
                                ? "bg-white border-rose-100" 
                                : "bg-white dark:bg-[#111625] border-slate-200 dark:border-white/10"
                        )}
                        align="end"
                    >
                        <div className={cn(
                            "flex items-center justify-between p-4 border-b",
                            theme === 'pastel' ? "border-rose-100" : "border-slate-200 dark:border-white/10"
                        )}>
                            <h3 className={cn(
                                "font-semibold text-sm",
                                theme === 'pastel' ? "text-slate-800" : "text-slate-900 dark:text-white"
                            )}>
                                Notifications {unreadCount > 0 && `(${unreadCount})`}
                            </h3>
                            {unreadCount > 0 && (
                                <button 
                                    onClick={markAllAsRead}
                                    className={cn(
                                        "text-xs font-medium transition-colors",
                                        theme === 'pastel' ? "text-rose-600 hover:text-rose-700" : "text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300"
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
                                            theme === 'pastel' 
                                                ? "border-rose-50 hover:bg-rose-50" 
                                                : "border-slate-100 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/5",
                                            !notification.read && (theme === 'pastel' ? "bg-rose-50/50" : "bg-cyan-50/50 dark:bg-cyan-500/5")
                                        )}
                                    >
                                        <div className="flex items-start gap-3">
                                            {!notification.read && (
                                                <div className={cn(
                                                    "h-2 w-2 rounded-full mt-1.5 shrink-0",
                                                    theme === 'pastel' ? "bg-rose-400" : "bg-cyan-500"
                                                )} />
                                            )}
                                            <div className="flex-1 min-w-0">
                                                <p className={cn(
                                                    "text-sm font-medium mb-1",
                                                    theme === 'pastel' ? "text-slate-800" : "text-slate-900 dark:text-white"
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
                        {currentUser ? (
                            <button className="h-9 w-9 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 p-[2px] cursor-pointer hover:shadow-[0_0_15px_rgba(6,182,212,0.4)] transition-all">
                                {profilePhoto ? (
                                    <img 
                                        src={profilePhoto} 
                                        alt={currentUser.name}
                                        className="h-full w-full rounded-full object-cover"
                                    />
                                ) : (
                                    <div className={cn(
                                        "h-full w-full rounded-full flex items-center justify-center",
                                        theme === 'pastel' ? "bg-rose-100" : "bg-[#0B0F19]"
                                    )}>
                                        <span className={cn(
                                            "text-xs font-bold",
                                            theme === 'pastel' ? "text-rose-700" : "text-white"
                                        )}>
                                            {currentUser.name.charAt(0).toUpperCase()}
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
                            theme === 'pastel' 
                                ? "bg-white border-rose-100" 
                                : "bg-white dark:bg-[#111625] border-slate-200 dark:border-white/10"
                        )}
                        align="end"
                    >
                        {currentUser ? (
                            <>
                                {/* User Info */}
                                <div className={cn(
                                    "p-4 border-b",
                                    theme === 'pastel' ? "border-rose-100" : "border-slate-200 dark:border-white/10"
                                )}>
                                    <div className="flex items-center gap-3">
                                        <div className="h-12 w-12 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 p-[2px]">
                                            {profilePhoto ? (
                                                <img 
                                                    src={profilePhoto} 
                                                    alt={currentUser.name}
                                                    className="h-full w-full rounded-full object-cover"
                                                />
                                            ) : (
                                                <div className={cn(
                                                    "h-full w-full rounded-full flex items-center justify-center",
                                                    theme === 'pastel' ? "bg-rose-100" : "bg-[#0B0F19]"
                                                )}>
                                                    <span className={cn(
                                                        "text-lg font-bold",
                                                        theme === 'pastel' ? "text-rose-700" : "text-white"
                                                    )}>
                                                        {currentUser.name.charAt(0).toUpperCase()}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className={cn(
                                                "font-semibold text-sm truncate",
                                                theme === 'pastel' ? "text-slate-800" : "text-slate-900 dark:text-white"
                                            )}>
                                                {currentUser.name}
                                            </p>
                                            <p className="text-xs text-muted-foreground truncate">
                                                {currentUser.email}
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
                                            theme === 'pastel' 
                                                ? "hover:bg-rose-50 text-slate-700" 
                                                : "hover:bg-slate-100 dark:hover:bg-white/5 text-slate-700 dark:text-slate-300"
                                        )}
                                    >
                                        <User className="h-4 w-4" />
                                        <span>View Profile</span>
                                    </button>
                                </div>

                                {/* Logout */}
                                <div className={cn(
                                    "border-t py-2",
                                    theme === 'pastel' ? "border-rose-100" : "border-slate-200 dark:border-white/10"
                                )}>
                                    <button
                                        onClick={handleLogout}
                                        className={cn(
                                            "w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors text-red-600 dark:text-red-400",
                                            theme === 'pastel' 
                                                ? "hover:bg-rose-50" 
                                                : "hover:bg-red-50 dark:hover:bg-red-500/10"
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

          <div className="flex flex-1 min-h-0 overflow-hidden">
            {!location.pathname.startsWith("/dsa/problem/") && <DsaSidebar />}
            <main className={cn(
              "flex-1 flex flex-col min-w-0 min-h-0 overflow-y-auto overflow-x-hidden",
              !location.pathname.startsWith("/dsa/problem/") && "ml-72"
            )}>
              <div className="flex-1 flex flex-col min-h-[60vh] w-full">
                <Outlet />
              </div>
            </main>
          </div>
          
        </div>
      </div>
    </DsaFilterProvider>
  );
}
