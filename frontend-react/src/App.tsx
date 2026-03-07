import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, Outlet, useLocation } from "react-router-dom";
import { ThemeProvider } from "./contexts/ThemeContext";
import { SupabaseAuthProvider, useSupabaseAuth } from "./contexts/SupabaseAuthContext";
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

// Static Pages - Product
const Features = lazy(() => import("./pages/static/Features"));

// Static Pages - Company
const About = lazy(() => import("./pages/static/About"));
const Careers = lazy(() => import("./pages/static/Careers"));
const Contact = lazy(() => import("./pages/static/Contact"));

// Static Pages - Legal
const Privacy = lazy(() => import("./pages/static/Privacy"));
const Terms = lazy(() => import("./pages/static/Terms"));
const Security = lazy(() => import("./pages/static/Security"));
const Cookies = lazy(() => import("./pages/static/Cookies"));

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
const DsaNotes = lazy(() => import("./pages/dsa/DsaNotes"));

// TypeForge
const TypeForgeLayout = lazy(() => import("./layouts/TypeForgeLayout"));
const TypeForgeCode = lazy(() => import("./pages/typeforge/TypeForgeCodeNew"));
const TypeForgeSpells = lazy(() => import("./pages/typeforge/TypeForgeSpellsNew"));
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

const RequireDsaAuth = () => {
  const { user, loading } = useSupabaseAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="text-sm">Checking session...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/dsa/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
          <SupabaseAuthProvider>
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

              {/* Static Pages - Product */}
              <Route path="/features" element={<Features />} />

              {/* Static Pages - Company */}
              <Route path="/about" element={<About />} />
              <Route path="/careers" element={<Careers />} />
              <Route path="/contact" element={<Contact />} />

              {/* Static Pages - Legal */}
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/security" element={<Security />} />
              <Route path="/cookies" element={<Cookies />} />

              {/* TypeForge */}
              <Route path="/typeforge" element={<TypeForgeLayout />}>
                <Route index element={<Navigate to="/typeforge/spells" replace />} />
                <Route path="code" element={<TypeForgeCode />} />
                <Route path="spells" element={<TypeForgeSpells />} />
                <Route path="astrotypes" element={<AstroTypePage />} />
              </Route>

              {/* Live Coding - Separate from TypeForge */}
              <Route path="/livecoding" element={<TypeForgeLiveCoding />} />

              {/* DSA Practice section */}
              <Route
                path="/dsa"
                element={<DsaLayout />}
              >
                <Route index element={<Navigate to="/dsa/dashboard" replace />} />
                <Route path="login" element={<DsaLogin />} />
                <Route path="register" element={<DsaRegister />} />
                <Route element={<RequireDsaAuth />}>
                  <Route path="dashboard" element={<DsaDashboard />} />
                  <Route path="problems" element={<DsaProblems />} />
                  <Route path="problem/:id" element={<DsaProblemDetail />} />
                  <Route path="submissions" element={<DsaSubmissions />} />
                  <Route path="duels" element={<DsaDuelsLobby />} />
                  <Route path="duels/room/:roomId" element={<DsaDuelRoom />} />
                  <Route path="duels/solo" element={<DsaSoloChallenge />} />
                  <Route path="duels/daily" element={<DsaDailyChallenge />} />
                  <Route path="leaderboard" element={<DsaLeaderboard />} />
                  <Route path="profile" element={<DsaProfile />} />
                  <Route path="live" element={<ComingSoon />} />
                  <Route path="contest" element={<ComingSoon />} />
                  <Route path="discuss" element={<ComingSoon />} />
                  <Route path="calendar" element={<DsaCalendar />} />
                  <Route path="notes" element={<DsaNotes />} />
                </Route>
              </Route>

              {/* Coming Soon - standalone route */}
              <Route path="/coming-soon" element={<ComingSoon />} />

              <Route path="*" element={<NotFound />} />
            </Routes>
            <ConditionalChatBot />
          </Suspense>
          </SupabaseAuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
