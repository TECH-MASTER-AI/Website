-- Comments and Discussions Schema for Regular PostgreSQL
-- This allows users to comment on problems and reply to each other

-- Create comments table
CREATE TABLE IF NOT EXISTS problem_comments (
    id SERIAL PRIMARY KEY,
    problem_slug TEXT NOT NULL,
    user_id TEXT NOT NULL,
    username TEXT NOT NULL,
    user_avatar TEXT,
    content TEXT NOT NULL,
    parent_comment_id INTEGER REFERENCES problem_comments(id) ON DELETE CASCADE,
    likes INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create comment likes table
CREATE TABLE IF NOT EXISTS comment_likes (
    id SERIAL PRIMARY KEY,
    comment_id INTEGER REFERENCES problem_comments(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(comment_id, user_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_comments_problem ON problem_comments(problem_slug);
CREATE INDEX IF NOT EXISTS idx_comments_user ON problem_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_comments_parent ON problem_comments(parent_comment_id);
CREATE INDEX IF NOT EXISTS idx_comments_created ON problem_comments(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_comment_likes_comment ON comment_likes(comment_id);
CREATE INDEX IF NOT EXISTS idx_comment_likes_user ON comment_likes(user_id);

-- Function to update comment likes count
CREATE OR REPLACE FUNCTION update_comment_likes()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE problem_comments 
        SET likes = likes + 1 
        WHERE id = NEW.comment_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE problem_comments 
        SET likes = likes - 1 
        WHERE id = OLD.comment_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update likes count
DROP TRIGGER IF EXISTS update_comment_likes_trigger ON comment_likes;
CREATE TRIGGER update_comment_likes_trigger
AFTER INSERT OR DELETE ON comment_likes
FOR EACH ROW EXECUTE FUNCTION update_comment_likes();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at on comment updates
DROP TRIGGER IF EXISTS update_comment_updated_at ON problem_comments;
CREATE TRIGGER update_comment_updated_at
BEFORE UPDATE ON problem_comments
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
