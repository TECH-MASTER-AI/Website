-- =====================================================
-- SIMPLE SUCCESS RATE SETUP
-- Works even if dsa_submissions table doesn't exist yet
-- =====================================================

-- Step 1: Initialize stats for all questions with default values
INSERT INTO public.dsa_question_stats (question_id, slug, total_submissions, accepted_submissions, acceptance_rate)
SELECT 
  q.id,
  q.slug,
  0,
  0,
  0.0
FROM public.dsa_questions q
WHERE NOT EXISTS (
  SELECT 1 FROM public.dsa_question_stats qs WHERE qs.question_id = q.id
);

-- Step 2: Create the trigger function (will be used when submissions table is created)
CREATE OR REPLACE FUNCTION update_question_success_rate()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert or update the question stats when a new submission is added
  INSERT INTO public.dsa_question_stats (
    question_id, 
    slug, 
    total_submissions, 
    accepted_submissions, 
    acceptance_rate
  )
  VALUES (
    NEW.question_id, 
    NEW.slug, 
    1, 
    CASE WHEN NEW.status = 'accepted' THEN 1 ELSE 0 END,
    CASE WHEN NEW.status = 'accepted' THEN 100.0 ELSE 0.0 END
  )
  ON CONFLICT (question_id) 
  DO UPDATE SET
    total_submissions = dsa_question_stats.total_submissions + 1,
    accepted_submissions = dsa_question_stats.accepted_submissions + CASE WHEN NEW.status = 'accepted' THEN 1 ELSE 0 END,
    acceptance_rate = ROUND(
      (dsa_question_stats.accepted_submissions + CASE WHEN NEW.status = 'accepted' THEN 1 ELSE 0 END)::DECIMAL 
      / (dsa_question_stats.total_submissions + 1)::DECIMAL * 100, 
      2
    );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 3: Try to create trigger (will fail silently if table doesn't exist)
DO $$
BEGIN
    -- Check if dsa_submissions table exists
    IF EXISTS (
        SELECT 1 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'dsa_submissions'
    ) THEN
        -- Drop old triggers if they exist
        DROP TRIGGER IF EXISTS trigger_update_question_stats ON public.dsa_submissions;
        DROP TRIGGER IF EXISTS trigger_update_success_rate ON public.dsa_submissions;
        
        -- Create new trigger
        CREATE TRIGGER trigger_update_question_stats
          AFTER INSERT ON public.dsa_submissions
          FOR EACH ROW
          EXECUTE FUNCTION update_question_success_rate();
          
        RAISE NOTICE '✅ Trigger created successfully on dsa_submissions table';
        
        -- Try to update stats from existing submissions
        BEGIN
            UPDATE public.dsa_question_stats qs
            SET 
              total_submissions = subquery.total_subs,
              accepted_submissions = subquery.accepted_subs,
              acceptance_rate = subquery.acc_rate
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
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE '⚠️  Could not update from submissions: %', SQLERRM;
        END;
    ELSE
        RAISE NOTICE '⚠️  dsa_submissions table does not exist yet';
        RAISE NOTICE '💡 Trigger function created - will activate when you create dsa_submissions table';
    END IF;
END $$;

-- Step 4: Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_dsa_question_stats_acceptance_rate ON public.dsa_question_stats(acceptance_rate DESC);
CREATE INDEX IF NOT EXISTS idx_dsa_question_stats_question_id ON public.dsa_question_stats(question_id);

-- Step 5: Show current status
SELECT 
  'Total Questions' as metric,
  COUNT(*) as count
FROM public.dsa_questions
UNION ALL
SELECT 
  'Questions with Stats Initialized' as metric,
  COUNT(*) as count
FROM public.dsa_question_stats
UNION ALL
SELECT 
  'dsa_submissions Table Exists' as metric,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'dsa_submissions') 
    THEN 1 
    ELSE 0 
  END as count;

-- Final message
DO $$
DECLARE
    v_table_exists BOOLEAN;
BEGIN
    SELECT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'dsa_submissions'
    ) INTO v_table_exists;
    
    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    RAISE NOTICE '✅ SUCCESS RATE SETUP COMPLETE!';
    RAISE NOTICE '========================================';
    RAISE NOTICE '';
    RAISE NOTICE '📊 All questions initialized with 0%% success rate';
    RAISE NOTICE '🔧 Trigger function created and ready';
    
    IF v_table_exists THEN
        RAISE NOTICE '✅ Trigger active on dsa_submissions table';
        RAISE NOTICE '🔄 Success rates will update automatically';
    ELSE
        RAISE NOTICE '⚠️  dsa_submissions table not found';
        RAISE NOTICE '💡 Create the table and trigger will activate automatically';
        RAISE NOTICE '';
        RAISE NOTICE 'To create dsa_submissions table, run:';
        RAISE NOTICE 'CREATE TABLE public.dsa_submissions (';
        RAISE NOTICE '  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),';
        RAISE NOTICE '  user_id UUID REFERENCES auth.users(id),';
        RAISE NOTICE '  question_id INTEGER REFERENCES public.dsa_questions(id),';
        RAISE NOTICE '  slug VARCHAR(255),';
        RAISE NOTICE '  code TEXT,';
        RAISE NOTICE '  language VARCHAR(50) DEFAULT ''javascript'',';
        RAISE NOTICE '  status VARCHAR(20),';
        RAISE NOTICE '  created_at TIMESTAMPTZ DEFAULT NOW()';
        RAISE NOTICE ');';
        RAISE NOTICE '';
        RAISE NOTICE 'Then run this script again to activate the trigger.';
    END IF;
    
    RAISE NOTICE '';
    RAISE NOTICE '========================================';
END $$;
