import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LogOut, Menu, X, User, Sparkles, Keyboard, Sun, Moon, Trophy, Heart } from 'lucide-react';
import { useState, useEffect, memo, lazy, Suspense, useRef } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useSupabaseAuth } from '../contexts/SupabaseAuthContext';
import type { Theme } from '../contexts/ThemeContext';

const JoinUsModal = lazy(() => import('./JoinUsModal'));

const Header = memo(() => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isJoinUsModalOpen, setIsJoinUsModalOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const { user, signOut } = useSupabaseAuth();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkAuth = () => {
      const adminStatus = localStorage.getItem('techmasterai_admin') === 'true';
      setIsAdmin(adminStatus);
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

  // Close dropdown on route change
  useEffect(() => {
    setIsProfileDropdownOpen(false);
  }, [location.pathname]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProfileDropdownOpen(false);
      }
    };

    if (isProfileDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isProfileDropdownOpen]);

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

  const handleLogout = async () => {
    localStorage.removeItem('techmasterai_admin');
    setIsAdmin(false);
    await signOut();
    setIsProfileDropdownOpen(false);
    navigate('/');
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
      title: 'Flow State',
      action: () => {
        navigate('/dsa/problems');
      },
      show: true,
    },
    {
      title: 'Leaderboard',
      icon: <Trophy className="w-4 h-4" />,
      action: () => {
        navigate('/dsa/leaderboard');
      },
      show: true,
    },
    {
      title: 'Type Forge',
      icon: <Keyboard className="w-4 h-4" />,
      action: () => {
        navigate('/typeforge');
      },
      show: true,
    },
    {
      title: 'Code Royale',
      action: () => {
        navigate('/dsa/duels');
      },
      show: true,
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
          {/* Brand - Left Aligned (Hidden on TypeForge pages) */}
          {!location.pathname.startsWith('/typeforge') && (
            <div className="flex-1 flex justify-start">
              <Link
                to="/"
                className={`flex items-center gap-2 group pointer-events-auto z-50 `}
              >
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
              </Link>
            </div>
          )}

          {/* Desktop Glassmorphic Navbar - Centered Flex (Hidden on TypeForge) */}
          {!location.pathname.startsWith('/typeforge') && (
            <div className="hidden xl:flex justify-center px-4 pointer-events-none w-auto">
              <nav className="glass-navbar rounded-full px-5 py-2 pointer-events-auto shadow-lg">
                <div className="flex items-center gap-1">
                  {navigationItems.filter(item => item.show).map((item, index) => (
                    <button
                      key={index}
                      onClick={item.action}
                      className="nav-button px-4 py-2 rounded-full font-body font-medium text-sm transition-all duration-200 whitespace-nowrap flex items-center gap-2"
                    >
                      {item.icon && item.icon}
                      {item.title}
                    </button>
                  ))}
                </div>
              </nav>
            </div>
          )}

          {/* Right Side - AI Icon & Profile Avatar */}
          <div className="flex-1 flex justify-end items-center gap-3 pointer-events-auto z-50 shrink-0">
            {/* AI Assistant Button */}
            <button
              onClick={() => window.dispatchEvent(new CustomEvent('open-chatbot'))}
              className="nav-icon-flip flex items-center justify-center h-10 w-10 rounded-lg border border-border bg-background/80 hover:bg-accent/50 transition-colors"
              aria-label="Open AI assistant"
            >
              <span className="nav-icon-flip-inner">
                <Sparkles className="w-5 h-5 text-primary" />
              </span>
            </button>

            {/* Profile Avatar Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                className="profile-avatar-button w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200"
                aria-label="Profile menu"
              >
                <User className="w-5 h-5" />
              </button>

              {/* Profile Dropdown Menu */}
              {isProfileDropdownOpen && (
                <div className="profile-dropdown absolute right-0 mt-3 w-72 rounded-2xl shadow-2xl overflow-hidden">
                  <div className="profile-dropdown-inner p-6">
                    {/* User Info Section - Only when logged in */}
                    {(user || isAdmin) && (
                      <div className="profile-user-section mb-6 pb-6 border-b" style={{ borderColor: 'var(--theme-border-secondary)' }}>
                        <div className="flex items-center gap-4 mb-3">
                          <div className="profile-avatar-large w-14 h-14 rounded-full flex items-center justify-center">
                            <User className="w-7 h-7" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-heading font-semibold text-base theme-text-primary truncate">
                              {user?.email?.split('@')[0] || 'Admin'}
                            </p>
                            <p className="font-body text-sm theme-text-secondary truncate">
                              {user?.email || 'admin@techmaster.ai'}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Theme Selector Section */}
                    <div className="profile-theme-section mb-6 pb-6 border-b" style={{ borderColor: 'var(--theme-border-secondary)' }}>
                      <p className="font-body text-xs theme-text-secondary uppercase tracking-wider mb-3">Theme</p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setTheme('light');
                          }}
                          className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl transition-all duration-200 ${
                            theme === 'light'
                              ? 'bg-cyan-500/20 border-2 border-cyan-500'
                              : 'bg-gray-100 dark:bg-gray-800 border-2 border-transparent hover:border-gray-300 dark:hover:border-gray-600'
                          }`}
                        >
                          <Sun className="w-4 h-4" />
                          <span className="font-body font-medium text-sm">Light</span>
                        </button>
                        <button
                          onClick={() => {
                            setTheme('dark');
                          }}
                          className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl transition-all duration-200 ${
                            theme === 'dark'
                              ? 'bg-cyan-500/20 border-2 border-cyan-500'
                              : 'bg-gray-100 dark:bg-gray-800 border-2 border-transparent hover:border-gray-300 dark:hover:border-gray-600'
                          }`}
                        >
                          <Moon className="w-4 h-4" />
                          <span className="font-body font-medium text-sm">Dark</span>
                        </button>
                      </div>
                    </div>

                    {/* Actions Section */}
                    <div className="profile-actions-section space-y-2">
                      {(user || isAdmin) ? (
                        <>
                          <button
                            onClick={() => {
                              navigate('/dsa/leaderboard');
                              setIsProfileDropdownOpen(false);
                            }}
                            className="profile-action-button w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200"
                          >
                            <Trophy className="w-5 h-5" />
                            <span className="font-body font-medium text-sm">Leaderboard</span>
                          </button>
                          <button
                            onClick={handleLogout}
                            className="profile-action-button profile-logout-button w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200"
                          >
                            <LogOut className="w-5 h-5" />
                            <span className="font-body font-medium text-sm">Logout</span>
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => {
                              navigate('/login');
                              setIsProfileDropdownOpen(false);
                            }}
                            className="profile-action-button w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200"
                          >
                            <User className="w-5 h-5" />
                            <span className="font-body font-medium text-sm">Login</span>
                          </button>
                          <button
                            onClick={() => {
                              navigate('/signup');
                              setIsProfileDropdownOpen(false);
                            }}
                            className="profile-action-button profile-signup-button w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200"
                          >
                            <Sparkles className="w-5 h-5" />
                            <span className="font-body font-medium text-sm">Sign Up</span>
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Menu Button - Only visible on mobile/tablet */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="nav-icon-flip xl:hidden hamburger-button w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-200"
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
                  className="nav-button px-4 py-3 rounded-lg font-body font-medium text-base text-left transition-all duration-200 flex items-center gap-3"
                >
                  {item.icon && item.icon}
                  {item.title}
                </button>
              ))}

              {/* User Info in Mobile - Display Only */}
              {(user || isAdmin) && (
                <div className="flex items-center gap-3 px-4 py-3 rounded-lg mt-2" style={{ background: 'var(--theme-card-hover-bg)', border: '1px solid var(--theme-border-primary)' }}>
                  <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'var(--theme-accent)', color: 'var(--theme-bg-primary)' }}>
                    <User className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-body font-semibold text-sm theme-text-primary truncate">
                      {user?.email?.split('@')[0] || 'Admin'}
                    </p>
                    <p className="font-body text-xs theme-text-secondary truncate">
                      {user?.email || 'admin@techmaster.ai'}
                    </p>
                  </div>
                </div>
              )}

              {/* Theme Selector in Mobile */}
              <div className="mt-4 mb-2">
                <p className="font-body text-xs theme-text-secondary uppercase tracking-wider mb-3 px-4">Theme</p>
                <div className="flex gap-2 px-4">
                  <button
                    onClick={() => setTheme('light')}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg transition-all duration-200 ${
                      theme === 'light'
                        ? 'bg-cyan-500/20 border-2 border-cyan-500'
                        : 'bg-gray-100 dark:bg-gray-800 border-2 border-transparent'
                    }`}
                  >
                    <Sun className="w-4 h-4" />
                    <span className="font-body font-medium text-sm">Light</span>
                  </button>
                  <button
                    onClick={() => setTheme('dark')}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg transition-all duration-200 ${
                      theme === 'dark'
                        ? 'bg-cyan-500/20 border-2 border-cyan-500'
                        : 'bg-gray-100 dark:bg-gray-800 border-2 border-transparent'
                    }`}
                  >
                    <Moon className="w-4 h-4" />
                    <span className="font-body font-medium text-sm">Dark</span>
                  </button>
                </div>
              </div>

              {/* Actions in Mobile */}
              {(user || isAdmin) ? (
                <>
                  <button
                    onClick={() => {
                      navigate('/dsa/leaderboard');
                      setIsMobileMenuOpen(false);
                    }}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg font-body font-medium text-base transition-all duration-200 mt-2"
                    style={{ background: 'var(--theme-card-hover-bg)', border: '1px solid var(--theme-border-primary)' }}
                  >
                    <Trophy className="w-5 h-5" style={{ color: 'var(--theme-accent)' }} />
                    <span className="theme-text-primary">Leaderboard</span>
                  </button>
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
                </>
              ) : (
                <>
                  <button
                    onClick={() => {
                      navigate('/login');
                      setIsMobileMenuOpen(false);
                    }}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg font-body font-medium text-base transition-all duration-200 mt-2"
                    style={{ background: 'var(--theme-card-hover-bg)', border: '1px solid var(--theme-border-primary)' }}
                  >
                    <User className="w-5 h-5" style={{ color: 'var(--theme-accent)' }} />
                    <span className="theme-text-primary">Login</span>
                  </button>
                  <button
                    onClick={() => {
                      navigate('/signup');
                      setIsMobileMenuOpen(false);
                    }}
                    className="px-4 py-3 rounded-lg font-body font-medium text-base transition-all duration-200"
                    style={{ background: 'var(--theme-accent)', color: 'var(--theme-bg-primary)' }}
                  >
                    Sign Up
                  </button>
                </>
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



