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
echo 🎯 Next steps:
echo 1. Set environment variables in Vercel dashboard
echo 2. Test your deployment
echo 3. Configure custom domain (optional)
echo.
echo 📚 See VERCEL_DEPLOYMENT.md for detailed instructions
pause
