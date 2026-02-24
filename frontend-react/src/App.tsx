import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation, Outlet } from "react-router-dom";
import { ThemeProvider } from "./contexts/ThemeContext";
import { DsaAuthProvider } from "./features/dsa/auth/DsaAuthContext";
import { DsaLayout } from "./layouts/DsaLayout";
import Index from "./pages/Index";

// Lazy load non-critical routes
const Login = lazy(() => import("./pages/Login"));
const Signup = lazy(() => import("./pages/Signup"));
const Profile = lazy(() => import("./pages/Profile"));
const Admin = lazy(() => import("./pages/Admin"));
const JoinUs = lazy(() => import("./pages/JoinUs"));
const TypingTest = lazy(() => import("./pages/TypingTest"));
const AstroTypePage = lazy(() => import("./pages/AstroTypePage"));
const NotFound = lazy(() => import("./pages/NotFound"));
const ChatBot = lazy(() => import("./components/ChatBot"));
const ComingSoon = lazy(() => import("./pages/ComingSoon"));

// DSA Practice section
const DsaLogin = lazy(() => import("./pages/dsa/DsaLogin"));
const DsaRegister = lazy(() => import("./pages/dsa/DsaRegister"));
const DsaDashboard = lazy(() => import("./pages/dsa/DsaDashboard"));
const DsaProblems = lazy(() => import("./pages/dsa/DsaProblems"));
const DsaProblemDetail = lazy(() => import("./pages/dsa/DsaProblemDetail"));
const DsaSubmissions = lazy(() => import("./pages/dsa/DsaSubmissions"));
const DsaLeaderboard = lazy(() => import("./pages/dsa/DsaLeaderboard"));
const DsaProfile = lazy(() => import("./pages/dsa/DsaProfile"));
const DsaDuelsLobby = lazy(() => import("./pages/dsa/DsaDuelsLobby"));
const DsaDuelRoom = lazy(() => import("./pages/dsa/DsaDuelRoom"));
const DsaSoloChallenge = lazy(() => import("./pages/dsa/DsaSoloChallenge"));
const DsaDailyChallenge = lazy(() => import("./pages/dsa/DsaDailyChallenge"));
const DsaCalendar = lazy(() => import("./pages/dsa/DsaCalendar"));

// TypeForge
const TypeForgeLayout = lazy(() => import("./layouts/TypeForgeLayout"));
const TypeForgeCode = lazy(() => import("./pages/typeforge/TypeForgeCode"));
const TypeForgeSpells = lazy(() => import("./pages/typeforge/TypeForgeSpells"));
const TypeForgeFun = lazy(() => import("./pages/typeforge/TypeForgeFun"));
const TypeForgeLiveCoding = lazy(() => import("./pages/typeforge/TypeForgeLiveCoding"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60000,
      refetchOnWindowFocus: false,
    },
  },
});

// Component to conditionally render ChatBot based on route
const ConditionalChatBot = () => {
  const location = useLocation();
  
  // Hide chatbot on DSA problem pages
  const hideChatBot = location.pathname.startsWith('/dsa/problem/') || 
                      location.pathname.startsWith('/dsa/duels/');
  
  if (hideChatBot) return null;
  
  return <ChatBot />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Suspense fallback={
            <div className="min-h-screen bg-background flex items-center justify-center">
              <div className="flex flex-col items-center gap-3 text-muted-foreground">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                <p className="text-sm">Loading...</p>
              </div>
            </div>
          }>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/join-us" element={<JoinUs />} />
              <Route path="/typing-test" element={<TypingTest />} />
              <Route path="/astrotype" element={<AstroTypePage />} />

              {/* TypeForge */}
              <Route path="/typeforge" element={<TypeForgeLayout />}>
                <Route index element={<Navigate to="/typeforge/code" replace />} />
                <Route path="code" element={<TypeForgeCode />} />
                <Route path="spells" element={<TypeForgeSpells />} />
                <Route path="fun" element={<TypeForgeFun />} />
                <Route path="live-coding" element={<TypeForgeLiveCoding />} />
              </Route>

              {/* DSA Practice section */}
              <Route
                path="/dsa"
                element={
                  <DsaAuthProvider>
                    <DsaLayout />
                  </DsaAuthProvider>
                }
              >
                <Route index element={<Navigate to="/dsa/problems" replace />} />
                <Route path="login" element={<DsaLogin />} />
                <Route path="register" element={<DsaRegister />} />
                <Route path="dashboard" element={<DsaDashboard />} />
                <Route path="problems" element={<DsaProblems />} />
                <Route path="problem/:id" element={<DsaProblemDetail />} />
                <Route path="submissions" element={<DsaSubmissions />} />
                {/* Shortcut redirects */}
                <Route path="solo" element={<Navigate to="/dsa/duels/solo" replace />} />
                <Route path="daily" element={<Navigate to="/dsa/duels/daily" replace />} />
                {/* Duels: nested so /dsa/duels, /dsa/duels/solo, /dsa/duels/daily, /dsa/duels/room/:id work */}
                <Route path="duels" element={<Outlet />}>
                  <Route index element={<DsaDuelsLobby />} />
                  <Route path="solo" element={<DsaSoloChallenge />} />
                  <Route path="daily" element={<DsaDailyChallenge />} />
                  <Route path="room/:roomId" element={<DsaDuelRoom />} />
                </Route>
                <Route path="leaderboard" element={<DsaLeaderboard />} />
                <Route path="profile" element={<DsaProfile />} />
                <Route path="live" element={<ComingSoon />} />
                <Route path="contest" element={<ComingSoon />} />
                <Route path="discuss" element={<ComingSoon />} />
                <Route path="calendar" element={<DsaCalendar />} />
              </Route>

              <Route path="*" element={<NotFound />} />
            </Routes>
            <ConditionalChatBot />
          </Suspense>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
