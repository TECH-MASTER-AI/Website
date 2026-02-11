# Python Execution Setup Guide

## ✅ Current Status

**Python is already installed and configured!**

- **Python Version**: 3.14.0
- **Location**: `C:\Python314\python.exe`
- **Status**: ✅ Working and ready to use

## Backend Configuration

The backend (`backend/routes/execute.js`) is already configured to execute Python code with the following features:

### Supported Features

1. **LeetCode-Style Execution**
   - Automatic function calling with test inputs
   - JSON input/output handling
   - Multiple test case execution
   - Execution time tracking

2. **Language Detection**
   - Automatically uses `python` command on Windows
   - Falls back to `python3` on Linux/Mac
   - No manual configuration needed

3. **Code Execution Flow**
   ```
   User Code → Temp File → Python Execution → Output Capture → Result Comparison
   ```

## How Python Execution Works

### 1. Code Submission
When you submit Python code, the backend:
- Creates a temporary directory
- Writes your code to `main.py`
- Appends a runner block that calls your function
- Executes the code with test inputs
- Captures and parses the output
- Compares with expected results

### 2. Example Flow

**Your Code:**
```python
def twoSum(nums, target):
    seen = {}
    for i, num in enumerate(nums):
        complement = target - num
        if complement in seen:
            return [seen[complement], i]
        seen[num] = i
    return []
```

**Backend Appends:**
```python
if __name__ == "__main__":
    import json
    try:
        result = twoSum(nums=[2,7,11,15], target=9)
        print(json.dumps(result))
    except Exception as e:
        print(json.dumps({"__error__": str(e)}))
```

**Execution:**
```bash
python main.py
# Output: [0, 1]
```

## Testing Python Execution

### Quick Test (Command Line)
```bash
# Test Python is working
python --version

# Test simple execution
python -c "print('Hello from Python!')"

# Test with imports
python -c "import json; print(json.dumps([1, 2, 3]))"
```

### Backend Test (With Server Running)

1. **Start the backend server:**
   ```bash
   cd techmaster-nexus-main
   npm run dev
   # or
   node server.js
   ```

2. **Run the test script:**
   ```bash
   node test-python-execution.js
   ```

3. **Expected Output:**
   ```
   🐍 Testing Python Code Execution...
   
   📊 Execution Results:
   Status: success
   Runtime: 45ms
   Memory: 15MB
   
   Test Cases:
   Test 1: ✅ PASSED
   Test 2: ✅ PASSED
   Test 3: ✅ PASSED
   
   🎉 SUCCESS! Python execution is working perfectly!
   ```

## Frontend Integration

Python is already integrated in the frontend:

### 1. Monaco Editor (Duel Room)
- Language selector includes Python
- Syntax highlighting for Python
- Auto-completion and IntelliSense
- Error detection

### 2. Code Execution Service
Located in `src/services/codeExecutionService.ts`:
- Sends Python code to backend
- Handles test case execution
- Processes results and errors

### 3. Problem Detail Pages
- `DsaProblemDetail.tsx` - Solo practice with Python
- `DsaDuelRoom.tsx` - 1v1 duels with Python
- `DsaSoloChallenge.tsx` - Challenge mode with Python

## Supported Python Features

### ✅ Working Features
- Function definitions
- Classes and methods
- Built-in data structures (list, dict, set, tuple)
- Standard library imports (json, math, collections, etc.)
- List comprehensions
- Lambda functions
- Exception handling
- Type hints (optional)

### ⚠️ Limitations
- No external packages (numpy, pandas, etc.) - only standard library
- Execution timeout: 5 seconds per test case
- Memory limit: 1GB (system default)
- No file I/O operations
- No network requests

## Common Python Patterns

### Pattern 1: Two Sum
```python
def twoSum(nums, target):
    seen = {}
    for i, num in enumerate(nums):
        complement = target - num
        if complement in seen:
            return [seen[complement], i]
        seen[num] = i
    return []
```

### Pattern 2: Reverse Linked List
```python
class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next

def reverseList(head):
    prev = None
    current = head
    while current:
        next_node = current.next
        current.next = prev
        prev = current
        current = next_node
    return prev
```

### Pattern 3: Binary Search
```python
def binarySearch(nums, target):
    left, right = 0, len(nums) - 1
    while left <= right:
        mid = (left + right) // 2
        if nums[mid] == target:
            return mid
        elif nums[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    return -1
```

## Troubleshooting

### Issue 1: "Python not found"
**Solution:**
```bash
# Check if Python is in PATH
python --version

# If not found, add to PATH:
# Windows: Add C:\Python314 to System Environment Variables
# Or use full path in backend config
```

### Issue 2: "Module not found"
**Solution:**
- Only standard library modules are available
- Don't use external packages like numpy, pandas
- Use built-in alternatives:
  - Instead of numpy: use list comprehensions
  - Instead of pandas: use dict and list

### Issue 3: "Execution timeout"
**Solution:**
- Optimize your algorithm
- Reduce time complexity
- Avoid infinite loops
- Use efficient data structures

### Issue 4: "Syntax error"
**Solution:**
- Check Python version compatibility (3.14.0)
- Use proper indentation (4 spaces)
- Avoid smart quotes from copy-paste
- Test code locally first

## Performance Tips

### 1. Use Built-in Functions
```python
# Good - O(n)
return sum(nums)

# Avoid - O(n) but slower
total = 0
for num in nums:
    total += num
return total
```

### 2. Use List Comprehensions
```python
# Good
squares = [x**2 for x in range(10)]

# Avoid
squares = []
for x in range(10):
    squares.append(x**2)
```

### 3. Use Hash Maps for Lookups
```python
# Good - O(1) lookup
seen = set(nums)
if target in seen:
    return True

# Avoid - O(n) lookup
if target in nums:  # list lookup
    return True
```

## Next Steps

1. ✅ Python is installed and working
2. ✅ Backend is configured for Python execution
3. ✅ Frontend supports Python in Monaco Editor
4. ✅ Test cases work with Python code

**You're all set! Start coding in Python! 🐍**

## Additional Resources

- [Python Official Docs](https://docs.python.org/3/)
- [Python Standard Library](https://docs.python.org/3/library/)
- [LeetCode Python Solutions](https://leetcode.com/problemset/all/?difficulty=EASY&page=1&topicSlugs=array&languageTags=python3)
- [Python DSA Patterns](https://github.com/TheAlgorithms/Python)

## Support

If you encounter any issues:
1. Check backend logs: `npm run dev` output
2. Test Python directly: `python --version`
3. Run test script: `node test-python-execution.js`
4. Check browser console for frontend errors
5. Verify backend is running on port 3001
