@echo off
REM AI Tools Hub - Setup Script for Windows

echo 🚀 Setting up AI Tools Hub with Supabase...

REM Install dependencies
echo 📦 Installing dependencies...
npm install

REM Create .env file from example
if not exist .env (
    echo 📝 Creating .env file...
    copy .env.example .env
    echo ⚠️  Please update .env file with your Supabase credentials!
) else (
    echo ✅ .env file already exists
)

echo.
echo 🎯 Next Steps:
echo 1. Create a Supabase project at https://supabase.com
echo 2. Run the SQL from SUPABASE_SETUP.md in your Supabase SQL editor
echo 3. Update .env file with your Supabase URL and keys
echo 4. Run 'npm start' to start the server
echo.
echo 📚 See SUPABASE_SETUP.md for detailed setup instructions
pause
