const express = require('express');
const router = express.Router();
const FormSubmission = require('../models/FormSubmission');

// Create a new form submission
router.post('/submit', async (req, res) => {
  try {
    const formData = req.body;
    
    // Validate required fields
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone) {
      return res.status(400).json({ 
        error: 'Missing required fields: firstName, lastName, email, and phone are required' 
      });
    }
    
    // Create new form submission
    const submission = new FormSubmission(formData);
    await submission.save();
    
    res.status(201).json({ 
      success: true, 
      message: 'Form submission saved successfully',
      id: submission._id 
    });
  } catch (error) {
    console.error('Error saving form submission:', error);
    res.status(500).json({ 
      error: 'Failed to save form submission',
      details: error.message 
    });
  }
});

// Get all form submissions
router.get('/all', async (req, res) => {
  try {
    const submissions = await FormSubmission.find().sort({ createdAt: -1 });
    res.json({ success: true, data: submissions });
  } catch (error) {
    console.error('Error fetching form submissions:', error);
    res.status(500).json({ 
      error: 'Failed to fetch form submissions',
      details: error.message 
    });
  }
});

// Get a single form submission by ID
router.get('/:id', async (req, res) => {
  try {
    const submission = await FormSubmission.findById(req.params.id);
    if (!submission) {
      return res.status(404).json({ error: 'Form submission not found' });
    }
    res.json({ success: true, data: submission });
  } catch (error) {
    console.error('Error fetching form submission:', error);
    res.status(500).json({ 
      error: 'Failed to fetch form submission',
      details: error.message 
    });
  }
});

// Update form submission (e.g., add product selection or finance details)
router.put('/:id', async (req, res) => {
  try {
    const submission = await FormSubmission.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!submission) {
      return res.status(404).json({ error: 'Form submission not found' });
    }
    
    res.json({ 
      success: true, 
      message: 'Form submission updated successfully',
      data: submission 
    });
  } catch (error) {
    console.error('Error updating form submission:', error);
    res.status(500).json({ 
      error: 'Failed to update form submission',
      details: error.message 
    });
  }
});

// Delete a form submission by ID
router.delete('/:id', async (req, res) => {
  try {
    const submission = await FormSubmission.findByIdAndDelete(req.params.id);
    
    if (!submission) {
      return res.status(404).json({ error: 'Form submission not found' });
    }
    
    res.json({ 
      success: true, 
      message: 'Form submission deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting form submission:', error);
    res.status(500).json({ 
      error: 'Failed to delete form submission',
      details: error.message 
    });
  }
});

module.exports = router;

