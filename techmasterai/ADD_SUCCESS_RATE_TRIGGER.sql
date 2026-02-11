-- =====================================================
-- ADD REAL-TIME SUCCESS RATE TRIGGER
-- This adds auto-update trigger to existing dsa_question_stats table
-- =====================================================

-- Step 1: Create or replace the trigger function
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

-- Step 2: Drop old trigger if exists and create new one
DROP TRIGGER IF EXISTS trigger_update_question_stats ON public.dsa_submissions;
DROP TRIGGER IF EXISTS trigger_update_success_rate ON public.dsa_submissions;

CREATE TRIGGER trigger_update_question_stats
  AFTER INSERT ON public.dsa_submissions
  FOR EACH ROW
  EXECUTE FUNCTION update_question_success_rate();

-- Step 3: Initialize stats for questions that don't have stats yet
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

-- Step 4: Update stats from existing submissions
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

-- Step 5: Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_dsa_question_stats_acceptance_rate ON public.dsa_question_stats(acceptance_rate DESC);
CREATE INDEX IF NOT EXISTS idx_dsa_submissions_question_status ON public.dsa_submissions(question_id, status);

-- Step 6: Show results
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
FROM public.dsa_submissions
UNION ALL
SELECT 
  'Accepted Submissions' as metric,
  COUNT(*) as count
FROM public.dsa_submissions
WHERE status = 'accepted';

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Real-time success rate tracking is now active!';
  RAISE NOTICE '📊 Stats initialized from existing submissions';
  RAISE NOTICE '🔄 New submissions will automatically update success rates';
END $$;
