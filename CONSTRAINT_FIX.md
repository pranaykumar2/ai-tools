# 🚨 CONSTRAINT ERROR FIXES

## Error: `ai_tools_pricing_type_check` Violation

### **Problem:**
Frontend sends pricing as `'free'`, `'freemium'`, `'paid'` but database expects `'Free'`, `'Freemium'`, `'Pro'`.

### **✅ Solution Applied:**
1. **Server-side normalization** added to `server.js`
2. **Database schema** updated to allow default rating
3. **Quick fix SQL** provided for existing databases

---

## Error: `rating >= 1 AND rating <= 5` Violation

### **Problem:**
Rating was set to `0` but database constraint requires `1-5`.

### **✅ Solution Applied:**
1. **Default rating** changed to `1` in server.js
2. **Database schema** updated with proper default

---

## Quick Fix Commands

If you already have a Supabase database set up, run these SQL commands:

```sql
-- Fix existing data with rating = 0
UPDATE ai_tools SET rating = 1 WHERE rating = 0;

-- Fix pricing type casing
UPDATE ai_tools SET pricing_type = 'Free' WHERE pricing_type = 'free';
UPDATE ai_tools SET pricing_type = 'Freemium' WHERE pricing_type = 'freemium';
UPDATE ai_tools SET pricing_type = 'Pro' WHERE pricing_type IN ('paid', 'pro');
```

## Test the Fix

1. **Restart your server:**
   ```bash
   npm start
   ```

2. **Try submitting a tool again** at `/contribute.html`

3. **Check for success** - no more constraint errors!

---

## ✅ Status: **FIXED**

The issues have been resolved in the codebase. New submissions will now work correctly!
