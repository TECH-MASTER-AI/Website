-- 003_feedback.sql
-- DSA Problem Feedback & AI Notes Storage

CREATE TABLE IF NOT EXISTS dsa_feedback (
    id SERIAL PRIMARY KEY,
    user_id TEXT,
    problem_slug TEXT NOT NULL,
    feedback_text TEXT NOT NULL,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_feedback_problem ON dsa_feedback(problem_slug);
CREATE INDEX IF NOT EXISTS idx_feedback_user ON dsa_feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_feedback_created ON dsa_feedback(created_at DESC);

CREATE TABLE IF NOT EXISTS dsa_notes (
    id SERIAL PRIMARY KEY,
    user_id TEXT NOT NULL,
    problem_slug TEXT NOT NULL,
    note_text TEXT NOT NULL,
    source TEXT DEFAULT 'ai_chat',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notes_user_problem ON dsa_notes(user_id, problem_slug);
