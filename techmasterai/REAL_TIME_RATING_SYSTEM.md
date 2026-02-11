# Real-Time Rating System with Supabase

## Overview
Migrated duel rating system from localStorage to Supabase database for real-time synchronization across all devices and users.

## Changes Made

### 1. Database Migration (`011_add_duel_stats.sql`)
Added new columns to `dsa_users` table:
- `duel_rating` (INT, default 1000) - Separate rating for duels
- `duel_wins` (INT, default 0) - Total duel wins
- `duel_losses` (INT, default 0) - Total duel losses
- `duel_streak` (INT, default 0) - Current win/loss streak
- `duel_best_streak` (INT, default 0) - Best win streak ever

Created new `duel_history` table:
- Stores complete history of all duels
- Tracks rating changes, opponents, results
- RLS enabled for security

### 2. Updated `duelRating.ts`
**Before:** Used localStorage (device-specific)
**After:** Uses Supabase (synced across devices)

Key changes:
- `getDuelRating()` - Now async, fetches from Supabase
- `addDuelWin()` - Updates database + adds history entry
- `addDuelLoss()` - Updates database + adds history entry
- `getDuelStats()` - Fetches stats from database
- `getCombinedRating()` - Now async, uses database

### 3. Real-Time Benefits
✅ Rating syncs across all devices instantly
✅ Win/loss records persist forever
✅ Complete duel history available
✅ Leaderboard shows real-time rankings
✅ No data loss on browser clear/device change

## How to Apply Migration

### Option 1: Supabase CLI (Recommended)
```bash
cd techmaster-nexus-main
supabase db push
```

### Option 2: Supabase Dashboard
1. Go to Supabase Dashboard → SQL Editor
2. Copy content from `supabase/migrations/011_add_duel_stats.sql`
3. Paste and run the SQL

### Option 3: Manual SQL
Run this SQL in your Supabase database:

```sql
-- Add duel statistics columns
ALTER TABLE public.dsa_users 
ADD COLUMN IF NOT EXISTS duel_rating INT DEFAULT 1000,
ADD COLUMN IF NOT EXISTS duel_wins INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS duel_losses INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS duel_streak INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS duel_best_streak INT DEFAULT 0;

-- Create index
CREATE INDEX IF NOT EXISTS idx_dsa_users_duel_rating ON public.dsa_users(duel_rating DESC);

-- Create duel history table
CREATE TABLE IF NOT EXISTS public.duel_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.dsa_users(id) ON DELETE CASCADE,
  result VARCHAR(10) NOT NULL CHECK (result IN ('win', 'loss')),
  rating_change INT NOT NULL,
  new_rating INT NOT NULL,
  opponent_name VARCHAR(255),
  problem_id VARCHAR(64),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.duel_history ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own duel history"
  ON public.duel_history FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own duel history"
  ON public.duel_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_duel_history_user_id ON public.duel_history(user_id);
CREATE INDEX IF NOT EXISTS idx_duel_history_created_at ON public.duel_history(created_at DESC);
```

## Testing

1. **Test Rating Update:**
   - Leave a duel → Rating should decrease by 5
   - Check on another device → Should show updated rating
   - Win a duel → Rating should increase by 10

2. **Test Real-Time Sync:**
   - Open app on Device A
   - Open app on Device B (same account)
   - Win/lose duel on Device A
   - Refresh Device B → Should show updated rating

3. **Test Leaderboard:**
   - Check leaderboard → Should show real ratings from database
   - All users' ratings should be visible
   - Sorted by rating (highest first)

## Migration Notes

- Existing localStorage data will NOT be migrated automatically
- Users will start fresh with 1000 rating
- To migrate existing data, you'd need a custom script
- All future rating changes will be in Supabase

## Rollback (if needed)

If you need to rollback:
```sql
ALTER TABLE public.dsa_users 
DROP COLUMN IF EXISTS duel_rating,
DROP COLUMN IF EXISTS duel_wins,
DROP COLUMN IF EXISTS duel_losses,
DROP COLUMN IF EXISTS duel_streak,
DROP COLUMN IF EXISTS duel_best_streak;

DROP TABLE IF EXISTS public.duel_history;
```

Then revert `duelRating.ts` to use localStorage version.

## Future Enhancements

- Add real-time subscriptions for live rating updates
- Show rating change animations
- Add rating history graph
- Implement ELO-based rating system
- Add seasonal rankings/resets
