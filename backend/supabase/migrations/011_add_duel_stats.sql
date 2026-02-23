-- Add duel statistics columns to dsa_users table
ALTER TABLE public.dsa_users 
ADD COLUMN IF NOT EXISTS duel_rating INT DEFAULT 1000,
ADD COLUMN IF NOT EXISTS duel_wins INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS duel_losses INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS duel_streak INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS duel_best_streak INT DEFAULT 0;

-- Create index for duel rating
CREATE INDEX IF NOT EXISTS idx_dsa_users_duel_rating ON public.dsa_users(duel_rating DESC);

-- Create duel history table
CREATE TABLE IF NOT EXISTS public.duel_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.dsa_users(id) ON DELETE CASCADE,
  result VARCHAR(10) NOT NULL CHECK (result IN ('win', 'loss')),
  rating_change INT NOT NULL,
  new_rating INT NOT NULL,
  opponent_name VARCHAR(255),
  problem_id VARCHAR(64),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on duel_history
ALTER TABLE public.duel_history ENABLE ROW LEVEL SECURITY;

-- Policies for duel_history
CREATE POLICY "Users can view own duel history"
  ON public.duel_history FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own duel history"
  ON public.duel_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Index for duel history
CREATE INDEX IF NOT EXISTS idx_duel_history_user_id ON public.duel_history(user_id);
CREATE INDEX IF NOT EXISTS idx_duel_history_created_at ON public.duel_history(created_at DESC);
