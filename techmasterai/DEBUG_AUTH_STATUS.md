# Debug: Authentication Status Check

## Current Issue
Console shows:
```
❌ No user for real-time subscription
❌ No user logged in
💾 Attempting to save submission for user: undefined
```

## Possible Causes

### 1. Not Actually Logged In
**Most Likely Cause:** You may not be logged in to the DSA section.

**Solution:**
1. Navigate to `/dsa/login`
2. Log in with your credentials
3. OR register a new account at `/dsa/register`

### 2. Session Expired
Your Supabase session may have expired.

**Solution:**
1. Log out: Navigate to DSA section and click logout
2. Log back in

### 3. Browser Cache Issue
Old authentication state may be cached.

**Solution:**
1. Clear browser cache (Ctrl+Shift+Delete)
2. Hard refresh (Ctrl+Shift+R)
3. Log in again

## How to Check Auth Status

### Method 1: Check Console Logs
After our changes, you should see these logs when the app loads:

**If logged in:**
```
🔍 DsaAuthContext: Checking for existing session...
🔍 DsaAuthContext: Session data: { user: { id: "...", email: "..." }, ... }
✅ DsaAuthContext: User set from session: { id: "...", username: "...", email: "..." }
🔍 DsaProblems: Current user from context: { id: "...", username: "...", email: "..." }
```

**If NOT logged in:**
```
🔍 DsaAuthContext: Checking for existing session...
🔍 DsaAuthContext: Session data: null
❌ DsaAuthContext: No session found
🔍 DsaProblems: Current user from context: null
```

### Method 2: Check Browser DevTools
1. Open DevTools (F12)
2. Go to Application tab
3. Expand Local Storage
4. Look for your domain
5. Check for keys starting with `sb-` (Supabase auth tokens)
6. If no `sb-` keys exist, you're not logged in

### Method 3: Check Supabase Session in Console
Run this in browser console:
```javascript
const { data } = await supabase.auth.getSession();
console.log('Session:', data.session);
```

If `data.session` is `null`, you're not logged in.

## Step-by-Step Fix

### Step 1: Clear Everything
```
1. Open browser DevTools (F12)
2. Go to Application tab
3. Clear all Local Storage
4. Clear all Session Storage
5. Close DevTools
6. Hard refresh page (Ctrl+Shift+R)
```

### Step 2: Register New Account
```
1. Navigate to http://localhost:5173/dsa/register
2. Fill in:
   - Username: testuser
   - Email: test@example.com
   - Password: Test123456
3. Click Register
4. Check console for success message
```

### Step 3: Verify Login
After registration, check console logs:
```
✅ Should see: "DsaAuthContext: User set from session"
✅ Should see: "DsaProblems: Current user from context: { id: '...' }"
❌ Should NOT see: "No user logged in"
```

### Step 4: Test Submission
```
1. Navigate to /dsa/problems
2. Click any problem
3. Write simple code
4. Click Submit
5. Check console logs
```

**Expected logs:**
```
💾 Attempting to save submission for user: <actual-user-id>
✅ Submission saved successfully
```

## If Still Not Working

### Check Supabase Configuration

1. **Check .env file:**
```bash
# Should have these variables:
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

2. **Verify Supabase client:**
Open `src/lib/supabase.ts` and ensure it's using the correct env variables.

3. **Check Supabase Dashboard:**
- Go to your Supabase project
- Authentication → Users
- Verify users exist
- Check if email confirmation is disabled (for testing)

### Check Network Requests

1. Open DevTools → Network tab
2. Try to log in
3. Look for requests to Supabase
4. Check if they're succeeding (200 status)
5. Check response data

## Quick Test Script

Run this in browser console after loading the DSA page:

```javascript
// Test 1: Check if DsaAuthProvider is working
console.log('Test 1: Checking auth context...');
// If you see "useDsaAuth must be used within DsaAuthProvider" error,
// the provider is not wrapping the component correctly

// Test 2: Check Supabase session
console.log('Test 2: Checking Supabase session...');
const { data } = await supabase.auth.getSession();
console.log('Session exists:', !!data.session);
console.log('User ID:', data.session?.user?.id);

// Test 3: Try to get user
console.log('Test 3: Getting current user...');
const { data: userData } = await supabase.auth.getUser();
console.log('User exists:', !!userData.user);
console.log('User email:', userData.user?.email);
```

## Expected Behavior After Fix

1. **On page load:**
   - DsaAuthContext checks for session
   - If session exists, user is set
   - Components receive user from context

2. **On login:**
   - User logs in via DsaLogin page
   - DsaAuthContext receives auth state change
   - User is set in context
   - All components receive updated user

3. **On submission:**
   - Component has user from context
   - Submission saves with user.id
   - Real-time subscription works
   - Problem appears in solved list

## Next Steps

1. **First:** Check if you're actually logged in (Method 1 above)
2. **If not logged in:** Register a new account
3. **If logged in but user is null:** Clear cache and log in again
4. **If still failing:** Check Supabase configuration
5. **Report back:** Share the console logs from the debug logging we added
