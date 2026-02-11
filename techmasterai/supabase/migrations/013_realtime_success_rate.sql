-- Real-time Success Rate Tracking System
-- This migration updates the existing dsa_question_stats table for real-time success rates

-- Step 1: Ensure dsa_question_stats has all needed columns
ALTER TABLE public.dsa_question_stats 
ADD COLUMN IF NOT EXISTS total_attempts INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS successful_attempts INT DEFAULT 0;

-- Note: acceptance_rate already exists in dsa_question_stats

-- Step 2: Create function to update success rate (using existing table structure)
CREATE OR REPLACE FUNCTION update_question_success_rate()
RETURNS TRIGGER AS $$
BEGIN
  -- Only update if the submission is for a question (not null)
  IF NEW.question_id IS NOT NULL THEN
    -- Insert or update the question stats
    INSERT INTO public.dsa_question_stats (question_id, slug, total_submissions, accepted_submissions, acceptance_rate)
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
      ),
      total_attempts = COALESCE(dsa_question_stats.total_attempts, 0) + 1,
      successful_attempts = COALESCE(dsa_question_stats.successful_attempts, 0) + CASE WHEN NEW.status = 'accepted' THEN 1 ELSE 0 END;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 3: Drop old trigger if exists and create new one
DROP TRIGGER IF EXISTS trigger_update_question_stats ON public.dsa_submissions;
DROP TRIGGER IF EXISTS trigger_update_success_rate ON public.dsa_submissions;

CREATE TRIGGER trigger_update_question_stats
  AFTER INSERT ON public.dsa_submissions
  FOR EACH ROW
  EXECUTE FUNCTION update_question_success_rate();

-- Step 4: Initialize success rates for existing questions based on current submissions
UPDATE public.dsa_question_stats qs
SET 
  total_attempts = COALESCE(
    (SELECT COUNT(*) FROM public.dsa_submissions WHERE question_id = qs.question_id),
    0
  ),
  successful_attempts = COALESCE(
    (SELECT COUNT(*) FROM public.dsa_submissions WHERE question_id = qs.question_id AND status = 'accepted'),
    0
  ),
  total_submissions = COALESCE(
    (SELECT COUNT(*) FROM public.dsa_submissions WHERE question_id = qs.question_id),
    qs.total_submissions
  ),
  accepted_submissions = COALESCE(
    (SELECT COUNT(*) FROM public.dsa_submissions WHERE question_id = qs.question_id AND status = 'accepted'),
    qs.accepted_submissions
  ),
  acceptance_rate = CASE 
    WHEN COALESCE((SELECT COUNT(*) FROM public.dsa_submissions WHERE question_id = qs.question_id), 0) > 0 THEN
      ROUND(
        COALESCE((SELECT COUNT(*) FROM public.dsa_submissions WHERE question_id = qs.question_id AND status = 'accepted'), 0)::DECIMAL 
        / COALESCE((SELECT COUNT(*) FROM public.dsa_submissions WHERE question_id = qs.question_id), 1)::DECIMAL * 100,
        2
      )
    ELSE COALESCE(qs.acceptance_rate, 0.0)
  END;

-- Step 5: Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_dsa_question_stats_acceptance_rate ON public.dsa_question_stats(acceptance_rate DESC);
CREATE INDEX IF NOT EXISTS idx_dsa_submissions_question_status ON public.dsa_submissions(question_id, status);

-- Step 6: Add comments for documentation
COMMENT ON COLUMN public.dsa_question_stats.total_attempts IS 'Total number of submission attempts for this question';
COMMENT ON COLUMN public.dsa_question_stats.successful_attempts IS 'Number of successful (accepted) submissions';
COMMENT ON COLUMN public.dsa_question_stats.acceptance_rate IS 'Success rate percentage (0-100)';
COMMENT ON FUNCTION update_question_success_rate() IS 'Automatically updates question success rate when new submissions are added';

