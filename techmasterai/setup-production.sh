#!/bin/bash

# Production Setup Script
# This script helps you configure the platform for production deployment

echo "🚀 TechMaster DSA Platform - Production Setup"
echo "=============================================="
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "❌ .env file not found!"
    echo "Creating .env from .env.example..."
    cp .env.example .env
fi

echo "📝 Please provide the following information:"
echo ""

# Judge0 API Key
read -p "Enter your Judge0 API Key (from RapidAPI): " JUDGE0_KEY
if [ ! -z "$JUDGE0_KEY" ]; then
    echo "JUDGE0_API_KEY=$JUDGE0_KEY" >> .env
    echo "EXECUTION_MODE=judge0" >> .env
    echo "✅ Judge0 configured"
fi

# Database URL
read -p "Enter your production DATABASE_URL (from Neon/Supabase): " DB_URL
if [ ! -z "$DB_URL" ]; then
    # Update or append DATABASE_URL
    if grep -q "^DATABASE_URL=" .env; then
        sed -i "s|^DATABASE_URL=.*|DATABASE_URL=$DB_URL|" .env
    else
        echo "DATABASE_URL=$DB_URL" >> .env
    fi
    echo "✅ Database configured"
fi

echo ""
echo "🔧 Running database migrations..."
npm run db:init
npm run db:seed

echo ""
echo "📦 Building frontend..."
npm run build

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Deploy backend to Railway/Render"
echo "2. Deploy frontend to Netlify/Vercel"
echo "3. Update CORS settings in server.js"
echo ""
echo "See DEPLOYMENT_GUIDE.md for detailed instructions"
