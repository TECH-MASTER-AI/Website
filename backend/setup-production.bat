@echo off
REM Production Setup Script for Windows
REM This script helps you configure the platform for production deployment

echo.
echo ========================================
echo TechMaster DSA Platform - Production Setup
echo ========================================
echo.

REM Check if .env exists
if not exist .env (
    echo Creating .env from .env.example...
    copy .env.example .env
)

echo Please provide the following information:
echo.

REM Judge0 API Key
set /p JUDGE0_KEY="Enter your Judge0 API Key (from RapidAPI): "
if not "%JUDGE0_KEY%"=="" (
    echo JUDGE0_API_KEY=%JUDGE0_KEY%>> .env
    echo EXECUTION_MODE=judge0>> .env
    echo ✓ Judge0 configured
)

REM Database URL
set /p DB_URL="Enter your production DATABASE_URL (from Neon/Supabase): "
if not "%DB_URL%"=="" (
    echo DATABASE_URL=%DB_URL%>> .env
    echo ✓ Database configured
)

echo.
echo Running database migrations...
call npm run db:init
call npm run db:seed

echo.
echo Building frontend...
call npm run build

echo.
echo ========================================
echo ✓ Setup complete!
echo ========================================
echo.
echo Next steps:
echo 1. Deploy backend to Railway/Render
echo 2. Deploy frontend to Netlify/Vercel
echo 3. Update CORS settings in server.js
echo.
echo See DEPLOYMENT_GUIDE.md for detailed instructions
echo.
pause
