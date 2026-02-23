import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials not found. Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storage: window.localStorage,
  },
})

// Database types
export interface DsaUser {
  id: string
  username: string
  email: string
  rating: number
  problems_solved: number
  created_at: string
  updated_at: string
}

export interface DsaSubmission {
  id: string
  user_id: string
  problem_id: string
  status: string
  language: string
  runtime_ms: number | null
  memory_mb: number | null
  code_snippet: string
  created_at: string
}

export interface DsaRoom {
  id: string
  room_code: string
  problem_id: string
  player1_id: string | null
  player2_id: string | null
  winner_id: string | null
  status: 'waiting' | 'active' | 'finished'
  created_at: string
  finished_at: string | null
}

export interface Question {
  id: number
  title: string
  slug: string
  description: string
  difficulty: 'Easy' | 'Medium' | 'Hard'
  topics: any
  companies: any
  tags: any
  examples: any
  constraints: any
  test_cases: any
  acceptance_rate: number
  likes: number
  dislikes: number
  is_premium: boolean
  created_at: string
  updated_at: string
}
