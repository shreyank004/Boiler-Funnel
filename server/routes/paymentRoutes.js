const express = require('express');
const router = express.Router();
// Initialize Stripe lazily to ensure env vars are loaded
let stripe;
const getStripe = () => {
  if (!stripe) {
    const stripeKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeKey) {
      throw new Error('STRIPE_SECRET_KEY is not set in environment variables');
    }
    stripe = require('stripe')(stripeKey);
  }
  return stripe;
};
const FormSubmission = require('../models/FormSubmission');

// Create a payment intent
router.post('/create-intent', async (req, res) => {
  try {
    // Check if Stripe is configured
    if (!process.env.STRIPE_SECRET_KEY) {
      console.error('STRIPE_SECRET_KEY is not set in environment variables');
      return res.status(500).json({ 
        error: 'Stripe is not configured. Please set STRIPE_SECRET_KEY in your .env file.' 
      });
    }

    const { amount, currency = 'gbp', submissionId, metadata = {} } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    // Convert amount to pence (Stripe uses smallest currency unit)
    const amountInPence = Math.round(amount * 100);

    const stripeInstance = getStripe();
    const paymentIntent = await stripeInstance.paymentIntents.create({
      amount: amountInPence,
      currency: currency,
      metadata: {
        submissionId: submissionId || '',
        ...metadata
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    res.json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    
    // Provide more detailed error information
    let errorMessage = 'Failed to create payment intent';
    if (error.type === 'StripeAuthenticationError') {
      errorMessage = 'Invalid Stripe API key. Please check your STRIPE_SECRET_KEY in the .env file.';
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    res.status(500).json({
      error: errorMessage,
      details: error.type || 'Unknown error'
    });
  }
});

// Confirm payment and update form submission
router.post('/confirm', async (req, res) => {
  try {
    const { paymentIntentId, submissionId } = req.body;

    if (!paymentIntentId) {
      return res.status(400).json({ error: 'Payment intent ID is required' });
    }

    // Retrieve the payment intent from Stripe
    const stripeInstance = getStripe();
    const paymentIntent = await stripeInstance.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status === 'succeeded') {
      // Update form submission with payment information
      if (submissionId) {
        await FormSubmission.findByIdAndUpdate(
          submissionId,
          {
            paymentStatus: 'completed',
            paymentIntentId: paymentIntentId,
            paymentAmount: paymentIntent.amount / 100, // Convert from pence
            paymentDate: new Date()
          },
          { new: true }
        );
      }

      res.json({
        success: true,
        message: 'Payment confirmed successfully',
        paymentIntent: {
          id: paymentIntent.id,
          status: paymentIntent.status,
          amount: paymentIntent.amount / 100
        }
      });
    } else {
      res.status(400).json({
        error: 'Payment not completed',
        status: paymentIntent.status
      });
    }
  } catch (error) {
    console.error('Error confirming payment:', error);
    res.status(500).json({
      error: 'Failed to confirm payment',
      details: error.message
    });
  }
});

module.exports = router;

