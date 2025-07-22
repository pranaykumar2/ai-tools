# AI Tools - Main App Deployment Guide

## Overview
This is the main public-facing AI Tools application with minimal serverless functions to fit within Vercel's Hobby plan (12 function limit).

## Current Function Count: 2/12
- ✅ `api/tools.js` - Handles tool listing (GET) and submission (POST)
- ✅ `api/contact.js` - Handles contact form submissions

## Features Included
- 🔍 **Tool Browsing** - View approved AI tools
- 📝 **Tool Submission** - Submit new tools for review
- 💌 **Contact Form** - Contact the website team
- 📱 **Responsive Design** - Works on all devices
- 🎬 **Reels Page** - Video demonstrations of tools

## Deployment Steps

### 1. Deploy to Vercel
1. Go to [vercel.com](https://vercel.com)
2. Import the repository
3. Select the `main-app-only` branch
4. Set environment variables:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_KEY`
5. Deploy!

### 2. Admin Dashboard (Separate Project)
The admin functionality has been moved to a separate project to avoid function limits:
- Create a new Vercel project for admin dashboard
- Use the files copied to "Kumar Raja Admin" folder
- This will have its own 12 function allocation

## API Endpoints

### Public Endpoints
- `GET /api/tools` - Fetch approved tools
- `POST /api/tools` - Submit new tool
- `POST /api/contact` - Contact form submission

## Environment Variables
```
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_KEY=your_supabase_service_role_key
```

## Database Tables Required

### ai_tools
```sql
CREATE TABLE ai_tools (
  id SERIAL PRIMARY KEY,
  tool_name VARCHAR(255) NOT NULL,
  tool_description TEXT,
  tool_website VARCHAR(500),
  tool_category VARCHAR(100),
  submitter_name VARCHAR(255),
  submitter_email VARCHAR(255),
  approved BOOLEAN DEFAULT false,
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### contacts (optional)
```sql
CREATE TABLE contacts (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Next Steps
1. Deploy this main app to Vercel
2. Set up the admin dashboard as a separate Vercel project
3. Test tool submission and browsing functionality
4. Admin can approve tools through the separate admin dashboard

## Admin Access
- Admin functionality will be at: `https://your-admin-app.vercel.app`
- Main public app will be at: `https://your-main-app.vercel.app`

This separation ensures both apps stay within Vercel's function limits while maintaining full functionality.
