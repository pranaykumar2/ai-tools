#!/bin/bash

# AI Tools Hub - Vercel Deployment Script
echo "🚀 Deploying AI Tools Hub to Vercel..."

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "📦 Installing Vercel CLI..."
    npm install -g vercel
fi

# Login to Vercel (if not already logged in)
echo "🔐 Checking Vercel authentication..."
vercel whoami || vercel login

# Deploy to Vercel
echo "🚀 Deploying to Vercel..."
vercel --prod

echo ""
echo "✅ Deployment complete!"
echo ""
echo "🎯 Next steps:"
echo "1. Set environment variables in Vercel dashboard"
echo "2. Test your deployment"
echo "3. Configure custom domain (optional)"
echo ""
echo "📚 See VERCEL_DEPLOYMENT.md for detailed instructions"
