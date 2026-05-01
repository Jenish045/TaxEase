const express = require('express');
const router = express.Router();
const Invoice = require('../models/invoices');

// ==================== CREATE INVOICE ====================
router.post('/create', async (req, res) => {
  try {
    const {
      invoiceNumber,
      invoiceDate,
      dueDate,
      clientName,
      clientEmail,
      clientPhone,
      clientAddress,
      items,
      sgstRate,
      cgstRate,
      igstRate,
      notes
    } = req.body;

    console.log('[Invoice] Create request:', invoiceNumber);

    // Validation
    if (!invoiceNumber || !clientName || !clientEmail || !items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    // Check if invoice number already exists
    const existingInvoice = await Invoice.findOne({ invoiceNumber });
    if (existingInvoice) {
      return res.status(400).json({
        success: false,
        message: 'Invoice number already exists'
      });
    }

    // Calculate item amounts
    const calculatedItems = items.map(item => ({
      ...item,
      amount: item.quantity * item.unitPrice
    }));

    // Create invoice
    const newInvoice = new Invoice({
      invoiceNumber,
      invoiceDate: invoiceDate || new Date(),
      dueDate,
      userId: req.body.userId,
      clientName,
      clientEmail,
      clientPhone,
      clientAddress,
      items: calculatedItems,
      sgstRate: sgstRate || 0,
      cgstRate: cgstRate || 0,
      igstRate: igstRate || 0,
      notes
    });

    // Calculate totals
    newInvoice.calculateTotals();

    await newInvoice.save();
    console.log('[Invoice] Created:', invoiceNumber);

    res.status(201).json({
      success: true,
      message: 'Invoice created successfully',
      data: newInvoice
    });

  } catch (error) {
    console.error('[Invoice] Create error:', error.message);
    res.status(500).json({
      success: false,
      message: error.message || 'Error creating invoice'
    });
  }
});

// ==================== GET ALL INVOICES ====================
router.get('/list/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    console.log('[Invoice] Get invoices for user:', userId);

    if (!userId || userId === 'undefined') {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID'
      });
    }

    // ⭐ OPTIMIZED QUERY
    const invoices = await Invoice.find({ userId })
      .lean() // Fast read-only query
      .sort({ invoiceDate: -1 });

    console.log(`[Invoice] Found ${invoices.length} invoices`);

    res.json({
      success: true,
      data: invoices,
      count: invoices.length
    });

  } catch (error) {
    console.error('[Invoice] Get invoices error:', error.message);
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching invoices'
    });
  }
});

// ==================== GET SINGLE INVOICE ====================
router.get('/:invoiceId', async (req, res) => {
  try {
    const { invoiceId } = req.params;

    console.log('[Invoice] Get single invoice:', invoiceId);

    const invoice = await Invoice.findById(invoiceId);

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found'
      });
    }

    console.log('[Invoice] Found invoice:', invoiceId);

    res.json({
      success: true,
      data: invoice
    });

  } catch (error) {
    console.error('[Invoice] Get single invoice error:', error.message);
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching invoice'
    });
  }
});

// ==================== UPDATE INVOICE ====================
router.put('/update/:invoiceId', async (req, res) => {
  try {
    const { invoiceId } = req.params;
    const updates = req.body;

    console.log('[Invoice] Update request:', invoiceId);

    const invoice = await Invoice.findByIdAndUpdate(invoiceId, updates, { new: true });

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found'
      });
    }

    console.log('[Invoice] Updated:', invoiceId);

    res.json({
      success: true,
      message: 'Invoice updated successfully',
      data: invoice
    });

  } catch (error) {
    console.error('[Invoice] Update error:', error.message);
    res.status(500).json({
      success: false,
      message: error.message || 'Error updating invoice'
    });
  }
});

// ==================== DELETE INVOICE ====================
router.delete('/delete/:invoiceId', async (req, res) => {
  try {
    const { invoiceId } = req.params;

    console.log('[Invoice] Delete request:', invoiceId);

    const invoice = await Invoice.findByIdAndDelete(invoiceId);

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found'
      });
    }

    console.log('[Invoice] Deleted:', invoiceId);

    res.json({
      success: true,
      message: 'Invoice deleted successfully'
    });

  } catch (error) {
    console.error('[Invoice] Delete error:', error.message);
    res.status(500).json({
      success: false,
      message: error.message || 'Error deleting invoice'
    });
  }
});

module.exports = router;