const mongoose = require('mongoose');

const FormSubmissionSchema = new mongoose.Schema({
  // Form data
  fuelType: {
    type: String,
    enum: ['mains-gas', 'lpg', 'unknown-fuel'],
    default: null
  },
  boilerType: {
    type: String,
    enum: ['combi', 'regular', 'system', 'back-boiler'],
    default: null
  },
  propertyType: {
    type: String,
    enum: ['detached', 'bungalow', 'flat-apartment'],
    default: null
  },
  bedroomCount: {
    type: String,
    enum: ['1', '2', '3', '4', '5+'],
    default: null
  },
  bathtubCount: {
    type: String,
    enum: ['none', '1', '2', '3+'],
    default: null
  },
  showerCubicleCount: {
    type: String,
    enum: ['none', '1', '2+'],
    default: null
  },
  flueExitType: {
    type: String,
    enum: ['external-wall', 'roof'],
    default: null
  },
  replacementTiming: {
    type: String,
    enum: ['asap', 'this-week', 'next-week'],
    default: null
  },
  postcode: {
    type: String,
    default: ''
  },
  address: {
    type: String,
    default: ''
  },
  
  // Contact data
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  
  // Product selection (optional)
  selectedProduct: {
    id: String,
    name: String,
    brand: String,
    price: String
  },
  
  // Finance calculator data (optional)
  financeDetails: {
    depositPercentage: Number,
    depositAmount: Number,
    paymentOption: {
      months: Number,
      apr: Number
    },
    monthlyPayment: Number,
    totalPayable: Number
  },
  
  // Payment information (optional)
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: null
  },
  paymentIntentId: {
    type: String,
    default: null
  },
  paymentAmount: {
    type: Number,
    default: null
  },
  paymentDate: {
    type: Date,
    default: null
  },
  
  // Timestamps
  submittedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('FormSubmission', FormSubmissionSchema);

