-- Add tags column to dsa_questions table
ALTER TABLE dsa_questions ADD COLUMN IF NOT EXISTS tags TEXT;

-- Add comment
COMMENT ON COLUMN dsa_questions.tags IS 'Comma-separated list of searchable tags for the question';
