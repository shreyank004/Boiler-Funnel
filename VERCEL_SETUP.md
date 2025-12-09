# Vercel Deployment Setup Guide

This guide explains how to configure your application for deployment on Vercel.

## Environment Variables Setup

### Frontend Environment Variables (in Vercel Dashboard)

Go to your Vercel project settings → Environment Variables and add:

1. **REACT_APP_API_URL** (Optional)
   - For Vercel deployments, leave this empty or set to `/api` (relative path)
   - The app will automatically detect Vercel and use relative paths
   - Only set this if you're using an external API server

2. **REACT_APP_STRIPE_PUBLISHABLE_KEY**
   ```
   pk_test_51S1KU022PWcmotn3tG5GqKpZmNHj0zKeu93fAo36F6ZuXgvVnO3yvrT65sQ0cKxe8Y0yRa7lAwyfAcf1NF4ggPGf00dtXCPETL
   ```

3. **REACT_APP_GETADDRESS_API_KEY** (Optional)
   - Only needed if you want to use getAddress.io for postcode lookup
   - If not set, the app will fall back to Google Places API or sample addresses
   - Get your API key from: https://www.getaddress.io/

### Backend Environment Variables (in Vercel Dashboard)

Add these to the same Vercel project (they're used by the serverless API functions):

1. **MONGODB_URI**
   ```
   mongodb+srv://username:password@cluster.mongodb.net/boiler-quotes
   ```
   Or for local MongoDB Atlas:
   ```
   mongodb://localhost:27017/boiler-quotes
   ```

2. **STRIPE_SECRET_KEY**
   ```
   sk_test_51S1KU022PWcmotn34fEmpQtGJSGnr3SpEnbVV13awsygtHojF8OTQo9cJnoW1ZjHmo7dRyJEbCbk4VZG8uMNnuru00HK7BH6Dp
   ```

3. **PORT** (Optional)
   - Vercel automatically sets this, but you can override if needed

## How It Works

### API Routing

Vercel uses `vercel.json` to route API requests:
- Requests to `/api/*` are handled by `api/index.js` (serverless function)
- The frontend automatically detects Vercel and uses relative paths (`/api`)

### CORS Configuration

The backend (`api/index.js`) is configured to allow:
- `https://boiler-funnel.vercel.app`
- `https://www.boiler-funnel.vercel.app`
- Local development origins

### Automatic Detection

The application automatically detects if it's running on Vercel:
- **On Vercel**: Uses relative paths (`/api`) - API calls go to serverless functions
- **Local development**: Uses `http://localhost:5000/api`
- **Network access**: Uses current hostname with port 5000

## Deployment Steps

1. **Push your code to GitHub**
   ```bash
   git add .
   git commit -m "Prepare for Vercel deployment"
   git push origin main
   ```

2. **Connect to Vercel**
   - Go to https://vercel.com
   - Import your GitHub repository
   - Vercel will auto-detect React app settings

3. **Set Environment Variables**
   - In Vercel project settings → Environment Variables
   - Add all the variables listed above
   - Make sure to set them for **Production**, **Preview**, and **Development** environments

4. **Deploy**
   - Vercel will automatically deploy on every push to main branch
   - Or manually trigger a deployment from the dashboard

## Troubleshooting

### CORS Errors

If you see CORS errors:
1. Check that `api/index.js` has the correct CORS configuration
2. Verify your Vercel domain is in the allowed origins list
3. Make sure environment variables are set correctly

### API Not Found (404)

If API calls return 404:
1. Verify `vercel.json` is configured correctly
2. Check that `api/index.js` exists and exports the Express app
3. Ensure routes are set up correctly in `api/index.js`

### MongoDB Connection Issues

If MongoDB connection fails:
1. Verify `MONGODB_URI` is set correctly in Vercel environment variables
2. Check MongoDB Atlas IP whitelist (should allow all IPs `0.0.0.0/0` for Vercel)
3. Verify MongoDB connection string format

### getAddress.io Errors

If you see getAddress.io errors:
1. The app will automatically skip getAddress.io if API key is not set
2. It will fall back to Google Places API or sample addresses
3. To use getAddress.io, set `REACT_APP_GETADDRESS_API_KEY` in Vercel

## Testing

After deployment:
1. Visit your Vercel URL: `https://boiler-funnel.vercel.app`
2. Test the form submission
3. Check browser console for any errors
4. Verify API calls are working (check Network tab)

## Production Checklist

- [ ] All environment variables are set in Vercel
- [ ] MongoDB connection is working
- [ ] Stripe keys are configured (test keys for testing)
- [ ] CORS is properly configured
- [ ] API routes are working (`/api/health` should return OK)
- [ ] Form submissions are being saved to MongoDB
- [ ] Product creation in admin panel works
- [ ] Payment processing works (if implemented)

## Security Notes

⚠️ **Important for Production:**

1. **Use Production Stripe Keys**: Replace test keys with live keys
2. **Restrict CORS**: Update CORS to only allow your production domain
3. **MongoDB Security**: Use strong passwords and restrict IP access
4. **Environment Variables**: Never commit sensitive keys to Git
5. **HTTPS**: Vercel automatically provides HTTPS - always use HTTPS in production

