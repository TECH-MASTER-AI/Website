-- Run this in Supabase SQL Editor to reset your rating to Bronze III (900)

-- Update your current user's duel rating to 900 (Bronze III)
UPDATE public.dsa_users 
SET duel_rating = 900 
WHERE id = auth.uid();

-- Verify the update
SELECT id, username, duel_rating, rating 
FROM public.dsa_users 
WHERE id = auth.uid();
