# Hide Metrics on Failed Tests

## Problem
In DSA Problem Detail page, the **Results tab** was showing Runtime, Memory, and Complexity Analysis even when test cases failed. This was confusing because metrics should only be shown for successful runs.

### Screenshot Evidence:
- Tests failed (errors in output)
- But Results tab still showed:
  - Runtime: 1822 ms
  - Memory: 15 MB
  - Complexity Analysis: O(1)
  - Language: Java
  - Executed timestamp

## Solution Implemented

### 1. Conditional Metrics Display

**Before:**
```typescript
// Set metrics whenever code runs
if (result.totalExecutionTime > 0) {
    setRunMetrics({...});
}
```

**After:**
```typescript
// Set metrics ONLY if all tests passed
const passedCount = formattedResults.filter(tc => tc.passed).length;
const allPassed = passedCount === formattedResults.length;

if (allPassed && result.totalExecutionTime > 0) {
    setRunMetrics({...});
} else {
    // Clear metrics if tests failed
    setRunMetrics(null);
}
```

### 2. Better Empty State Messages

**When No Tests Run:**
```
[Activity Icon]
No results yet
Run or submit code to see metrics
```

**When Tests Failed:**
```
[Alert Icon - Red]
Tests Failed
Fix the failing test cases to see performance metrics
2/3 tests passed
```

**When All Tests Pass:**
```
[Shows full metrics]
- Runtime: X ms
- Memory: Y MB
- Complexity Analysis
- Performance charts
```

## Logic Flow

### Before Fix:
```
User runs code
    ↓
Code executes (even with errors)
    ↓
Backend returns execution time
    ↓
Frontend shows metrics ← WRONG!
    ↓
User confused: "Why show metrics if tests failed?"
```

### After Fix:
```
User runs code
    ↓
Code executes
    ↓
Check: All tests passed?
    ├─ YES → Show metrics ✅
    └─ NO → Hide metrics, show error message ❌
    ↓
Clear user feedback
```

## UI States

### State 1: No Tests Run Yet
```
Results Tab:
┌─────────────────────────────┐
│     [Activity Icon]         │
│   No results yet            │
│   Run or submit code to     │
│   see metrics               │
└─────────────────────────────┘
```

### State 2: Tests Failed (NEW!)
```
Results Tab:
┌─────────────────────────────┐
│     [Alert Icon - Red]      │
│   Tests Failed              │
│   Fix the failing test      │
│   cases to see performance  │
│   metrics                   │
│                             │
│   1/3 tests passed          │
└─────────────────────────────┘
```

### State 3: All Tests Passed
```
Results Tab:
┌─────────────────────────────┐
│ Runtime        Memory       │
│ 1822 ms        15 MB        │
│                             │
│ Complexity Analysis         │
│ O(1)                        │
│ ● No loops                  │
│ ○ No recursion              │
│                             │
│ Language: Java              │
│ Executed: 11:55:31          │
└─────────────────────────────┘
```

## Code Changes

### File: `src/pages/dsa/DsaProblemDetail.tsx`

#### Change 1: Conditional Metrics Setting (Line ~948)
```typescript
// Set metrics ONLY if all tests passed
const passedCount = formattedResults.filter(tc => tc.passed).length;
const totalCount = formattedResults.length;
const allPassed = passedCount === totalCount;

if (allPassed && result.totalExecutionTime > 0) {
    setRunMetrics({
        runtime: result.totalExecutionTime,
        memory: result.averageMemory,
        runtimePercentile: 0,
        memoryPercentile: 0,
        timestamp: new Date(),
    });
} else {
    // Clear metrics if tests failed
    setRunMetrics(null);
}
```

#### Change 2: Better Empty State UI (Line ~1686)
```typescript
{testCases.length > 0 && testCases.some(tc => !tc.passed) ? (
    // Tests ran but failed
    <>
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-3" />
        <p className="text-red-400 text-sm font-medium">Tests Failed</p>
        <p className="text-slate-500 text-xs">
            Fix the failing test cases to see performance metrics
        </p>
        <p className="text-slate-600 text-xs">
            {testCases.filter(tc => tc.passed).length}/{testCases.length} tests passed
        </p>
    </>
) : (
    // No tests run yet
    <>
        <Activity className="h-12 w-12 text-slate-600 mx-auto mb-3" />
        <p className="text-slate-400 text-sm">No results yet</p>
        <p className="text-slate-500 text-xs">Run or submit code to see metrics</p>
    </>
)}
```

## User Experience

### Scenario 1: Code with Errors
```
User: *writes code with syntax error*
User: *clicks Run*
Output Tab: Shows error message
Results Tab: "Tests Failed - Fix the failing test cases"
User: "Okay, I need to fix my code first"
```

### Scenario 2: Code with Wrong Logic
```
User: *writes code with wrong logic*
User: *clicks Run*
Output Tab: Shows wrong output
Results Tab: "Tests Failed - 0/3 tests passed"
User: "My logic is wrong, need to fix it"
```

### Scenario 3: Partially Correct Code
```
User: *writes partially correct code*
User: *clicks Run*
Output Tab: Shows mixed results
Results Tab: "Tests Failed - 1/3 tests passed"
User: "Getting closer, need to handle edge cases"
```

### Scenario 4: Fully Correct Code
```
User: *writes correct code*
User: *clicks Run*
Output Tab: All tests pass ✅
Results Tab: Shows full metrics
  - Runtime: 1822 ms
  - Memory: 15 MB
  - Complexity: O(1)
User: "Perfect! My solution is efficient"
```

## Benefits

### 1. Clear Feedback
- Users immediately know if their code passed or failed
- No confusion about metrics when tests fail

### 2. Focused Debugging
- When tests fail, focus is on fixing code
- Metrics are irrelevant until code works

### 3. Reward for Success
- Metrics shown only when all tests pass
- Feels like an achievement

### 4. Better UX
- Consistent with LeetCode/HackerRank behavior
- Industry standard pattern

## Testing Checklist

- [x] No tests run → Shows "No results yet"
- [x] Tests failed → Shows "Tests Failed" with count
- [x] Tests passed → Shows full metrics
- [x] Metrics cleared when tests fail
- [x] Proper icon colors (red for fail, gray for empty)
- [x] Pass count displayed correctly
- [x] No TypeScript errors

## Related Features

This fix works together with:
- Test case validation fix (shows correct pass/fail)
- Toast messages (accurate feedback)
- Output tab (shows detailed errors)

## Summary

✅ **Metrics only shown when all tests pass**
✅ **Clear "Tests Failed" message when tests fail**
✅ **Shows pass count for partial success**
✅ **Better empty state for no tests**
✅ **Consistent with industry standards**

**No more confusing metrics on failed tests!** 🎯
