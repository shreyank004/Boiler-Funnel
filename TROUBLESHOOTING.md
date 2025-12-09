# Troubleshooting "Failed to fetch" Error

If you're getting a "Failed to fetch" error when trying to process payments, follow these steps:

## 1. Check if Backend Server is Running

The most common cause is that the backend server is not running. 

**To start the backend server:**
```bash
cd server
npm start
```

Or for development with auto-reload:
```bash
cd server
npm run dev
```

You should see: `Server is running on port 5000`

## 2. Verify Environment Variables

### Backend (.env in `server/` directory)
Make sure you have a `.env` file in the `server/` directory with:
```env
STRIPE_SECRET_KEY=sk_test_YOUR_SECRET_KEY_HERE
PORT=5000
MONGODB_URI=mongodb://localhost:27017/boiler-quotes
```

### Frontend (.env in root directory)
Make sure you have a `.env` file in the root directory with:
```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_PUBLISHABLE_KEY_HERE
```

**Important:** After creating or updating `.env` files, restart both servers!

## 3. Test Backend Connection

Open your browser and navigate to:
```
http://localhost:5000/api/health
```

You should see:
```json
{"status":"OK","message":"Server is running"}
```

If this doesn't work, the backend server is not running or not accessible.

## 4. Check Browser Console

Open the browser's Developer Tools (F12) and check:
- **Console tab**: Look for any error messages
- **Network tab**: Check if the request to `/api/payments/create-intent` is failing

## 5. Common Issues and Solutions

### Issue: "Cannot connect to server"
**Solution:** Make sure the backend server is running on port 5000

### Issue: "Stripe is not configured"
**Solution:** Check that `STRIPE_SECRET_KEY` is set in `server/.env` file

### Issue: "Invalid Stripe API key"
**Solution:** Verify your Stripe secret key is correct and starts with `sk_test_`

### Issue: CORS errors
**Solution:** The server already has CORS enabled. If you still see CORS errors, make sure both servers are running

## 6. Verify Stripe Keys

Make sure you're using:
- **Publishable Key** (frontend): Starts with `pk_test_`
- **Secret Key** (backend): Starts with `sk_test_`

Both keys should be from the same Stripe account and both should be test keys (not live keys).

## 7. Test the Payment Endpoint Directly

You can test the payment endpoint using curl or Postman:

```bash
curl -X POST http://localhost:5000/api/payments/create-intent \
  -H "Content-Type: application/json" \
  -d '{"amount": 2600.00, "currency": "gbp"}'
```

This should return a `clientSecret` if everything is working correctly.

## Still Having Issues?

1. Check that both frontend and backend are running
2. Verify all environment variables are set correctly
3. Check the server console for error messages
4. Check the browser console for detailed error messages
5. Make sure you're using the correct Stripe test keys

