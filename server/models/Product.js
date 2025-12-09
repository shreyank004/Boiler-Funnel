const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  brand: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  price: {
    type: String,
    required: true
  },
  originalPrice: {
    type: String,
    default: null
  },
  rating: {
    type: Number,
    required: true,
    min: 0,
    max: 5
  },
  category: {
    type: String,
    enum: ['good', 'better', 'best'],
    required: true
  },
  warranty: {
    type: String,
    required: true
  },
  features: {
    type: [String],
    default: []
  },
  expertOpinion: {
    type: String,
    required: true
  },
  monthlyPayment: {
    type: String,
    default: null
  },
  zeroApr: {
    type: String,
    default: null
  },
  suitableBedrooms: {
    type: [String],
    default: []
  },
  boilerType: {
    type: String,
    enum: ['combi', 'regular', 'system', 'back-boiler'],
    default: null
  },
  imageUrl: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Product', ProductSchema);

