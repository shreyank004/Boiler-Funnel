const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const upload = require('../middleware/upload');

// Get all products
router.get('/all', async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json({ success: true, data: products });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ 
      error: 'Failed to fetch products',
      details: error.message 
    });
  }
});

// Get a single product by ID
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json({ success: true, data: product });
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ 
      error: 'Failed to fetch product',
      details: error.message 
    });
  }
});

// Create a new product (with optional image upload)
// Use upload.any() to handle both file upload and form fields
router.post('/create', upload.any(), async (req, res) => {
  try {
    // Find the image file if uploaded
    const imageFile = req.files && req.files.length > 0 
      ? req.files.find(f => f.fieldname === 'image') 
      : null;
    
    // Debug: log raw request data
    console.log('=== PRODUCT CREATE REQUEST ===');
    console.log('Content-Type:', req.headers['content-type']);
    console.log('Raw req.body:', req.body);
    console.log('req.body type:', typeof req.body);
    console.log('req.body keys:', Object.keys(req.body || {}));
    console.log('Files uploaded:', req.files ? req.files.map(f => ({ field: f.fieldname, filename: f.filename })) : 'none');
    console.log('Image file:', imageFile ? imageFile.filename : 'none');
    
    // Get product data from request body (works for both JSON and form-data)
    // If req.body is empty but we have files, multer might not have parsed fields correctly
    let productData = { ...req.body };
    
    // If body is empty but we have a multipart request, try to get data from files metadata
    // This shouldn't happen, but let's be safe
    if (Object.keys(productData).length === 0 && req.headers['content-type'] && req.headers['content-type'].includes('multipart')) {
      console.warn('WARNING: req.body is empty but multipart request detected');
    }
    
    // Debug: log received data
    console.log('Parsed product data:', JSON.stringify(productData, null, 2));
    console.log('Product data keys:', Object.keys(productData));
    console.log('Product data values:', Object.values(productData));
    
    // Validate required fields - check for empty strings as well
    const requiredFields = ['name', 'brand', 'description', 'price', 'rating', 'category', 'warranty', 'expertOpinion'];
    const missingFields = requiredFields.filter(field => {
      const value = productData[field];
      return !value || (typeof value === 'string' && value.trim() === '');
    });
    
    if (missingFields.length > 0) {
      console.log('Missing fields:', missingFields);
      console.log('All received fields:', Object.keys(productData));
      return res.status(400).json({ 
        error: `Missing required fields: ${missingFields.join(', ')} are required`,
        receivedFields: Object.keys(productData),
        missingFields: missingFields
      });
    }
    
    // Validate category
    if (!['good', 'better', 'best'].includes(productData.category)) {
      return res.status(400).json({ 
        error: 'Invalid category. Must be one of: good, better, best' 
      });
    }
    
    // Handle image upload
    if (imageFile) {
      // Construct image URL - will be served as static file
      productData.imageUrl = `/uploads/products/${imageFile.filename}`;
    }
    
    // Parse features and suitableBedrooms if they're strings or JSON strings
    if (typeof productData.features === 'string' && productData.features.trim() !== '') {
      try {
        // Try to parse as JSON first (in case it was stringified)
        const parsed = JSON.parse(productData.features);
        // Ensure it's an array
        productData.features = Array.isArray(parsed) ? parsed : [parsed];
      } catch (parseError) {
        // If not JSON, treat as comma-separated
        try {
          productData.features = productData.features
            .split(',')
            .map(f => f.trim())
            .filter(f => f.length > 0);
        } catch (splitError) {
          console.error('Error parsing features:', splitError);
          productData.features = [];
        }
      }
    } else if (!productData.features) {
      productData.features = [];
    }
    
    if (typeof productData.suitableBedrooms === 'string' && productData.suitableBedrooms.trim() !== '') {
      try {
        // Try to parse as JSON first (in case it was stringified)
        const parsed = JSON.parse(productData.suitableBedrooms);
        // Ensure it's an array
        productData.suitableBedrooms = Array.isArray(parsed) ? parsed : [parsed];
      } catch (parseError) {
        // If not JSON, treat as comma-separated
        try {
          productData.suitableBedrooms = productData.suitableBedrooms
            .split(',')
            .map(b => b.trim())
            .filter(b => b.length > 0);
        } catch (splitError) {
          console.error('Error parsing suitableBedrooms:', splitError);
          productData.suitableBedrooms = [];
        }
      }
    } else if (!productData.suitableBedrooms) {
      productData.suitableBedrooms = [];
    }
    
    // Convert rating to number if it's a string
    if (typeof productData.rating === 'string') {
      productData.rating = parseFloat(productData.rating);
    }
    
    // Ensure rating is a valid number
    if (isNaN(productData.rating) || productData.rating < 0 || productData.rating > 5) {
      return res.status(400).json({ 
        error: 'Rating must be a number between 0 and 5' 
      });
    }
    
    // Create new product
    const product = new Product(productData);
    await product.save();
    
    res.status(201).json({ 
      success: true, 
      message: 'Product created successfully',
      data: product
    });
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ 
      error: 'Failed to create product',
      details: error.message 
    });
  }
});

// Update a product
router.put('/:id', async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    res.json({ 
      success: true, 
      message: 'Product updated successfully',
      data: product 
    });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ 
      error: 'Failed to update product',
      details: error.message 
    });
  }
});

// Delete a product
router.delete('/:id', async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    res.json({ 
      success: true, 
      message: 'Product deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ 
      error: 'Failed to delete product',
      details: error.message 
    });
  }
});

module.exports = router;

