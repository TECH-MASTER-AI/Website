-- =====================================================
-- REAL-TIME SUCCESS RATE SETUP
-- Run this in Supabase SQL Editor
-- =====================================================

-- Step 1: Check if dsa_question_stats table exists, if not create it
CREATE TABLE IF NOT EXISTS public.dsa_question_stats (
    id SERIAL PRIMARY KEY,
    question_id INTEGER UNIQUE NOT NULL REFERENCES public.dsa_questions(id),
    slug VARCHAR(255) UNIQUE NOT NULL,
    total_submissions INTEGER DEFAULT 0,
    accepted_submissions INTEGER DEFAULT 0,
    acceptance_rate DECIMAL(5,2) DEFAULT 0.0,
    total_attempts INTEGER DEFAULT 0,
    successful_attempts INTEGER DEFAULT 0,
    average_execution_time INTEGER DEFAULT 0,
    average_memory_usage INTEGER DEFAULT 0,
    difficulty_rating DECIMAL(3,2) DEFAULT 0.0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 2: Add new columns if they don't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='dsa_question_stats' AND column_name='total_attempts') THEN
        ALTER TABLE public.dsa_question_stats ADD COLUMN total_attempts INTEGER DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='dsa_question_stats' AND column_name='successful_attempts') THEN
        ALTER TABLE public.dsa_question_stats ADD COLUMN successful_attempts INTEGER DEFAULT 0;
    END IF;
END $$;

-- Step 3: Create or replace the trigger function
CREATE OR REPLACE FUNCTION update_question_success_rate()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert or update the question stats when a new submission is added
  INSERT INTO public.dsa_question_stats (
    question_id, 
    slug, 
    total_submissions, 
    accepted_submissions, 
    acceptance_rate,
    total_attempts,
    successful_attempts
  )
  VALUES (
    NEW.question_id, 
    NEW.slug, 
    1, 
    CASE WHEN NEW.status = 'accepted' THEN 1 ELSE 0 END,
    CASE WHEN NEW.status = 'accepted' THEN 100.0 ELSE 0.0 END,
    1,
    CASE WHEN NEW.status = 'accepted' THEN 1 ELSE 0 END
  )
  ON CONFLICT (question_id) 
  DO UPDATE SET
    total_submissions = dsa_question_stats.total_submissions + 1,
    accepted_submissions = dsa_question_stats.accepted_submissions + CASE WHEN NEW.status = 'accepted' THEN 1 ELSE 0 END,
    total_attempts = COALESCE(dsa_question_stats.total_attempts, 0) + 1,
    successful_attempts = COALESCE(dsa_question_stats.successful_attempts, 0) + CASE WHEN NEW.status = 'accepted' THEN 1 ELSE 0 END,
    acceptance_rate = ROUND(
      (dsa_question_stats.accepted_submissions + CASE WHEN NEW.status = 'accepted' THEN 1 ELSE 0 END)::DECIMAL 
      / (dsa_question_stats.total_submissions + 1)::DECIMAL * 100, 
      2
    );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 4: Drop old trigger if exists and create new one
DROP TRIGGER IF EXISTS trigger_update_question_stats ON public.dsa_submissions;
DROP TRIGGER IF EXISTS trigger_update_success_rate ON public.dsa_submissions;

CREATE TRIGGER trigger_update_question_stats
  AFTER INSERT ON public.dsa_submissions
  FOR EACH ROW
  EXECUTE FUNCTION update_question_success_rate();

-- Step 5: Initialize stats for all existing questions
INSERT INTO public.dsa_question_stats (question_id, slug, total_submissions, accepted_submissions, acceptance_rate, total_attempts, successful_attempts)
SELECT 
  q.id,
  q.slug,
  COALESCE(COUNT(s.id), 0) as total_submissions,
  COALESCE(SUM(CASE WHEN s.status = 'accepted' THEN 1 ELSE 0 END), 0) as accepted_submissions,
  CASE 
    WHEN COUNT(s.id) > 0 THEN 
      ROUND((SUM(CASE WHEN s.status = 'accepted' THEN 1 ELSE 0 END)::DECIMAL / COUNT(s.id)::DECIMAL) * 100, 2)
    ELSE 0.0
  END as acceptance_rate,
  COALESCE(COUNT(s.id), 0) as total_attempts,
  COALESCE(SUM(CASE WHEN s.status = 'accepted' THEN 1 ELSE 0 END), 0) as successful_attempts
FROM public.dsa_questions q
LEFT JOIN public.dsa_submissions s ON q.id = s.question_id
GROUP BY q.id, q.slug
ON CONFLICT (question_id) 
DO UPDATE SET
  total_submissions = EXCLUDED.total_submissions,
  accepted_submissions = EXCLUDED.accepted_submissions,
  acceptance_rate = EXCLUDED.acceptance_rate,
  total_attempts = EXCLUDED.total_attempts,
  successful_attempts = EXCLUDED.successful_attempts;

-- Step 6: Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_dsa_question_stats_acceptance_rate ON public.dsa_question_stats(acceptance_rate DESC);
CREATE INDEX IF NOT EXISTS idx_dsa_question_stats_question_id ON public.dsa_question_stats(question_id);
CREATE INDEX IF NOT EXISTS idx_dsa_submissions_question_status ON public.dsa_submissions(question_id, status);

-- Step 7: Verify the setup
SELECT 
  'Total Questions' as metric,
  COUNT(*) as count
FROM public.dsa_questions
UNION ALL
SELECT 
  'Questions with Stats' as metric,
  COUNT(*) as count
FROM public.dsa_question_stats
UNION ALL
SELECT 
  'Total Submissions' as metric,
  COUNT(*) as count
FROM public.dsa_submissions;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Real-time success rate tracking is now active!';
  RAISE NOTICE '📊 All questions have been initialized with current stats';
  RAISE NOTICE '🔄 New submissions will automatically update success rates';
END $$;
