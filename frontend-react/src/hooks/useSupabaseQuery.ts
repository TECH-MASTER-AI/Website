import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase, DsaUser, DsaSubmission, Question } from '@/lib/supabase'
import { toast } from 'sonner'

// Fetch user profile
export function useUserProfile(userId: string | undefined) {
  return useQuery({
    queryKey: ['user-profile', userId],
    queryFn: async () => {
      if (!userId) return null
      const { data, error } = await supabase
        .from('dsa_users')
        .select('*')
        .eq('id', userId)
        .single()
      
      if (error) throw error
      return data as DsaUser
    },
    enabled: !!userId,
  })
}

// Fetch user submissions
export function useUserSubmissions(userId: string | undefined) {
  return useQuery({
    queryKey: ['user-submissions', userId],
    queryFn: async () => {
      if (!userId) return []
      const { data, error } = await supabase
        .from('dsa_submissions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      return data as DsaSubmission[]
    },
    enabled: !!userId,
  })
}

// Fetch leaderboard
export function useLeaderboard(limit = 100) {
  return useQuery({
    queryKey: ['leaderboard', limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('dsa_users')
        .select('id, username, rating, problems_solved')
        .order('rating', { ascending: false })
        .limit(limit)
      
      if (error) throw error
      return data
    },
  })
}

// Fetch questions
export function useQuestions() {
  return useQuery({
    queryKey: ['questions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('questions')
        .select('*')
        .order('id', { ascending: true })
      
      if (error) throw error
      return data as Question[]
    },
  })
}

// Submit solution mutation
export function useSubmitSolution() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (submission: {
      user_id: string
      problem_id: string
      code_snippet: string
      language: string
      status: string
      runtime_ms?: number
      memory_mb?: number
    }) => {
      const { data, error } = await supabase
        .from('dsa_submissions')
        .insert(submission)
        .select()
        .single()
      
      if (error) throw error
      
      // Update user's problems_solved count if accepted
      if (submission.status === 'Accepted') {
        const { error: updateError } = await supabase.rpc('increment_problems_solved', {
          user_id: submission.user_id,
        })
        
        if (updateError) console.error('Error updating problems solved:', updateError)
      }
      
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-submissions'] })
      queryClient.invalidateQueries({ queryKey: ['user-profile'] })
      toast.success('Solution submitted successfully!')
    },
    onError: (error) => {
      console.error('Submission error:', error)
      toast.error('Failed to submit solution')
    },
  })
}

// Update user rating mutation
export function useUpdateRating() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ userId, newRating }: { userId: string; newRating: number }) => {
      const { data, error } = await supabase
        .from('dsa_users')
        .update({ rating: newRating, updated_at: new Date().toISOString() })
        .eq('id', userId)
        .select()
        .single()
      
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-profile'] })
      queryClient.invalidateQueries({ queryKey: ['leaderboard'] })
    },
  })
}
