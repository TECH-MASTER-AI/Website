import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { TypeForgeSidebar } from "@/components/typeforge/TypeForgeSidebar";
import { ChevronLeft, Bell, User, LogOut, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/contexts/ThemeContext";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext";
import { useState } from "react";
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

export default function TypeForgeLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { user, signOut } = useSupabaseAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [showLeaveDialog, setShowLeaveDialog] = useState(false);
  
  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  const handleBackClick = () => {
    setShowLeaveDialog(true);
  };

  const handleLeaveConfirm = () => {
    setShowLeaveDialog(false);
    navigate(-1);
  };

  // Dynamic page title based on current route
  const getPageTitle = () => {
    const path = location.pathname;
    
    if (path === '/typeforge' || path === '/typeforge/') return 'Type Forge';
    if (path.includes('/typeforge/code')) return 'Type Forge - Code';
    if (path.includes('/typeforge/spells')) return 'Type Forge - Spells';
    if (path.includes('/typeforge/astrotypes')) return 'Type Forge - Astro Types';
    if (path === '/livecoding') return 'Live Coding';
    
    return 'Type Forge';
  };

  const userName = user?.user_metadata?.username || user?.email?.split('@')[0] || 'User';
  const userEmail = user?.email || '';

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top Header */}
      <header className={cn(
        "h-16 flex items-center justify-between px-6 border-b shrink-0 transition-colors duration-300 backdrop-blur-sm fixed top-0 left-0 right-0 z-50",
        "border-slate-200 dark:border-white/10 bg-white/80 dark:bg-[#0B0F19]"
      )}>
         <div className="flex items-center gap-4">
            {/* Sidebar Toggle Button */}
            <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className={cn(
                    "text-muted-foreground transition-colors",
                     theme === 'pastel' ? "hover:bg-rose-100 hover:text-rose-900" : "hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10"
                )}
                title={isSidebarOpen ? "Hide sidebar" : "Show sidebar"}
            >
                {isSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
            
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
            {/* Notification Bell */}
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
                    </Button>
                </PopoverTrigger>
                <PopoverContent 
                    className={cn(
                        "w-80 p-0 mr-4",
                        "bg-white dark:bg-[#111625] border-slate-200 dark:border-white/10"
                    )}
                    align="end"
                >
                    <div className="p-8 text-center">
                        <Bell className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-30" />
                        <p className="text-sm text-muted-foreground">No notifications yet</p>
                    </div>
                </PopoverContent>
            </Popover>
            
            {/* User Profile Dropdown */}
            <Popover>
                <PopoverTrigger asChild>
                    {user ? (
                        <button className="h-9 w-9 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 p-[2px] cursor-pointer hover:shadow-[0_0_15px_rgba(6,182,212,0.4)] transition-all">
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
                            <div className={cn(
                                "p-4 border-b",
                                "border-slate-200 dark:border-white/10"
                            )}>
                                <div className="flex items-center gap-3">
                                    <div className="h-12 w-12 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 p-[2px]">
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

                            <div className="py-2">
                                <button
                                    onClick={() => navigate('/profile')}
                                    className={cn(
                                        "w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors",
                                        "hover:bg-slate-100 dark:hover:bg-white/5 text-slate-700 dark:text-slate-300"
                                    )}
                                >
                                    <User className="h-4 w-4" />
                                    <span>View Profile</span>
                                </button>
                            </div>

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
      
      {/* Background Layer */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 theme-bg-primary" />
        <div className="absolute inset-0 cyber-grid" />
      </div>

      <div className="flex flex-1 pt-16">
        {/* Sidebar */}
        {isSidebarOpen && <TypeForgeSidebar />}
        
        {/* Main Content Area */}
        <main className={cn(
          "flex-1 overflow-auto transition-all duration-300",
          isSidebarOpen ? "ml-72" : "ml-0"
        )}>
          <Outlet />
        </main>
      </div>

      {/* Leave Confirmation Dialog */}
      <AlertDialog open={showLeaveDialog} onOpenChange={setShowLeaveDialog}>
        <AlertDialogContent className={cn(
          theme === 'pastel' 
            ? "bg-white border-rose-100" 
            : "bg-white dark:bg-[#111625] border-slate-200 dark:border-white/10"
        )}>
          <AlertDialogHeader>
            <AlertDialogTitle className={cn(
              theme === 'pastel' ? "text-slate-800" : "text-slate-900 dark:text-white"
            )}>
              Leave this page?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to leave?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Stay</AlertDialogCancel>
            <AlertDialogAction onClick={handleLeaveConfirm}>Leave</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
