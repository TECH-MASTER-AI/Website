-- Update default duel rating to 900 (Bronze III)
ALTER TABLE public.dsa_users 
ALTER COLUMN duel_rating SET DEFAULT 900;

-- Update existing users with 1000 rating to 900 (Bronze III)
UPDATE public.dsa_users 
SET duel_rating = 900 
WHERE duel_rating = 1000;
