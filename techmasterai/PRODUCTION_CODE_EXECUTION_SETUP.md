# Production Code Execution Setup Guide

## 🚨 Problem: 500 Internal Server Error

The 500 error occurs because:
1. **Local execution requires compilers** (Python/Java/C++) installed on the server
2. **Production servers** (Netlify, Vercel, etc.) don't have these compilers
3. **Solution**: Use Judge0 API for cloud-based code execution

## ✅ Solution: Judge0 Integration

Judge0 is a cloud-based code execution system that works in production without requiring any compilers on your server.

### Benefits:
- ✅ Works in production (no compiler installation needed)
- ✅ Supports 60+ programming languages
- ✅ Secure sandboxed execution
- ✅ Free tier available (50 requests/day)
- ✅ Fast and reliable
- ✅ Automatic fallback to local execution in development

## 🚀 Quick Setup (5 Minutes)

### Step 1: Get Judge0 API Key (FREE)

1. Go to [RapidAPI Judge0](https://rapidapi.com/judge0-official/api/judge0-ce)
2. Click "Sign Up" (free account)
3. Click "Subscribe to Test" → Select "Basic" plan (FREE - 50 requests/day)
4. Copy your API Key from the "X-RapidAPI-Key" header

### Step 2: Configure Environment Variables

Add to your `.env` file:

```bash
# Code Execution Mode
EXECUTION_MODE=judge0

# Judge0 API Configuration
JUDGE0_API_KEY=your_rapidapi_key_here
JUDGE0_API_URL=https://judge0-ce.p.rapidapi.com
JUDGE0_API_HOST=judge0-ce.p.rapidapi.com
```

### Step 3: Restart Backend Server

```bash
# Stop current server (Ctrl+C)
# Start again
npm run dev
```

### Step 4: Test It!

1. Go to any DSA problem page
2. Select Python/Java/C++
3. Write code and click "Run"
4. ✅ Should work without 500 error!

## 📋 Detailed Configuration

### Development Mode (Local Execution)

```bash
# .env
EXECUTION_MODE=local
```

**Requirements:**
- Python 3.x installed
- Java JDK installed (optional)
- GCC/G++ installed (optional)

**Pros:**
- Free
- Fast (no API calls)
- Works offline

**Cons:**
- Requires compiler installation
- Won't work in production
- Security concerns

### Production Mode (Judge0)

```bash
# .env
EXECUTION_MODE=judge0
JUDGE0_API_KEY=your_key_here
```

**Requirements:**
- Judge0 API key (free tier available)
- Internet connection

**Pros:**
- Works in production
- No compiler installation needed
- Secure sandboxed execution
- Supports 60+ languages

**Cons:**
- API rate limits (50/day on free tier)
- Requires internet

## 🔄 Automatic Fallback System

The backend automatically handles fallbacks:

```
1. Try Judge0 (if API key configured)
   ↓ (if fails or not configured)
2. Try Local Execution (if compilers available)
   ↓ (if fails)
3. Return friendly error message
```

This means:
- **Development**: Works with local Python even without Judge0
- **Production**: Automatically uses Judge0
- **No configuration needed** for basic development

## 🌐 Production Deployment

### Netlify/Vercel Deployment

1. **Add Environment Variables** in your hosting dashboard:
   ```
   EXECUTION_MODE=judge0
   JUDGE0_API_KEY=your_key_here
   JUDGE0_API_URL=https://judge0-ce.p.rapidapi.com
   JUDGE0_API_HOST=judge0-ce.p.rapidapi.com
   ```

2. **Deploy** - Code execution will work automatically!

### Heroku/Railway Deployment

Same as above - just add environment variables in your platform's settings.

## 📊 Judge0 Pricing

### Free Tier (Basic Plan)
- **Cost**: $0/month
- **Requests**: 50/day
- **Rate Limit**: 50 requests/day
- **Perfect for**: Development, testing, small projects

### Pro Plan
- **Cost**: $5/month
- **Requests**: 10,000/month
- **Rate Limit**: 100 requests/minute
- **Perfect for**: Production apps with moderate traffic

### Ultra Plan
- **Cost**: $20/month
- **Requests**: 100,000/month
- **Rate Limit**: 500 requests/minute
- **Perfect for**: High-traffic production apps

## 🧪 Testing

### Test Local Execution
```bash
# Make sure Python is installed
python --version

# Start backend
npm run dev

# Test in browser - should work!
```

### Test Judge0 Execution
```bash
# Add Judge0 API key to .env
EXECUTION_MODE=judge0
JUDGE0_API_KEY=your_key_here

# Start backend
npm run dev

# Test in browser - should work!
```

### Test Script
```bash
node test-python-execution.js
```

## 🐛 Troubleshooting

### Error: "500 Internal Server Error"

**Cause**: No compilers installed AND no Judge0 API key configured

**Solution**:
1. Add Judge0 API key to `.env`
2. OR install Python: `python --version`
3. Restart backend server

### Error: "Judge0 API error: 429"

**Cause**: Rate limit exceeded (50 requests/day on free tier)

**Solution**:
1. Wait 24 hours for reset
2. OR upgrade to Pro plan ($5/month)
3. OR use local execution for development

### Error: "Judge0 API error: 401"

**Cause**: Invalid API key

**Solution**:
1. Check API key is correct in `.env`
2. Make sure you subscribed to Judge0 on RapidAPI
3. Copy the key from RapidAPI dashboard

### Error: "Python not found"

**Cause**: Python not installed (local execution mode)

**Solution**:
1. Install Python from python.org
2. OR switch to Judge0 mode
3. Restart backend

## 📝 Supported Languages

### Judge0 Supports:
- ✅ Python (3.8.1)
- ✅ Java (OpenJDK 13.0.1)
- ✅ C (GCC 9.2.0)
- ✅ C++ (GCC 9.2.0)
- ✅ JavaScript (Node.js 12.14.0)
- ✅ 55+ more languages

### Local Execution Supports:
- ✅ Python (if installed)
- ✅ Java (if JDK installed)
- ✅ C/C++ (if GCC installed)

## 🔒 Security

### Judge0 Security:
- Sandboxed execution environment
- Resource limits (CPU, memory, time)
- No network access from code
- Isolated file system
- Automatic cleanup

### Local Execution Security:
- ⚠️ Less secure (runs on your server)
- ⚠️ Use only in development
- ⚠️ Don't use in production

## 📈 Performance

### Judge0:
- **Latency**: ~500-1000ms (API call + execution)
- **Throughput**: Up to 500 req/min (Ultra plan)
- **Reliability**: 99.9% uptime

### Local:
- **Latency**: ~50-200ms (direct execution)
- **Throughput**: Limited by server CPU
- **Reliability**: Depends on server

## 🎯 Recommendations

### For Development:
```bash
EXECUTION_MODE=local
# Install Python locally
# Fast and free
```

### For Production:
```bash
EXECUTION_MODE=judge0
JUDGE0_API_KEY=your_key_here
# Reliable and secure
```

### For Testing:
```bash
# Use Judge0 free tier
# 50 requests/day is enough for testing
```

## 📚 Additional Resources

- [Judge0 Documentation](https://ce.judge0.com/)
- [RapidAPI Judge0](https://rapidapi.com/judge0-official/api/judge0-ce)
- [Judge0 GitHub](https://github.com/judge0/judge0)
- [Supported Languages](https://ce.judge0.com/#system-info-languages-get)

## ✅ Checklist

- [ ] Sign up for RapidAPI account
- [ ] Subscribe to Judge0 CE (free tier)
- [ ] Copy API key
- [ ] Add to `.env` file
- [ ] Set `EXECUTION_MODE=judge0`
- [ ] Restart backend server
- [ ] Test code execution
- [ ] Deploy to production
- [ ] Add environment variables to hosting platform
- [ ] Test in production

## 🎉 Done!

Your code execution is now production-ready! No more 500 errors! 🚀

---

**Need Help?** Check the troubleshooting section or create an issue on GitHub.
