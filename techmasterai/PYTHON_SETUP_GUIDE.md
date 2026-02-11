# Python Setup Guide for Code Execution

## Problem
Backend 500 error because Python is not installed on your system.

## Quick Fix (5 minutes)

### Step 1: Check if Python is Installed
```bash
python --version
# or
python3 --version
```

If you see version number (e.g., `Python 3.11.0`), Python is installed! ✅  
If you see error, Python is NOT installed ❌

### Step 2: Install Python (Windows)

**Option A: Download from Official Site (Recommended)**
1. Go to: https://www.python.org/downloads/
2. Click "Download Python 3.12.x" (latest version)
3. Run the installer
4. ⚠️ **IMPORTANT**: Check "Add Python to PATH" checkbox!
5. Click "Install Now"
6. Wait for installation to complete
7. Restart your terminal/command prompt

**Option B: Using Microsoft Store**
1. Open Microsoft Store
2. Search for "Python 3.12"
3. Click "Get" or "Install"
4. Wait for installation

### Step 3: Verify Installation
```bash
python --version
# Should show: Python 3.12.x
```

### Step 4: Restart Backend
```bash
# Stop current backend (Ctrl+C)
# Then restart:
cd techmaster-nexus-main
npm run dev
```

### Step 5: Test in Solo Challenge
1. Go to Solo Challenge
2. Write simple Python code:
```python
def is_valid(s: str) -> bool:
    return True
```
3. Click "Run"
4. Should work now! ✅

## Alternative: Use JavaScript in Duel Room

If you don't want to install Python, use the 1v1 Duel Room instead:
- Duel Room has Monaco Editor ✅
- Supports JavaScript (no installation needed) ✅
- Has test case validation ✅
- Works client-side ✅

## Troubleshooting

### Error: "python is not recognized"
**Solution**: Python not in PATH
1. Reinstall Python
2. Check "Add Python to PATH" during installation
3. Or manually add to PATH:
   - Search "Environment Variables" in Windows
   - Edit "Path" variable
   - Add Python installation folder (e.g., `C:\Python312\`)

### Error: Still 500 after installing Python
**Solution**: Restart everything
```bash
# 1. Close all terminals
# 2. Open new terminal
# 3. Verify Python:
python --version
# 4. Restart backend:
cd techmaster-nexus-main
npm run dev
```

### Error: "Permission denied"
**Solution**: Run as Administrator
- Right-click Command Prompt
- Select "Run as Administrator"
- Try again

## What's Working Without Python

Even without Python, these features work:

✅ Monaco Editor - Full IDE experience
✅ Syntax highlighting
✅ Auto-completion
✅ Problem display
✅ Test case display
✅ UI/UX
⚠️ Code execution - Needs Python

## Production Solution

For production deployment, use Judge0 API instead of local execution:

1. Get free API key: https://rapidapi.com/judge0-official/api/judge0-ce
2. Add to `.env`:
```env
EXECUTION_MODE=judge0
JUDGE0_API_URL=https://judge0-ce.p.rapidapi.com
JUDGE0_API_KEY=your_key_here
```
3. Restart backend
4. Now supports all languages without local installation!

## Summary

**Quick Fix**: Install Python from python.org (5 minutes)  
**Alternative**: Use Duel Room with JavaScript  
**Production**: Use Judge0 API

After installing Python, Solo Challenge will work perfectly! 🚀
