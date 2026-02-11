# 🚨 URGENT: Apply RLS Migration to Fix Submission Errors

## Current Issue
You're getting **400 Bad Request** errors when trying to:
- Query solved problems from `dsa_submissions`
- Insert new submissions after solving a problem

**Root Cause**: Row Level Security (RLS) policies are not configured for the `dsa_submissions` table.

## ✅ Solution: Apply the RLS Migration

### Step 1: Open Supabase Dashboard
1. Go to your Supabase project: https://supabase.com/dashboard
2. Select your project: `techmaster-nexus`

### Step 2: Open SQL Editor
1. Click on **"SQL Editor"** in the left sidebar
2. Click **"New Query"** button

### Step 3: Copy and Run the Migration
Copy the entire SQL below and paste it into the SQL Editor, then click **"Run"**:

```sql
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
```

### Step 4: Verify Success
After running the SQL, you should see:
- ✅ "Success. No rows returned"
- Or a message indicating policies were created

### Step 5: Test the Fix
1. Go back to your app: http://localhost:5173/dsa/problems
2. Open any problem
3. Write some code and click **"Submit"**
4. You should now see:
   - ✅ No 400 errors in console
   - ✅ Submission saves successfully
   - ✅ Problem appears in "Solved" filter
   - ✅ Redirects back to problems list after 2 seconds

## What This Migration Does

1. **Enables RLS** on `dsa_submissions` table
2. **Allows authenticated users** to INSERT their own submissions (where `user_id` matches their auth ID)
3. **Allows authenticated users** to SELECT their own submissions
4. **Allows public** to SELECT all submissions (for leaderboards, stats)

## Expected Console Output After Fix

Before (with errors):
```
❌ Failed to load resource: 400 (Bad Request)
❌ Submission insert error: Object
```

After (working):
```
✅ Submission saved successfully: [submission data]
🔔 Setting up real-time subscription for user: d3a4bfc6-a8d8-480d-b750-67f39a015f4b
```

## Need Help?

If you see any errors when running the SQL:
1. Check if the table `dsa_submissions` exists
2. Make sure you're logged into the correct Supabase project
3. Share the error message and I'll help debug

---

**Once this migration is applied, your unified authentication system will be fully functional! 🎉**
