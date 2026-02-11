import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { recordLoginStreak } from "@/features/dsa/profile/dsaProfileStore";
import { supabase } from "@/lib/supabase";

export interface DsaUser {
  id: string;
  username: string;
  email: string;
  rating?: number;
  problemsSolved?: number;
}

interface DsaAuthContextType {
  user: DsaUser | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (username: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const DsaAuthContext = createContext<DsaAuthContextType | undefined>(undefined);

export function DsaAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<DsaUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing Supabase session on mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        console.log('🔍 DsaAuthContext: Checking for existing session...');
        const { data: { session } } = await supabase.auth.getSession();
        console.log('🔍 DsaAuthContext: Session data:', session);
        
        if (session?.user) {
          const dsaUser: DsaUser = {
            id: session.user.id,
            username: session.user.email?.split('@')[0] || 'user',
            email: session.user.email || '',
            rating: 1200,
            problemsSolved: 0,
          };
          console.log('✅ DsaAuthContext: User set from session:', dsaUser);
          setUser(dsaUser);
          setToken(session.access_token);
        } else {
          console.log('❌ DsaAuthContext: No session found');
        }
      } catch (error) {
        console.error('❌ DsaAuthContext: Session check error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('🔔 DsaAuthContext: Auth state changed:', event, session?.user?.id);
      if (session?.user) {
        const dsaUser: DsaUser = {
          id: session.user.id,
          username: session.user.email?.split('@')[0] || 'user',
          email: session.user.email || '',
          rating: 1200,
          problemsSolved: 0,
        };
        console.log('✅ DsaAuthContext: User set from auth change:', dsaUser);
        setUser(dsaUser);
        setToken(session.access_token);
      } else {
        console.log('❌ DsaAuthContext: User cleared from auth change');
        setUser(null);
        setToken(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    if (!email.trim() || !password) {
      return { success: false, error: "Email and password required" };
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (data.user) {
        const dsaUser: DsaUser = {
          id: data.user.id,
          username: data.user.email?.split('@')[0] || 'user',
          email: data.user.email || '',
          rating: 1200,
          problemsSolved: 0,
        };
        setUser(dsaUser);
        setToken(data.session?.access_token || null);
        recordLoginStreak();
        return { success: true };
      }

      return { success: false, error: 'Login failed' };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'An error occurred during login' };
    }
  }, []);

  const register = useCallback(async (username: string, email: string, password: string) => {
    if (!username.trim() || !email.trim() || !password) {
      return { success: false, error: "All fields required" };
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password: password,
        options: {
          data: {
            username: username.trim(),
          },
        },
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (data.user) {
        // Check if email confirmation is required
        if (data.user.identities && data.user.identities.length === 0) {
          return { 
            success: false, 
            error: 'This email is already registered. Please login instead.' 
          };
        }

        const dsaUser: DsaUser = {
          id: data.user.id,
          username: username.trim(),
          email: data.user.email || '',
          rating: 1200,
          problemsSolved: 0,
        };
        setUser(dsaUser);
        setToken(data.session?.access_token || null);
        recordLoginStreak();
        return { success: true };
      }

      return { success: false, error: 'Registration failed' };
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, error: 'An error occurred during registration' };
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await supabase.auth.signOut();
      setToken(null);
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  }, []);

  return (
    <DsaAuthContext.Provider
      value={{ user, token, isLoading, login, register, logout }}
    >
      {children}
    </DsaAuthContext.Provider>
  );
}

export function useDsaAuth() {
  const ctx = useContext(DsaAuthContext);
  if (ctx === undefined) {
    throw new Error("useDsaAuth must be used within DsaAuthProvider");
  }
  return ctx;
}
