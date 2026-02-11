import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, LogIn, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import Header from '../components/Header';
import Footer from '../components/Footer';

const ADMIN_EMAIL = 'admin@123';

const Login = () => {
  const navigate = useNavigate();
  const { signIn } = useSupabaseAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Check for admin credentials (special case)
    if (formData.email === ADMIN_EMAIL && formData.password === 'Akshat#4678') {
      localStorage.setItem('techmasterai_admin', 'true');
      setIsLoading(false);
      toast.success('🎉 Welcome back, Admin!', {
        description: 'You have full access to the admin dashboard.',
        duration: 4000,
      });
      navigate('/admin');
      return;
    }

    // Use Supabase authentication
    const result = await signIn(formData.email, formData.password);
    
    setIsLoading(false);
    
    if (!result.error) {
      navigate('/');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen flex flex-col bg-background scanline">
      <Header />
      <main className="flex-1 flex items-center justify-center px-4 pt-32 pb-16 relative overflow-hidden">
        {/* Background Grid */}
        <div className="absolute inset-0 cyber-grid" style={{ zIndex: 1 }} />

        {/* Background Effects */}
        <div className="absolute inset-0 cyber-grid opacity-30" style={{ zIndex: 1 }} />
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-float" style={{ zIndex: 2 }} />
        <div className="absolute bottom-1/4 left-1/4 w-64 h-64 bg-secondary/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s', zIndex: 2 }} />

        <div className="relative z-10 w-full max-w-md">
          <div className="glass-panel neon-border rounded-lg p-8 relative" style={{ boxShadow: '0 0 20px rgba(0, 194, 255, 0.5), 0 0 40px rgba(0, 194, 255, 0.3), 0 0 60px rgba(0, 194, 255, 0.15)' }}>
            <h1 className="font-orbitron text-3xl font-bold text-center theme-accent mb-2">
              Access Terminal
            </h1>
            <p className="font-rajdhani text-center theme-text-secondary mb-8">
              Enter your credentials to continue
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
