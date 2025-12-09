const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();

// Middleware
// Configure CORS to allow Vercel and other origins
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // List of allowed origins
    const allowedOrigins = [
      'https://boiler-funnel.vercel.app',
      'https://www.boiler-funnel.vercel.app',
      'http://localhost:3000',
      'http://localhost:3001',
      'http://127.0.0.1:3000',
    ];
    
    // Allow if origin is in the allowed list or in development
    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === 'development') {
      callback(null, true);
    } else {
      // In production, log but allow for now (you can change this to reject)
      console.log('CORS: Allowing origin:', origin);
      callback(null, true);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Debug middleware - log all requests (before routes)
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  console.log('Query:', req.query);
  console.log('Body keys:', Object.keys(req.body || {}));
  next();
});

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, '../server/uploads')));

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/boiler-quotes';

// Connect to MongoDB (reuse connection if exists)
let mongooseConnection = null;

async function connectDB() {
  if (mongooseConnection) {
    return mongooseConnection;
  }
  
  try {
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    mongooseConnection = mongoose.connection;
    console.log('Connected to MongoDB');
    return mongooseConnection;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
}

// Import routes
const formRoutes = require('../server/routes/formRoutes');
const paymentRoutes = require('../server/routes/paymentRoutes');
const productRoutes = require('../server/routes/productRoutes');

// Mount routes with /api prefix (Vercel passes full path including /api)
app.use('/api/forms', formRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/products', productRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({ status: 'OK', message: 'API is running' });
});

// Catch-all for unmatched routes (must be last)
app.use((req, res) => {
  console.error('Route not found:', req.method, req.path);
  res.status(404).json({ 
    error: 'Route not found',
    method: req.method,
    path: req.path,
    message: `The route ${req.method} ${req.path} was not found on this server`
  });
});

// Initialize DB connection
connectDB().catch(console.error);

// Export for Vercel serverless
// For Vercel, we need to handle the path correctly
// Vercel routes /api/* to this file, so paths come without /api prefix
module.exports = app;

