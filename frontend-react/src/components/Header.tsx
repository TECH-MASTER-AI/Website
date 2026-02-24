import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LogOut, Menu, X, User, Sparkles, Heart, LogIn, UserPlus } from 'lucide-react';
import { ThemeSelector } from './ThemeSelector';
import { useState, useEffect, memo, lazy, Suspense } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

const JoinUsModal = lazy(() => import('./JoinUsModal'));

const Header = memo(() => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [currentUser, setCurrentUser] = useState<{ name: string; email: string; photo?: string } | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isJoinUsModalOpen, setIsJoinUsModalOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { theme } = useTheme();

  useEffect(() => {
    const checkAuth = () => {
      const adminStatus = localStorage.getItem('techmasterai_admin') === 'true';
      setIsAdmin(adminStatus);
      
      const userStr = localStorage.getItem('techmasterai_user');
      if (userStr) {
        try {
          setCurrentUser(JSON.parse(userStr));
        } catch {
          setCurrentUser(null);
        }
      } else {
        setCurrentUser(null);
      }
    };
    checkAuth();
    window.addEventListener('storage', checkAuth);
    return () => window.removeEventListener('storage', checkAuth);
  }, [location]);

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [location.pathname]);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  const handleLogout = () => {
    localStorage.removeItem('techmasterai_admin');
    localStorage.removeItem('techmasterai_user');
    setIsAdmin(false);
    setCurrentUser(null);
    toast.success('Logged out successfully');
    window.location.href = '/';
  };

  const navigationItems = [
    {
      title: 'Home',
      action: () => {
        if (location.pathname === '/') {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
          navigate('/');
          setTimeout(() => window.scrollTo({ top: 0, behavior: 'instant' }), 0);
        }
      },
      show: true,
    },
    {
      title: 'DSA Practice',
      action: () => {
        navigate('/dsa');
      },
      show: true,
    },
    {
      title: 'Typing Test',
      action: () => {
        navigate('/typing-test');
      },
      show: true,
    },
    {
      title: '1v1 Duels',
      action: () => {
        navigate('/dsa/duels');
      },
      show: true,
    },
    {
      title: 'Login',
      action: () => {
        navigate('/login');
        setTimeout(() => window.scrollTo({ top: 0, behavior: 'instant' }), 0);
      },
      show: !currentUser, // Hide when user is logged in
    },
    {
      title: 'Sign Up',
      action: () => {
        navigate('/signup');
        setTimeout(() => window.scrollTo({ top: 0, behavior: 'instant' }), 0);
      },
      show: !currentUser, // Hide when user is logged in
    },
  ];

  return (
    <>
      {/* Join Us Modal - Lazy loaded */}
      <Suspense fallback={null}>
        <JoinUsModal 
          isOpen={isJoinUsModalOpen} 
          onClose={() => setIsJoinUsModalOpen(false)} 
        />
      </Suspense>

      <header className="fixed top-4 sm:top-6 md:top-10 left-0 right-0 z-50 px-4 sm:px-6">
        <div className="flex items-center justify-between max-w-screen-2xl mx-auto">
          {/* Brand - Left Aligned (Width balanced with right side for perfect centering) */}
          <div className="flex-1 flex justify-start">
            <Link
              to="/"
              className={`flex items-center gap-2 group pointer-events-auto z-50 ${theme === 'pastel' ? 'font-pixel-nav text-primary' : ''}`}
            >
              {theme === 'pastel' ? (
                <>
                  <Heart className="w-6 h-6 sm:w-7 sm:h-7 fill-primary shrink-0" aria-hidden />
                  <span className="font-bold text-sm sm:text-base tracking-wide">
                    Pixel Code Haven
                  </span>
                </>
              ) : (
                <>
                  <img
                    src={theme === 'dark' ? '/tmai-logo.png' : '/tmai-logo-dark.png'}
                    alt="TechMasterAI Logo"
                    className="w-8 h-8 sm:w-10 sm:h-10 rounded transition-all duration-300 logo-hover"
                    style={{
                      objectFit: 'contain',
                      filter: theme === 'dark' ? 'brightness(1.1)' : 'brightness(1)',
                    }}
                    onError={(e) => {
                      e.currentTarget.src = '/tmai-logo.png';
                    }}
                  />
                  <span className="font-heading font-bold text-sm sm:text-base tracking-wide theme-text-primary">
                    TECHMASTER<span className="theme-accent">AI</span>
                  </span>
                </>
              )}
            </Link>
          </div>

          {/* Desktop Glassmorphic Navbar - Centered Flex */}
          <div className="hidden xl:flex justify-center px-4 pointer-events-none w-auto">
            <nav className="glass-navbar rounded-full px-5 py-2 pointer-events-auto shadow-lg">
              <div className="flex items-center gap-1">
                {navigationItems.filter(item => item.show && !['Login', 'Sign Up'].includes(item.title)).map((item, index) => (
                  <button
                    key={index}
                    onClick={item.action}
                    className="nav-button px-4 py-2 rounded-full font-body font-medium text-sm transition-all duration-200 whitespace-nowrap"
                  >
                    {item.title}
                  </button>
                ))}


              </div>
            </nav>
          </div>

          {/* Right Side - Auth Buttons, AI icon, Theme (3-way), Mobile Menu */}
          <div className="flex-1 flex justify-end items-center gap-4 pointer-events-auto z-50 shrink-0">
            {/* Desktop: single Login/Sign Up icon with dropdown when not logged in */}
            <div className="hidden lg:flex items-center gap-2">
              {!currentUser && !isAdmin && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      className="nav-icon-flip flex items-center justify-center h-10 w-10 rounded-lg border border-border bg-background/80 hover:bg-accent/50 transition-colors"
                      aria-label="Login or Sign up"
                    >
                      <span className="nav-icon-flip-inner">
                        <User className="w-5 h-5" style={{ color: 'var(--theme-accent)' }} />
                      </span>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="min-w-[160px]">
                    <DropdownMenuItem
                      onClick={() => {
                        navigate('/login');
                        window.scrollTo({ top: 0, behavior: 'instant' });
                      }}
                      className="cursor-pointer gap-2"
                    >
                      <LogIn className="h-4 w-4" />
                      Login
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => {
                        navigate('/signup');
                        window.scrollTo({ top: 0, behavior: 'instant' });
                      }}
                      className="cursor-pointer gap-2"
                    >
                      <UserPlus className="h-4 w-4" />
                      Sign Up
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}

              {/* User Name - Right Aligned */}
              {currentUser && !isAdmin && (
                <button
                  onClick={() => navigate('/profile')}
                  className="flex items-center gap-2 px-4 py-2 rounded-full font-body font-medium text-sm transition-all duration-200 hover:scale-105"
                  style={{ background: 'var(--theme-card-hover-bg)', border: '1px solid var(--theme-border-primary)' }}
                >
                  {currentUser.photo ? (
                    <img src={currentUser.photo} alt={currentUser.name} className="w-6 h-6 rounded-full object-cover" />
                  ) : (
                    <User className="w-4 h-4" style={{ color: 'var(--theme-accent)' }} />
                  )}
                  <span className="theme-text-primary">{currentUser.name}</span>
                </button>
              )}

              {/* Logout Button - Right Aligned */}
              {(currentUser || isAdmin) && (
                <button onClick={handleLogout} className="admin-logout-button px-4 py-2 rounded-full text-sm flex items-center gap-2 hover:bg-destructive/10 hover:text-destructive transition-colors">
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              )}
            </div>

            <div className="h-6 w-px bg-border/50 hidden lg:block mx-1" />

            <div className="flex items-center gap-2">
                <button
                onClick={() => window.dispatchEvent(new CustomEvent('open-chatbot'))}
                className="nav-icon-flip flex items-center justify-center h-10 w-10 rounded-lg border border-border bg-background/80 hover:bg-accent/50 transition-colors"
                aria-label="Open AI assistant"
                >
                <span className="nav-icon-flip-inner">
                    <Sparkles className="w-5 h-5 text-primary" />
                </span>
                </button>
                <ThemeSelector />
            </div>

            {/* Mobile Menu Button - Only visible on mobile/tablet */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="nav-icon-flip xl:hidden hamburger-button w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-200 ml-1"
              aria-label="Toggle menu"
            >
              <span className="nav-icon-flip-inner">
                {isMobileMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 z-40 xl:hidden hamburger-backdrop"
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <div 
            className="absolute top-20 sm:top-24 left-4 right-4 sm:left-6 sm:right-6 hamburger-menu-card rounded-2xl p-6 sm:p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <nav className="flex flex-col gap-3 sm:gap-4">
              {navigationItems.filter(item => item.show).map((item, index) => (
                <button
                  key={index}
                  onClick={() => {
                    item.action();
                    setIsMobileMenuOpen(false);
                  }}
                  className="nav-button px-4 py-3 rounded-lg font-body font-medium text-base text-left transition-all duration-200"
                >
                  {item.title}
                </button>
              ))}

              {/* User Name Display in Mobile - Clickable */}
              {currentUser && !isAdmin && (
                <button
                  onClick={() => {
                    navigate('/profile');
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex items-center gap-2 px-4 py-3 rounded-lg font-body font-medium text-base transition-all duration-200"
                  style={{ 
                    background: 'var(--theme-card-hover-bg)', 
                    border: '1px solid var(--theme-border-primary)',
                  }}
                >
                  {currentUser.photo ? (
                    <img 
                      src={currentUser.photo} 
                      alt={currentUser.name}
                      className="w-8 h-8 rounded-full object-cover"
                      style={{ border: '1px solid var(--theme-accent)' }}
                    />
                  ) : (
                    <User className="w-5 h-5" style={{ color: 'var(--theme-accent)' }} />
                  )}
                  <span className="theme-text-primary">{currentUser.name}</span>
                </button>
              )}

              {/* User Logout Button in Mobile Menu */}
              {currentUser && !isAdmin && (
                <button
                  onClick={() => {
                    handleLogout();
                    setIsMobileMenuOpen(false);
                  }}
                  className="admin-logout-button px-4 py-3 rounded-lg font-body font-medium text-base flex items-center gap-2"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Logout</span>
                </button>
              )}

              {/* Admin Logout Button in Mobile Menu */}
              {isAdmin && (
                <button
                  onClick={() => {
                    handleLogout();
                    setIsMobileMenuOpen(false);
                  }}
                  className="admin-logout-button px-4 py-3 rounded-lg font-body font-medium text-base flex items-center gap-2"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Logout</span>
                </button>
              )}
            </nav>
          </div>
        </div>
      )}
    </>
  );
});

Header.displayName = 'Header';

export default Header;
