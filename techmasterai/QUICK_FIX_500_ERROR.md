# 🚨 Quick Fix: 500 Internal Server Error

## Problem
Getting "500 Internal Server Error" when running code? This happens because Python/Java/C++ compilers are not installed OR not configured properly.

## ✅ Quick Solution (Choose One)

### Option 1: Use Judge0 (Recommended for Production) ⭐

**Takes 5 minutes, works everywhere (even in production)**

1. **Get FREE API Key:**
   - Go to: https://rapidapi.com/judge0-official/api/judge0-ce
   - Click "Sign Up" (free)
   - Click "Subscribe to Test" → Select "Basic" (FREE)
   - Copy your API key

2. **Add to `.env` file:**
   ```bash
   EXECUTION_MODE=judge0
   JUDGE0_API_KEY=paste_your_key_here
   JUDGE0_API_URL=https://judge0-ce.p.rapidapi.com
   JUDGE0_API_HOST=judge0-ce.p.rapidapi.com
   ```

3. **Restart backend:**
   ```bash
   npm run dev
   ```

4. **Test it!** ✅ Should work now!

---

### Option 2: Install Python Locally (Development Only)

**Only works on your computer, NOT in production**

1. **Check if Python is installed:**
   ```bash
   python --version
   ```

2. **If not installed:**
   - Windows: Download from https://python.org
   - Mac: `brew install python3`
   - Linux: `sudo apt install python3`

3. **Restart backend:**
   ```bash
   npm run dev
   ```

4. **Test it!** ✅ Should work now!

---

## Which Option Should I Choose?

| Feature | Judge0 (Option 1) | Local Python (Option 2) |
|---------|-------------------|-------------------------|
| **Works in Production** | ✅ Yes | ❌ No |
| **Setup Time** | 5 minutes | 5-10 minutes |
| **Cost** | Free (50/day) | Free |
| **Requires Installation** | ❌ No | ✅ Yes |
| **Works Offline** | ❌ No | ✅ Yes |
| **Recommended For** | Production | Development |

**Recommendation**: Use Judge0 (Option 1) - it's easier and works in production!

---

## Still Getting Errors?

### Error: "Judge0 API error: 401"
- **Fix**: Check your API key is correct in `.env`
- Make sure you subscribed to Judge0 on RapidAPI

### Error: "Python not found"
- **Fix**: Install Python from python.org
- OR use Judge0 instead (Option 1)

### Error: "Rate limit exceeded"
- **Fix**: You've used 50 free requests today
- Wait 24 hours OR upgrade to Pro plan ($5/month)

---

## Test Your Setup

Run this command to test:
```bash
node test-python-execution.js
```

Should see:
```
🎉 SUCCESS! Python execution is working perfectly!
```

---

## For Production Deployment

When deploying to Netlify/Vercel/Heroku:

1. **Add these environment variables** in your hosting dashboard:
   ```
   EXECUTION_MODE=judge0
   JUDGE0_API_KEY=your_key_here
   JUDGE0_API_URL=https://judge0-ce.p.rapidapi.com
   JUDGE0_API_HOST=judge0-ce.p.rapidapi.com
   ```

2. **Deploy** - Done! ✅

---

## Need More Help?

Check the detailed guide: `PRODUCTION_CODE_EXECUTION_SETUP.md`

---

**TL;DR**: Get Judge0 API key (free), add to `.env`, restart server. Done! 🚀
