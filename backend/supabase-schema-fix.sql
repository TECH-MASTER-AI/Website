-- Run this SQL in Supabase SQL Editor to fix the dsa_questions table
-- This will add missing columns and fix the id column

-- Add missing columns
ALTER TABLE dsa_questions ADD COLUMN IF NOT EXISTS acceptance_rate NUMERIC(5, 2) DEFAULT 0;
ALTER TABLE dsa_questions ADD COLUMN IF NOT EXISTS likes INT DEFAULT 0;
ALTER TABLE dsa_questions ADD COLUMN IF NOT EXISTS dislikes INT DEFAULT 0;
ALTER TABLE dsa_questions ADD COLUMN IF NOT EXISTS is_premium BOOLEAN DEFAULT false;
ALTER TABLE dsa_questions ADD COLUMN IF NOT EXISTS test_cases JSONB;
ALTER TABLE dsa_questions ADD COLUMN IF NOT EXISTS companies JSONB;
ALTER TABLE dsa_questions ADD COLUMN IF NOT EXISTS tags JSONB;

-- Fix the id column to be auto-increment
-- First drop the existing id column and recreate it as SERIAL
ALTER TABLE dsa_questions DROP COLUMN IF EXISTS id;
ALTER TABLE dsa_questions ADD COLUMN id SERIAL PRIMARY KEY;

-- Verify the table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'dsa_questions'
ORDER BY ordinal_position;
