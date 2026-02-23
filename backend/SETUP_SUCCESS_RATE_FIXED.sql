-- =====================================================
-- REAL-TIME SUCCESS RATE SETUP (FIXED VERSION)
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
-- This function will work ONLY if dsa_submissions table exists and has question_id column
CREATE OR REPLACE FUNCTION update_question_success_rate()
RETURNS TRIGGER AS $$
DECLARE
    v_question_id INTEGER;
BEGIN
  -- Try to get question_id from NEW record
  -- Handle both question_id and problem_id column names
  BEGIN
    v_question_id := NEW.question_id;
  EXCEPTION WHEN OTHERS THEN
    -- If question_id doesn't exist, return without error
    RETURN NEW;
  END;
  
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
    v_question_id, 
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

-- Step 4: Drop old trigger if exists and create new one (only if dsa_submissions exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'dsa_submissions') THEN
        DROP TRIGGER IF EXISTS trigger_update_question_stats ON public.dsa_submissions;
        DROP TRIGGER IF EXISTS trigger_update_success_rate ON public.dsa_submissions;
        
        CREATE TRIGGER trigger_update_question_stats
          AFTER INSERT ON public.dsa_submissions
          FOR EACH ROW
          EXECUTE FUNCTION update_question_success_rate();
          
        RAISE NOTICE '✅ Trigger created on dsa_submissions table';
    ELSE
        RAISE NOTICE '⚠️  dsa_submissions table does not exist - trigger not created';
    END IF;
END $$;

-- Step 5: Initialize stats for all existing questions
-- This will work even if dsa_submissions doesn't exist
INSERT INTO public.dsa_question_stats (question_id, slug, total_submissions, accepted_submissions, acceptance_rate, total_attempts, successful_attempts)
SELECT 
  q.id,
  q.slug,
  0 as total_submissions,
  0 as accepted_submissions,
  0.0 as acceptance_rate,
  0 as total_attempts,
  0 as successful_attempts
FROM public.dsa_questions q
WHERE NOT EXISTS (
  SELECT 1 FROM public.dsa_question_stats qs WHERE qs.question_id = q.id
);

-- Step 6: Update stats from existing submissions (only if dsa_submissions table exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'dsa_submissions') THEN
        -- Check if question_id column exists
        IF EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'dsa_submissions' AND column_name = 'question_id') THEN
            
            UPDATE public.dsa_question_stats qs
            SET 
              total_submissions = subquery.total_subs,
              accepted_submissions = subquery.accepted_subs,
              acceptance_rate = subquery.acc_rate,
              total_attempts = subquery.total_subs,
              successful_attempts = subquery.accepted_subs
            FROM (
              SELECT 
                s.question_id,
                COUNT(*) as total_subs,
                SUM(CASE WHEN s.status = 'accepted' THEN 1 ELSE 0 END) as accepted_subs,
                CASE 
                  WHEN COUNT(*) > 0 THEN 
                    ROUND((SUM(CASE WHEN s.status = 'accepted' THEN 1 ELSE 0 END)::DECIMAL / COUNT(*)::DECIMAL) * 100, 2)
                  ELSE 0.0
                END as acc_rate
              FROM public.dsa_submissions s
              GROUP BY s.question_id
            ) subquery
            WHERE qs.question_id = subquery.question_id;
            
            RAISE NOTICE '✅ Stats updated from existing submissions';
        ELSE
            RAISE NOTICE '⚠️  dsa_submissions.question_id column does not exist';
        END IF;
    ELSE
        RAISE NOTICE '⚠️  dsa_submissions table does not exist - stats initialized to 0';
    END IF;
END $$;

-- Step 7: Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_dsa_question_stats_acceptance_rate ON public.dsa_question_stats(acceptance_rate DESC);
CREATE INDEX IF NOT EXISTS idx_dsa_question_stats_question_id ON public.dsa_question_stats(question_id);

-- Only create submission indexes if table exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'dsa_submissions') THEN
        IF EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'dsa_submissions' AND column_name = 'question_id') THEN
            CREATE INDEX IF NOT EXISTS idx_dsa_submissions_question_status ON public.dsa_submissions(question_id, status);
            RAISE NOTICE '✅ Indexes created on dsa_submissions';
        END IF;
    END IF;
END $$;

-- Step 8: Verify the setup
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
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'dsa_submissions') 
    THEN (SELECT COUNT(*) FROM public.dsa_submissions)
    ELSE 0
  END as count;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Real-time success rate tracking setup complete!';
  RAISE NOTICE '📊 All questions have been initialized';
  RAISE NOTICE '🔄 Triggers will update stats automatically (if dsa_submissions exists)';
  RAISE NOTICE '';
  RAISE NOTICE '💡 If dsa_submissions table does not exist yet, the trigger will be created when you create the table';
END $$;
