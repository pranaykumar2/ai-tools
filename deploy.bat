@echo off
REM AI Tools Hub - Vercel Deployment Script for Windows

echo 🚀 Deploying AI Tools Hub to Vercel...

REM Check if Vercel CLI is installed
vercel --version >nul 2>&1
if errorlevel 1 (
    echo 📦 Installing Vercel CLI...
    npm install -g vercel
)

REM Login to Vercel (if not already logged in)
echo 🔐 Checking Vercel authentication...
vercel whoami || vercel login

REM Deploy to Vercel
echo 🚀 Deploying to Vercel...
vercel --prod

echo.
echo ✅ Deployment complete!
echo.
echo ⚠️  IMPORTANT: Environment Variables Setup Required
echo.
echo 🎯 Next steps:
echo 1. Go to https://vercel.com/dashboard
echo 2. Select your project → Settings → Environment Variables
echo 3. Add these variables for Production, Preview, and Development:
echo    - SUPABASE_URL
echo    - SUPABASE_ANON_KEY  
echo    - SUPABASE_SERVICE_KEY
echo    - EMAIL_USER
echo    - EMAIL_PASS
echo    - CONTACT_EMAIL
echo.
echo 4. Redeploy after setting variables: vercel --prod
echo.
echo 📚 See VERCEL_FIX.md for detailed instructions with your actual values
pause
