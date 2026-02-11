-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- DSA users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.dsa_users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username VARCHAR(64) NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL UNIQUE,
  rating INT DEFAULT 1200,
  problems_solved INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.dsa_users ENABLE ROW LEVEL SECURITY;

-- Policies for dsa_users
CREATE POLICY "Users can view all profiles"
  ON public.dsa_users FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON public.dsa_users FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.dsa_users FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_dsa_users_rating ON public.dsa_users(rating DESC);
CREATE INDEX IF NOT EXISTS idx_dsa_users_email ON public.dsa_users(email);
CREATE INDEX IF NOT EXISTS idx_dsa_users_username ON public.dsa_users(username);

-- Submissions table
CREATE TABLE IF NOT EXISTS public.dsa_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.dsa_users(id) ON DELETE CASCADE,
  problem_id VARCHAR(64) NOT NULL,
  status VARCHAR(32) NOT NULL,
  language VARCHAR(32),
  runtime_ms INT,
  memory_mb NUMERIC(10,2),
  code_snippet TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.dsa_submissions ENABLE ROW LEVEL SECURITY;

-- Policies for submissions
CREATE POLICY "Users can view own submissions"
  ON public.dsa_submissions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own submissions"
  ON public.dsa_submissions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_dsa_submissions_user ON public.dsa_submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_dsa_submissions_created ON public.dsa_submissions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_dsa_submissions_problem ON public.dsa_submissions(problem_id);

-- Duels/Rooms table
CREATE TABLE IF NOT EXISTS public.dsa_rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_code VARCHAR(32) NOT NULL UNIQUE,
  problem_id VARCHAR(64) NOT NULL,
  player1_id UUID REFERENCES public.dsa_users(id),
  player2_id UUID REFERENCES public.dsa_users(id),
  winner_id UUID REFERENCES public.dsa_users(id),
  status VARCHAR(32) DEFAULT 'waiting',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  finished_at TIMESTAMPTZ
);

-- Enable RLS
ALTER TABLE public.dsa_rooms ENABLE ROW LEVEL SECURITY;

-- Policies for rooms
CREATE POLICY "Users can view rooms they're in"
  ON public.dsa_rooms FOR SELECT
  USING (auth.uid() = player1_id OR auth.uid() = player2_id OR status = 'waiting');

CREATE POLICY "Users can create rooms"
  ON public.dsa_rooms FOR INSERT
  WITH CHECK (auth.uid() = player1_id);

CREATE POLICY "Users can update rooms they're in"
  ON public.dsa_rooms FOR UPDATE
  USING (auth.uid() = player1_id OR auth.uid() = player2_id);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_dsa_rooms_code ON public.dsa_rooms(room_code);
CREATE INDEX IF NOT EXISTS idx_dsa_rooms_status ON public.dsa_rooms(status);

-- Questions table
CREATE TABLE IF NOT EXISTS public.questions (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL UNIQUE,
  slug VARCHAR(255) NOT NULL UNIQUE,
  description TEXT NOT NULL,
  difficulty VARCHAR(16) NOT NULL CHECK (difficulty IN ('Easy', 'Medium', 'Hard')),
  topics JSONB,
  companies JSONB,
  tags JSONB,
  examples JSONB,
  constraints JSONB,
  test_cases JSONB,
  acceptance_rate NUMERIC(5, 2) DEFAULT 0,
  likes INT DEFAULT 0,
  dislikes INT DEFAULT 0,
  is_premium BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;

-- Policies for questions (public read)
CREATE POLICY "Anyone can view questions"
  ON public.questions FOR SELECT
  USING (true);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_questions_difficulty ON public.questions(difficulty);
CREATE INDEX IF NOT EXISTS idx_questions_slug ON public.questions(slug);
CREATE INDEX IF NOT EXISTS idx_questions_premium ON public.questions(is_premium);

-- Function to increment problems solved
CREATE OR REPLACE FUNCTION public.increment_problems_solved(user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.dsa_users
  SET problems_solved = problems_solved + 1,
      updated_at = NOW()
  WHERE id = user_id;
END;
$$;

-- Function to update user rating
CREATE OR REPLACE FUNCTION public.update_user_rating(user_id UUID, rating_change INT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.dsa_users
  SET rating = rating + rating_change,
      updated_at = NOW()
  WHERE id = user_id;
END;
$$;

-- Trigger to automatically create dsa_users entry when auth.users is created
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.dsa_users (id, username, email, rating, problems_solved)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    NEW.email,
    1200,
    0
  );
  RETURN NEW;
END;
$$;

-- Create trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
