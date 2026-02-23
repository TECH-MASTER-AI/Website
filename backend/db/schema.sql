-- TechMaster DSA / app schema
-- Run once to create tables (e.g. node backend/db/init.js or psql -f backend/db/schema.sql)

-- Needed for gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- DSA users (for 1v1, leaderboard, profile)
CREATE TABLE IF NOT EXISTS dsa_users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username      VARCHAR(64) NOT NULL UNIQUE,
  email         VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255),
  rating        INT DEFAULT 1200,
  problems_solved INT DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_dsa_users_rating ON dsa_users(rating DESC);
CREATE INDEX IF NOT EXISTS idx_dsa_users_email ON dsa_users(email);

-- Submissions (problem attempts)
CREATE TABLE IF NOT EXISTS dsa_submissions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES dsa_users(id) ON DELETE CASCADE,
  problem_id  VARCHAR(64) NOT NULL,
  status      VARCHAR(32) NOT NULL, -- e.g. 'Accepted', 'Wrong Answer', 'TLE'
  language    VARCHAR(32),
  runtime_ms  INT,
  memory_mb   NUMERIC(10,2),
  code_snippet TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_dsa_submissions_user ON dsa_submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_dsa_submissions_created ON dsa_submissions(created_at DESC);

-- Duels / rooms (optional: for 1v1 room state)
CREATE TABLE IF NOT EXISTS dsa_rooms (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_code   VARCHAR(32) NOT NULL UNIQUE,
  problem_id  VARCHAR(64) NOT NULL,
  player1_id  UUID REFERENCES dsa_users(id),
  player2_id  UUID REFERENCES dsa_users(id),
  winner_id   UUID REFERENCES dsa_users(id),
  status      VARCHAR(32) DEFAULT 'waiting', -- waiting, active, finished
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  finished_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_dsa_rooms_code ON dsa_rooms(room_code);

-- DSA Questions (for practice)
CREATE TABLE IF NOT EXISTS questions (
  id              SERIAL PRIMARY KEY,
  title           VARCHAR(255) NOT NULL UNIQUE,
  slug            VARCHAR(255) NOT NULL UNIQUE,
  description     TEXT NOT NULL,
  difficulty      VARCHAR(16) NOT NULL CHECK (difficulty IN ('Easy', 'Medium', 'Hard')),
  topics          JSONB,
  companies       JSONB,
  tags            JSONB,
  examples        JSONB,
  constraints     JSONB,
  test_cases      JSONB,
  acceptance_rate NUMERIC(5, 2) DEFAULT 0,
  likes           INT DEFAULT 0,
  dislikes        INT DEFAULT 0,
  is_premium      BOOLEAN DEFAULT false,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_questions_difficulty ON questions(difficulty);
CREATE INDEX IF NOT EXISTS idx_questions_slug ON questions(slug);

-- DSA problem feedback (user feedback + optional rating)
CREATE TABLE IF NOT EXISTS dsa_feedback (
  id            SERIAL PRIMARY KEY,
  user_id       TEXT,
  problem_slug  TEXT NOT NULL,
  feedback_text TEXT NOT NULL,
  rating        INT CHECK (rating >= 1 AND rating <= 5),
  created_at    TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_feedback_problem ON dsa_feedback(problem_slug);
CREATE INDEX IF NOT EXISTS idx_feedback_user ON dsa_feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_feedback_created ON dsa_feedback(created_at DESC);

-- DSA AI notes (saved from AI chat, per user per problem)
CREATE TABLE IF NOT EXISTS dsa_notes (
  id            SERIAL PRIMARY KEY,
  user_id       TEXT NOT NULL,
  problem_slug  TEXT NOT NULL,
  note_text     TEXT NOT NULL,
  source        TEXT DEFAULT 'ai_chat',
  created_at    TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_notes_user_problem ON dsa_notes(user_id, problem_slug);
