const express = require('express');
const router = express.Router();
const taxController = require('../controllers/taxController');
const authMiddleware = require('../middleware/auth');

// All tax routes require authentication
router.use(authMiddleware.verifyToken);

// Create tax summary for period
router.post('/', taxController.createTaxSummary);

// Get all tax summaries
router.get('/', taxController.getTaxSummaries);

// Get tax summary for specific period
router.get('/:period', taxController.getTaxSummary);

// Update tax summary
router.put('/:id', taxController.updateTaxSummary);

module.exports = router;