-- Check what columns exist in dsa_submissions table
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'dsa_submissions'
ORDER BY ordinal_position;

-- Check what columns exist in dsa_questions table
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'dsa_questions'
ORDER BY ordinal_position;

-- Check what columns exist in dsa_question_stats table (if it exists)
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'dsa_question_stats'
ORDER BY ordinal_position;
