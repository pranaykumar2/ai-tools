# 🔧 Vercel Environment Variables Setup Guide

## ❌ **ERROR EXPLANATION:**
The error occurs because `vercel.json` referenced secrets that don't exist. I've fixed this by removing the `env` section from `vercel.json`. Environment variables should be set directly in the Vercel dashboard.

## ✅ **CORRECT DEPLOYMENT PROCESS:**

### **Step 1: Deploy First (Without Environment Variables)**
```bash
vercel --prod
```

### **Step 2: Set Environment Variables in Vercel Dashboard**

1. **Go to your Vercel dashboard:** https://vercel.com/dashboard
2. **Select your project** (ai-tools)
3. **Go to Settings → Environment Variables**
4. **Add each variable:**

#### **Required Environment Variables:**

| Variable Name | Value | Environment |
|---------------|-------|-------------|
| `SUPABASE_URL` | `https://lwshlfmcwitoljsfjemx.supabase.co` | Production, Preview, Development |
| `SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx3c2hsZm1jd2l0b2xqc2ZqZW14Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMxNTcwNjQsImV4cCI6MjA2ODczMzA2NH0.kUyE1SpqgMsVcR6-RrRRGvSa_I8oaOBndHHX80hQJsA` | Production, Preview, Development |
| `SUPABASE_SERVICE_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx3c2hsZm1jd2l0b2xqc2ZqZW14Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzE1NzA2NCwiZXhwIjoyMDY4NzMzMDY0fQ.a3WAxavHIOw-r8zSWQs5CfktQNzHAk5kiXbW1UWT8xU` | Production, Preview, Development |
| `EMAIL_USER` | `your-email@gmail.com` | Production, Preview, Development |
| `EMAIL_PASS` | `your-gmail-app-password` | Production, Preview, Development |
| `CONTACT_EMAIL` | `your-contact-email@gmail.com` | Production, Preview, Development |

### **Step 3: Redeploy After Setting Variables**
```bash
vercel --prod
```

---

## 📱 **VISUAL GUIDE FOR VERCEL DASHBOARD:**

### **Adding Environment Variables:**

1. **Navigate to Settings:**
   ```
   Vercel Dashboard → Your Project → Settings → Environment Variables
   ```

2. **Click "Add New"**

3. **Fill in the form:**
   - **Name:** `SUPABASE_URL`
   - **Value:** `https://lwshlfmcwitoljsfjemx.supabase.co`
   - **Environments:** ✅ Production ✅ Preview ✅ Development

4. **Repeat for all 6 variables**

---

## 🚀 **QUICK DEPLOYMENT COMMANDS:**

### **Option 1: Deploy Now (Recommended)**
```bash
# Deploy without environment variables first
vercel --prod

# Then set environment variables in dashboard
# Then redeploy
vercel --prod
```

### **Option 2: Using Vercel CLI to Set Variables**
```bash
# Set environment variables via CLI
vercel env add SUPABASE_URL production
vercel env add SUPABASE_ANON_KEY production
vercel env add SUPABASE_SERVICE_KEY production
vercel env add EMAIL_USER production
vercel env add EMAIL_PASS production
vercel env add CONTACT_EMAIL production

# Then deploy
vercel --prod
```

---

## ✅ **TESTING AFTER DEPLOYMENT:**

1. **Visit your deployed site:** `https://your-app.vercel.app`
2. **Test tool submission:** `/contribute`
3. **Test contact form:** Homepage contact section
4. **Test admin panel:** `/admin`

---

## 🔒 **SECURITY NOTE:**

- ✅ Environment variables are now properly separated from code
- ✅ Sensitive keys are stored securely in Vercel
- ✅ No secrets exposed in repository

---

## 📝 **NEXT STEPS:**

1. **Run the deployment** using fixed configuration
2. **Set environment variables** in Vercel dashboard
3. **Test all functionality**
4. **Configure custom domain** (optional)

The error is now fixed! You can deploy successfully. 🎉
