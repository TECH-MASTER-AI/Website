# Testing Checklist - Authentication Unification

## Pre-Testing Setup
- [ ] Clear browser cache (Ctrl+Shift+R)
- [ ] Open browser DevTools Console (F12)
- [ ] Navigate to http://localhost:5173 (or your dev server URL)

## Test 1: User Registration
1. [ ] Navigate to `/dsa/register`
2. [ ] Register with new email and password
3. [ ] Check console for: `✅ Registration successful` or similar
4. [ ] Verify you're redirected to DSA dashboard or problems list
5. [ ] Check console - should NOT show "❌ No user logged in"

**Expected Console Output:**
```
🔍 Fetching solved problems for user: <user-id>
📊 Submissions query result: { submissions: [], submissionsError: null }
✅ Solved problems: []
```

## Test 2: Problem Submission
1. [ ] Navigate to `/dsa/problems`
2. [ ] Click on any problem (e.g., "Two Sum")
3. [ ] Wait for Monaco editor to load
4. [ ] Write simple code that produces output (e.g., `console.log("test")` or return statement)
5. [ ] Click "Submit" button
6. [ ] Check console logs

**Expected Console Output:**
```
💾 Attempting to save submission for user: <actual-user-id>
📝 Question lookup: { questionData: { id: X }, questionError: null, slug: "..." }
💾 Inserting submission: { user_id: "...", question_id: X, ... }
✅ Submission saved successfully: [{ id: Y, ... }]
```

**Should NOT see:**
```
❌ No user logged in
💾 Attempting to save submission for user: undefined
```

## Test 3: Real-Time Solved Problems Update
1. [ ] After successful submission, wait 2 seconds
2. [ ] Check console for real-time subscription messages
3. [ ] Navigate back to `/dsa/problems`
4. [ ] Click "Solved" filter or check problem status
5. [ ] Verify the submitted problem shows green checkmark ✅

**Expected Console Output:**
```
🔔 New submission detected: { new: { slug: "...", status: "accepted", ... } }
✅ Adding to solved problems: <problem-slug>
📊 Updated solved problems: ["<problem-slug>"]
```

## Test 4: Problems List Display
1. [ ] On `/dsa/problems` page
2. [ ] Check console logs when page loads
3. [ ] Verify user ID is shown (not undefined)
4. [ ] Check that solved problems are fetched from database

**Expected Console Output:**
```
🔍 Fetching solved problems for user: <user-id>
📊 Submissions query result: { submissions: [{ slug: "..." }], submissionsError: null }
✅ Solved problems: ["<problem-slug>"]
🔔 Setting up real-time subscription for user: <user-id>
```

## Test 5: Comments/Feedback
1. [ ] Open any problem detail page
2. [ ] Scroll to "Feedback" section at bottom
3. [ ] Try posting a comment
4. [ ] Verify comment appears immediately
5. [ ] Check console for any auth errors

**Should NOT see:**
```
❌ No user logged in
Please login to comment
```

## Common Issues & Solutions

### Issue: Monaco Editor Stuck on "Loading editor..."
**Solution:** 
- Hard refresh (Ctrl+Shift+R)
- Clear browser cache
- Check if `@monaco-editor/react` is installed
- **Not related to authentication**

### Issue: Still seeing "user: undefined"
**Solution:**
- Check if you're actually logged in (check DsaAuthContext state)
- Verify Supabase session exists: Open DevTools → Application → Local Storage → Check for Supabase auth token
- Try logging out and logging back in

### Issue: Submissions not saving
**Solution:**
- Check Supabase dashboard → Authentication → Users (verify user exists)
- Check Supabase dashboard → Table Editor → dsa_questions (verify problem exists)
- Check RLS policies on `dsa_submissions` table (should allow INSERT for authenticated users)

### Issue: Real-time updates not working
**Solution:**
- Check Supabase dashboard → Database → Replication (verify real-time is enabled)
- Check browser console for WebSocket connection errors
- Verify real-time subscription is set up (check console logs)

## Success Criteria

✅ **All tests pass if:**
1. User ID appears in console logs (not undefined)
2. Submissions save to database successfully
3. Problems appear in "Solved" filter immediately after submission
4. No "❌ No user logged in" errors in console
5. Real-time subscription shows user ID
6. Comments can be posted without auth errors

## Debugging Commands

If issues persist, check these in browser console:

```javascript
// Check if user is logged in
const { data } = await supabase.auth.getSession();
console.log('Session:', data.session);

// Check DSA auth context (if accessible)
// Should show user object with id, username, email

// Check submissions in database
const { data: subs } = await supabase
  .from('dsa_submissions')
  .select('*')
  .eq('user_id', '<your-user-id>');
console.log('My submissions:', subs);
```

## Next Steps After Testing

If all tests pass:
- ✅ Authentication unification is complete
- ✅ Real-time solved problems feature is working
- ✅ Ready for production

If tests fail:
- Check specific error messages in console
- Verify Supabase configuration (.env file)
- Check RLS policies in Supabase dashboard
- Review AUTHENTICATION_UNIFICATION_COMPLETE.md for implementation details
