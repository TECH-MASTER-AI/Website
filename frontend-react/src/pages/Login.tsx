import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, LogIn, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { auth } from '../lib/firebase';
import {
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  GoogleAuthProvider,
} from 'firebase/auth';
import Header from '../components/Header';
import Footer from '../components/Footer';
import FloatingLines from '../components/FloatingLines';

function GoogleLogoIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden>
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
}

const ONE_TIME_USED_KEY = 'techmasterai_onetime_used_emails';
const ADMIN_EMAIL = 'admin@123';

function getOneTimeUsedEmails(): string[] {
  try {
    return JSON.parse(localStorage.getItem(ONE_TIME_USED_KEY) || '[]');
  } catch {
    return [];
  }
}

function markEmailUsedOnce(email: string): void {
  const list = getOneTimeUsedEmails();
  if (list.includes(email.toLowerCase())) return;
  list.push(email.toLowerCase());
  localStorage.setItem(ONE_TIME_USED_KEY, JSON.stringify(list));
}

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  // Handle Google redirect return
  useEffect(() => {
    if (!auth) return;
    getRedirectResult(auth)
      .then((result) => {
        if (!result?.user) return;
        const u = result.user;
        const name = u.displayName || u.email?.split('@')[0] || 'User';
        localStorage.setItem(
          'techmasterai_user',
          JSON.stringify({ name, email: u.email || '', photo: u.photoURL || undefined })
        );
        toast.success('Signed in with Google!');
        navigate('/', { replace: true });
      })
      .catch(() => {});
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    await new Promise((resolve) => setTimeout(resolve, 1500));

    const emailLower = formData.email.trim().toLowerCase();

    // Check for admin credentials (admin exempt from one-time restriction)
    if (formData.email === ADMIN_EMAIL && formData.password === 'Akshat#4678') {
      localStorage.setItem('techmasterai_admin', 'true');
      localStorage.setItem('techmasterai_user', JSON.stringify({ name: 'Admin', email: formData.email }));
      setIsLoading(false);
      toast.success('🎉 Welcome back, Admin!', {
        description: 'You have full access to the admin dashboard.',
        duration: 4000,
      });
      navigate('/admin');
      return;
    }

    // Strict one-time login: each account can log in only once
    const usedEmails = getOneTimeUsedEmails();
    if (usedEmails.includes(emailLower)) {
      setIsLoading(false);
      toast.error('One-time login already used', {
        description: 'This account has already used its one-time login. Each account can log in only once.',
        duration: 6000,
      });
      return;
    }

    // First (and only) login for this account
    markEmailUsedOnce(formData.email.trim());

    const userName = formData.email.split('@')[0];
    const existingData = JSON.parse(localStorage.getItem('techmasterai_users') || '[]');
    const loginEntry = {
      email: formData.email,
      name: userName,
      id: Date.now(),
      submittedAt: new Date().toISOString(),
      type: 'login',
    };
    localStorage.setItem('techmasterai_users', JSON.stringify([...existingData, loginEntry]));
    localStorage.setItem('techmasterai_user', JSON.stringify({ name: userName, email: formData.email }));

    setIsLoading(false);
    toast.success('🎉 Welcome to TechMaster!', {
      description: 'Login successful. This is your one-time login for this account.',
      duration: 4000,
    });
    navigate('/');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleGoogleSignIn = async () => {
    if (!auth) {
      toast.error('Google sign-in is not configured');
      return;
    }
    setIsGoogleLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const u = result.user;
      const name = u.displayName || u.email?.split('@')[0] || 'User';
      localStorage.setItem(
        'techmasterai_user',
        JSON.stringify({ name, email: u.email || '', photo: u.photoURL || undefined })
      );
      toast.success('Signed in with Google!');
      navigate('/');
    } catch (err: unknown) {
      const code = err && typeof err === 'object' && 'code' in err ? (err as { code: string }).code : '';
      if (code === 'auth/popup-blocked' || code === 'auth/cancelled-popup-request') {
        await signInWithRedirect(auth, provider);
        return;
      }
      toast.error(err && typeof err === 'object' && 'message' in err ? String((err as { message: string }).message) : 'Google sign-in failed');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background scanline">
      <Header />
      <main className="flex-1 flex items-center justify-center px-4 pt-32 pb-16 relative overflow-hidden">
        {/* Floating Lines Background Animation */}
        <FloatingLines
          enabledWaves={['top', 'middle', 'bottom']}
          lineCount={5}
          lineDistance={5}
        />

        {/* Background Effects */}
        <div className="absolute inset-0 cyber-grid opacity-30" style={{ zIndex: 1 }} />
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-float" style={{ zIndex: 2 }} />
        <div className="absolute bottom-1/4 left-1/4 w-64 h-64 bg-secondary/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s', zIndex: 2 }} />

        <div className="relative z-10 w-full max-w-md">
          <div className="glass-panel neon-border rounded-lg p-8 relative" style={{ boxShadow: '0 0 20px rgba(0, 194, 255, 0.5), 0 0 40px rgba(0, 194, 255, 0.3), 0 0 60px rgba(0, 194, 255, 0.15)' }}>
            <h1 className="font-orbitron text-3xl font-bold text-center theme-accent mb-2">
              Access Terminal
            </h1>
            <p className="font-rajdhani text-center theme-text-secondary mb-2">
              Enter your credentials to continue
            </p>
            <p className="font-rajdhani text-center text-xs theme-text-secondary mb-8 opacity-90">
              One-time login only — each account can log in once.
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors" style={{ color: 'var(--theme-accent)', opacity: 0.5 }} />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Email Address"
                  required
                  className="w-full pl-12 pr-4 py-4 theme-input rounded-lg font-rajdhani text-lg"
                  style={{ 
                    color: 'var(--theme-text-primary)',
                  }}
                />
              </div>

              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors" style={{ color: 'var(--theme-accent)', opacity: 0.5 }} />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Password"
                  required
                  className="w-full pl-12 pr-4 py-4 theme-input rounded-lg font-rajdhani text-lg"
                  style={{ 
                    color: 'var(--theme-text-primary)',
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-4 theme-button-primary rounded-lg flex items-center justify-center gap-3 disabled:opacity-50 font-rajdhani font-semibold text-lg"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    <span>Authenticating...</span>
                  </>
                ) : (
                  <>
                    <LogIn className="w-5 h-5" />
                    <span>Login</span>
                  </>
                )}
              </button>

              <div className="relative my-6">
                <span className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border" style={{ borderColor: 'var(--theme-accent)', opacity: 0.4 }} />
                </span>
                <span className="relative flex justify-center text-xs uppercase theme-text-secondary">or</span>
              </div>

              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isLoading || isGoogleLoading}
                className="w-full py-4 rounded-lg flex items-center justify-center gap-3 border font-rajdhani font-semibold text-lg transition-colors hover:bg-accent/10 disabled:opacity-50"
                style={{ borderColor: 'var(--theme-accent)', color: 'var(--theme-text-primary)' }}
              >
                <GoogleLogoIcon className="h-5 w-5 shrink-0" />
                {isGoogleLoading ? 'Signing in…' : 'Sign in with Google'}
              </button>
            </form>

            <p className="mt-6 text-center font-rajdhani theme-text-secondary">
              Don't have an account?{' '}
              <Link to="/signup" className="theme-accent hover:underline font-semibold">
                Sign Up
              </Link>
            </p>

            {/* Decorative corners */}
            <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2" style={{ borderColor: 'var(--theme-accent)' }} />
            <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2" style={{ borderColor: 'var(--theme-accent)' }} />
            <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2" style={{ borderColor: 'var(--theme-accent)' }} />
            <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2" style={{ borderColor: 'var(--theme-accent)' }} />
          </div>

          {/* Back to Home - Secondary Navigation */}
          <div className="mt-8 flex justify-center">
            <Link
              to="/"
              className="inline-flex items-center gap-2 theme-text-secondary hover:theme-accent transition-all duration-200 font-rajdhani text-sm group"
            >
              <ArrowLeft className="w-4 h-4 transition-transform duration-200 group-hover:-translate-x-1" />
              <span className="group-hover:underline">Back to Home</span>
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Login;
