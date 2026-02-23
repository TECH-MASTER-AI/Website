import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { User, Session, AuthError } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import { recordLoginStreak } from '@/features/dsa/profile/dsaProfileStore'

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  signUp: (email: string, password: string, username: string) => Promise<{ error: AuthError | null }>
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<{ error: AuthError | null }>
  updateProfile: (data: { username?: string; email?: string }) => Promise<{ error: Error | null }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function SupabaseAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    console.log('🔍 SupabaseAuthContext: Checking for existing session...');
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('🔍 SupabaseAuthContext: Session data:', session);
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
      if (session?.user) {
        console.log('✅ SupabaseAuthContext: User set from session:', session.user.id);
      } else {
        console.log('❌ SupabaseAuthContext: No session found');
      }
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('🔔 SupabaseAuthContext: Auth state changed:', event, session?.user?.id);
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signUp = async (email: string, password: string, username: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username,
          },
          emailRedirectTo: undefined, // Disable email confirmation redirect
        },
      })

      if (error) {
        toast.error(error.message)
        return { error }
      }

      if (data.user) {
        // Create user profile in dsa_users table
        const { error: profileError } = await supabase
          .from('dsa_users')
          .insert({
            id: data.user.id,
            username,
            email,
            rating: 1200,
            problems_solved: 0,
          })

        if (profileError) {
          console.error('Error creating user profile:', profileError)
        }

        // Record login streak for DSA
        recordLoginStreak()

        toast.success('🎉 Account created successfully! You are now logged in.')
      }

      return { error: null }
    } catch (error) {
      const authError = error as AuthError
      toast.error(authError.message)
      return { error: authError }
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        toast.error(error.message)
        return { error }
      }

      // Record login streak for DSA
      recordLoginStreak()
      
      toast.success('Signed in successfully!')
      return { error: null }
    } catch (error) {
      const authError = error as AuthError
      toast.error(authError.message)
      return { error: authError }
    }
  }

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) {
        toast.error(error.message)
      } else {
        toast.success('Signed out successfully!')
      }
    } catch (error) {
      console.error('Error signing out:', error)
      toast.error('Error signing out')
    }
  }

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })

      if (error) {
        toast.error(error.message)
        return { error }
      }

      toast.success('Password reset email sent!')
      return { error: null }
    } catch (error) {
      const authError = error as AuthError
      toast.error(authError.message)
      return { error: authError }
    }
  }

  const updateProfile = async (data: { username?: string; email?: string }) => {
    try {
      if (!user) {
        return { error: new Error('No user logged in') }
      }

      // Update auth user metadata
      const { error: authError } = await supabase.auth.updateUser({
        email: data.email,
        data: {
          username: data.username,
        },
      })

      if (authError) {
        toast.error(authError.message)
        return { error: authError }
      }

      // Update dsa_users table
      const { error: profileError } = await supabase
        .from('dsa_users')
        .update({
          username: data.username,
          email: data.email,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id)

      if (profileError) {
        toast.error(profileError.message)
        return { error: profileError }
      }

      toast.success('Profile updated successfully!')
      return { error: null }
    } catch (error) {
      const err = error as Error
      toast.error(err.message)
      return { error: err }
    }
  }

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    resetPassword,
    updateProfile,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useSupabaseAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useSupabaseAuth must be used within a SupabaseAuthProvider')
  }
  return context
}
