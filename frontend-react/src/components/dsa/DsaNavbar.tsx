import { Link, useLocation } from "react-router-dom";
import { Code2, List, User, Menu, X, LogOut, Swords, Sparkles, Zap } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ThemeSelector } from "@/components/ThemeSelector";
import { useDsaAuth } from "@/features/dsa/auth/DsaAuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const navLinks = [
  { to: "/dsa/dashboard", label: "Home", icon: HomeIcon },
  { to: "/dsa/problems", label: "Problems", icon: List },
  { to: "/dsa/contest", label: "Contest", icon: Swords },
  { to: "/dsa/discuss", label: "Discuss", icon: MessageSquareIcon },
];

function HomeIcon(props: any) {
    return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
}
function MessageSquareIcon(props: any) {
    return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
}

export function DsaNavbar() {
  const location = useLocation();
  const { theme } = useTheme();
  const { user, logout } = useDsaAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const isPastel = theme === "pastel";

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-[#0B0F19]/80 backdrop-blur-xl">
      <div className="container flex h-16 items-center justify-between px-4">
        {/* Logo Area */}
        <Link
          to={"/dsa"}
          className={`flex items-center gap-2 font-bold text-xl tracking-tight`}
        >
          <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-primary/20 mr-1">
             <Code2 className="h-5 w-5 text-primary" />
             <div className="absolute inset-0 bg-primary/20 blur-lg rounded-lg animate-pulse" />
          </div>
          <span className="bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">DSA Practice</span>
        </Link>
        
        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1 mx-6">
          {navLinks.map(({ to, label, icon: Icon }) => {
            const isActive = location.pathname === to || (to !== "/dsa/dashboard" && location.pathname.startsWith(to));
            return (
                <Link 
                    key={to} 
                    to={to}
                    className={cn(
                        "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 relative group overflow-hidden",
                        isActive 
                            ? "text-white bg-white/10 shadow-[0_0_15px_rgba(255,255,255,0.1)] border border-white/10" 
                            : "text-muted-foreground hover:text-white hover:bg-white/5"
                    )}
                >
                     <Icon className={cn("h-4 w-4 transition-colors", isActive ? "text-primary" : "group-hover:text-primary")} />
                     {label}
                     {isActive && <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary to-transparent" />}
                </Link>
            )
          })}
        </nav>

        {/* Right Side Actions */}
        <div className="flex items-center gap-2 lg:gap-4">
           {/* Daily Streak (Mock) */}
           <div className="hidden sm:flex items-center gap-1 text-orange-400 bg-orange-500/10 px-3 py-1.5 rounded-full border border-orange-500/20">
               <Zap className="h-3.5 w-3.5 fill-orange-400" />
               <span className="text-xs font-bold">12</span>
           </div>

           <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-white"
            onClick={() => window.dispatchEvent(new CustomEvent("open-chatbot"))}
          >
            <Sparkles className="h-4 w-4" />
          </Button>
          
          <ThemeSelector />

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20">
                  <User className="h-4 w-4 text-primary" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-[#0B0F19] border-white/10 text-white">
                <DropdownMenuItem className="focus:bg-white/10 focus:text-white cursor-pointer" asChild>
                  <Link to="/dsa/profile">
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem className="focus:bg-white/10 focus:text-white cursor-pointer" asChild>
                  <Link to="/dsa/dashboard">
                    <List className="mr-2 h-4 w-4" />
                    Dashboard
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem className="focus:bg-white/10 focus:text-white cursor-pointer" onClick={logout}>
                  <LogOut className="mr-2 h-4 w-4 text-red-400" />
                  <span className="text-red-400">Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
             <div className="flex gap-2">
                 <Link to="/dsa/login">
                    <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-white">Log in</Button>
                 </Link>
                <Link to="/dsa/register">
                    <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_0_15px_rgba(6,182,212,0.4)]">Register</Button>
                </Link>
             </div>
          )}
          
          <Button className="hidden sm:flex bg-gradient-to-r from-yellow-600 to-amber-600 border-0 text-white font-bold tracking-wide shadow-[0_0_15px_rgba(234,179,8,0.3)] hover:shadow-[0_0_25px_rgba(234,179,8,0.5)] transition-all h-8 px-4 text-xs uppercase" size="sm">
            Upgrade
          </Button>

          {/* Mobile Menu Toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileOpen((o) => !o)}
          >
             {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-white/10 bg-[#0B0F19] p-4 flex flex-col gap-2 absolute w-full left-0 top-16 shadow-2xl animate-in slide-in-from-top-5">
          {navLinks.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                location.pathname === to ? "bg-primary/20 text-white" : "text-muted-foreground hover:bg-white/5 hover:text-white"
              )}
            >
              <Icon className="h-5 w-5" />
              {label}
            </Link>
          ))}
          {!user && (
            <div className="flex flex-col gap-2 mt-2 pt-2 border-t border-white/10">
               <Link to="/dsa/login" onClick={() => setMobileOpen(false)}>
                  <Button variant="outline" className="w-full border-white/10 bg-transparent text-white hover:bg-white/5">Log in</Button>
               </Link>
               <Link to="/dsa/register" onClick={() => setMobileOpen(false)}>
                  <Button className="w-full bg-primary text-primary-foreground">Register</Button>
               </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
