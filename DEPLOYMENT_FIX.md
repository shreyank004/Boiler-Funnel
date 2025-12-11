# Fix "Failed to Fetch" Error - Vercel Deployment Guide

## Problem
Your frontend is deployed on Vercel, but API calls are failing with "Failed to fetch" because the backend serverless function needs proper configuration.

## Solution
Your backend is already set up as a Vercel serverless function (`api/index.js`). You just need to configure environment variables in Vercel.

## Step-by-Step Fix

### Step 1: Go to Vercel Dashboard
1. Visit https://vercel.com
2. Log in to your account
3. Select your project (the one with your frontend)

### Step 2: Set Environment Variables
Go to **Settings** → **Environment Variables** and add these:

#### Required Backend Variables (for serverless function):

1. **MONGODB_URI**
   - Value: Your MongoDB connection string
   - Example: `mongodb+srv://username:password@cluster.mongodb.net/boiler-quotes`
   - **Important**: If using MongoDB Atlas, make sure to whitelist all IPs (`0.0.0.0/0`) in Network Access settings
   - Apply to: **Production**, **Preview**, and **Development**

2. **STRIPE_SECRET_KEY**
   - Value: `sk_test_51S1KU022PWcmotn34fEmpQtGJSGnr3SpEnbVV13awsygtHojF8OTQo9cJnoW1ZjHmo7dRyJEbCbk4VZG8uMNnuru00HK7BH6Dp`
   - Apply to: **Production**, **Preview**, and **Development**

#### Required Frontend Variables:

3. **REACT_APP_STRIPE_PUBLISHABLE_KEY**
   - Value: `pk_test_51S1KU022PWcmotn3tG5GqKpZmNHj0zKeu93fAo36F6ZuXgvVnO3yvrT65sQ0cKxe8Y0yRa7lAwyfAcf1NF4ggPGf00dtXCPETL`
   - Apply to: **Production**, **Preview**, and **Development**

4. **REACT_APP_API_URL** (Optional)
   - Leave this **EMPTY** or set to `/api`
   - The app will automatically detect Vercel and use relative paths
   - Apply to: **Production**, **Preview**, and **Development**

### Step 3: Redeploy Your Application
After adding environment variables:
1. Go to **Deployments** tab
2. Click the **three dots** (⋯) on your latest deployment
3. Click **Redeploy**
4. Or push a new commit to trigger automatic deployment

### Step 4: Test Your API
1. Visit your Vercel URL: `https://your-app.vercel.app`
2. Open browser Developer Tools (F12)
3. Go to **Network** tab
4. Try submitting the form
5. Check if API calls to `/api/forms/submit` are successful

### Step 5: Test Health Endpoint
Visit: `https://your-app.vercel.app/api/health`

You should see:
```json
{"status":"OK","message":"Server is running"}
```

## Troubleshooting

### If you still get "Failed to fetch":

1. **Check Vercel Function Logs**
   - Go to **Deployments** → Click on your deployment → **Functions** tab
   - Look for errors in the serverless function logs

2. **Verify MongoDB Connection**
   - Make sure `MONGODB_URI` is set correctly
   - Check MongoDB Atlas Network Access (allow `0.0.0.0/0` for Vercel)
   - Test connection string format

3. **Check CORS**
   - The code now allows all Vercel domains automatically
   - If you have a custom domain, you may need to add it to the CORS list

4. **Verify Environment Variables**
   - Make sure variables are set for **all environments** (Production, Preview, Development)
   - Variable names must match exactly (case-sensitive)

5. **Check Browser Console**
   - Open Developer Tools (F12)
   - Look for specific error messages
   - Check Network tab to see the exact request/response

### Common Issues:

**Issue**: "MongoDB connection error"
- **Fix**: Check `MONGODB_URI` is correct and MongoDB Atlas allows connections from Vercel

**Issue**: "Route not found" (404)
- **Fix**: Make sure `vercel.json` is configured correctly and `api/index.js` exists

**Issue**: "CORS error"
- **Fix**: The code now automatically allows all Vercel domains. If using a custom domain, add it to the CORS list in `api/index.js`

## Alternative: Deploy Backend Separately

If you prefer to deploy your backend separately (not as serverless functions):

1. **Deploy backend to Railway, Render, or Heroku**
2. **Get your backend URL** (e.g., `https://your-backend.railway.app`)
3. **Set `REACT_APP_API_URL` in Vercel** to: `https://your-backend.railway.app/api`
4. **Update CORS** in your backend to allow your Vercel domain

## Need Help?

Check the logs:
- Vercel Dashboard → Your Project → Deployments → Click deployment → Functions → View logs

The serverless function logs will show:
- MongoDB connection status
- API request details
- Any errors that occur

