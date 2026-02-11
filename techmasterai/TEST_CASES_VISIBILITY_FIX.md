# Test Cases Visibility Fix

## Problem
The 3 visible test cases per problem were stored in the database but **NOT displayed on the screen** when users opened a problem. Test cases only appeared AFTER running or submitting code.

## Root Cause
The `testCases` state in `DsaProblemDetail.tsx` was only populated during code execution. The component didn't fetch and display the visible test cases when the problem initially loaded.

## Solution
Updated `DsaProblemDetail.tsx` to:

1. **Fetch visible test cases on problem load** - Added logic in the `useEffect` hook to fetch test cases from the database when the problem loads
2. **Pre-populate testCases state** - Format and display the 3 visible test cases immediately, showing "Not run yet" for user output
3. **Improved UI feedback** - Updated case selector buttons to show neutral state for unrun test cases
4. **Better loading state** - Changed empty state from "No output yet" to "Loading test cases..." with spinner

## Database Verification
Ran `scripts/check-visible-test-cases.js` to confirm:
- ✅ **88,960 total test cases** in database (1,112 problems × 80 test cases each)
- ✅ **3,336 visible test cases** (3 per problem, `is_hidden = false`)
- ✅ **85,624 hidden test cases** (77 per problem, `is_hidden = true`)
- ✅ All visible test cases have valid `expected_output` values
- ⚠️ Hidden test cases have `expected_output = null` (placeholders for future generation)

## Changes Made

### File: `src/pages/dsa/DsaProblemDetail.tsx`

#### 1. Updated problem loading useEffect (lines ~390-410)
```typescript
useEffect(() => {
    const loadProblem = async () => {
        if (!id) return;
        try {
            setLoading(true);
            const data = await fetchDsaQuestionById(id);
            setProblem(data.item);
            
            // Load visible test cases from database to display initially
            const visibleTestCases = await getTestCasesByProblemId(id);
            const visibleOnly = visibleTestCases.filter(tc => !tc.hidden);
            
            if (visibleOnly.length > 0) {
                // Format visible test cases for display
                const formattedVisible = visibleOnly.map((tc, idx) => ({
                    id: idx + 1,
                    input: typeof tc.input === 'object' ? JSON.stringify(tc.input, null, 2) : String(tc.input),
                    expectedOutput: typeof tc.expected === 'object' ? JSON.stringify(tc.expected, null, 2) : String(tc.expected),
                    userOutput: 'Not run yet',
                    passed: false,
                }));
                setTestCases(formattedVisible);
            }
        } catch (err) {
            console.error('Failed to fetch problem:', err);
            toast.error('Failed to load problem');
            navigate('/dsa/problems');
        } finally {
            setLoading(false);
        }
    };
    loadProblem();
}, [id, navigate]);
```

#### 2. Updated case selector buttons (lines ~1357-1378)
- Added check for `tc.userOutput === 'Not run yet'` to show neutral styling
- Only show pass/fail icons after code has been run

#### 3. Updated test case output display (lines ~1410-1415)
- Added styling for "Not run yet" state (gray, italic)
- Changed empty state from "No output yet" to "Loading test cases..." with spinner

## User Experience Improvements

### Before Fix
- User opens problem → sees "No output yet. Run code to see results"
- No way to see what the test cases are before running code
- Confusing UX - users don't know what inputs to expect

### After Fix
- User opens problem → immediately sees 3 visible test cases with:
  - ✅ Input data
  - ✅ Expected output
  - ⚠️ "Not run yet" for user output (gray, italic)
- Case selector buttons show neutral state (no pass/fail icons)
- After running code, buttons update to show pass/fail status
- Clear visual feedback at every stage

## Test Case Quality Summary

### Visible Test Cases (3 per problem)
- **Source**: Extracted from `examples` array in `init/data.js`
- **Quality**: ✅ **LEGIT** - Real input/output pairs from problem descriptions
- **Purpose**: Show users what to expect, help understand the problem
- **Database field**: `is_hidden = false`, `category = 'example'`

### Hidden Test Cases (77 per problem)
- **Source**: Generated placeholders
- **Quality**: ⚠️ **PLACEHOLDER** - Have `expected_output = null`
- **Purpose**: Reserved for comprehensive testing during submission
- **Database field**: `is_hidden = true`, various categories (edge, performance, stress)
- **Future work**: Need AI generation or manual creation for proper validation

## Files Modified
1. `src/pages/dsa/DsaProblemDetail.tsx` - Main problem detail page

## Files Created
1. `scripts/check-visible-test-cases.js` - Database verification script
2. `TEST_CASES_VISIBILITY_FIX.md` - This documentation

## Testing
To verify the fix works:
1. Start the development server: `npm run dev`
2. Navigate to any DSA problem (e.g., `/dsa/problems/two-sum`)
3. Check the "Output" tab at the bottom
4. You should immediately see 3 test cases with:
   - Case 1, Case 2, Case 3 buttons (neutral styling)
   - Input and Expected Output populated
   - "Not run yet" for Your Output
5. Click "Run Code" or "Submit" to see the buttons update with pass/fail status

## Status
✅ **COMPLETE** - Visible test cases now display immediately when opening any problem
