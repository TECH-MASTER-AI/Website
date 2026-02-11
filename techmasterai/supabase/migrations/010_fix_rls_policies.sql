-- Fix RLS policies for dsa_submissions table
-- Allow authenticated users to insert their own submissions

-- Enable RLS on dsa_submissions if not already enabled
ALTER TABLE dsa_submissions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can insert their own submissions" ON dsa_submissions;
DROP POLICY IF EXISTS "Users can view their own submissions" ON dsa_submissions;
DROP POLICY IF EXISTS "Users can view all submissions" ON dsa_submissions;

-- Allow users to insert their own submissions
CREATE POLICY "Users can insert their own submissions"
ON dsa_submissions
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Allow users to view their own submissions
CREATE POLICY "Users can view their own submissions"
ON dsa_submissions
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Allow public read access to submissions (for leaderboard, stats, etc.)
CREATE POLICY "Public can view all submissions"
ON dsa_submissions
FOR SELECT
TO public
USING (true);
