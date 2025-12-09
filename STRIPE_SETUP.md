# Stripe Payment Integration Setup

This guide will help you set up Stripe payment integration for the application.

## Environment Variables Setup

### Backend (.env file in `server/` directory)

Create a `.env` file in the `server/` directory with the following content:

env
# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/boiler-quotes

# Server Port
PORT=5000

STRIPE_SECRET_KEY=sk_test_YOUR_SECRET_KEY_HERE



Create a `.env` file in the root directory with the following content:


REACT_APP_API_URL=http://localhost:5000/api


REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_PUBLISHABLE_KEY_HERE


**Important:** After creating/updating the `.env` file, restart your development server for the changes to take effect.

Use Stripe's test card numbers for testing:

- **Success**: `4242 4242 4242 4242`
- **Decline**: `4000 0000 0000 0002`
- **Requires Authentication**: `4000 0025 0000 3155`

Use any future expiry date (e.g., 12/34) and any 3-digit CVC.

## API Endpoints

### POST `/api/payments/create-intent`
Creates a Stripe payment intent.

**Request Body:**
```json
{
  "amount": 2600.00,
  "currency": "gbp",
  "submissionId": "optional_submission_id",
  "metadata": {}
}
```

**Response:**
```json
{
  "success": true,
  "clientSecret": "pi_xxx_secret_xxx",
  "paymentIntentId": "pi_xxx"
}
```

### POST `/api/payments/confirm`
Confirms a payment and updates the form submission.

**Request Body:**
```json
{
  "paymentIntentId": "pi_xxx",
  "submissionId": "optional_submission_id"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Payment confirmed successfully",
  "paymentIntent": {
    "id": "pi_xxx",
    "status": "succeeded",
    "amount": 2600.00
  }
}
```

## Security Notes

- The Stripe secret key should NEVER be exposed in frontend code
- Always use environment variables for sensitive keys
- Never commit `.env` files to version control
- Use HTTPS in production

