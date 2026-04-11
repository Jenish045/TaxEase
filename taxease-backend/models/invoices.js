const express = require('express');
const router = express.Router();
const Invoice = require('./Invoice');
const User = require('./User');

// Middleware to verify user
const verifyUser = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }
  // For now, we'll add proper JWT verification later
  req.userId = req.body.userId; // This should come from JWT token
  next();
};

// ==================== CREATE INVOICE ====================
router.post('/create', async (req, res) => {
  try {
    const { invoiceNumber, invoiceDate, dueDate, clientName, clientEmail, clientPhone, clientAddress, items, sgstRate, cgstRate, igstRate, notes } = req.body;

    console.log('📝 CREATE INVOICE REQUEST:', invoiceNumber);

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
    console.log('✅ Invoice created:', invoiceNumber);

    res.status(201).json({
      success: true,
      message: 'Invoice created successfully',
      data: newInvoice
    });

  } catch (error) {
    console.error('❌ CREATE INVOICE ERROR:', error);
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

    console.log('🔍 GET INVOICES FOR USER:', userId);

    const invoices = await Invoice.find({ userId })
      .sort({ invoiceDate: -1 });

    console.log(`✅ Found ${invoices.length} invoices`);

    res.json({
      success: true,
      data: invoices,
      count: invoices.length
    });

  } catch (error) {
    console.error('❌ GET INVOICES ERROR:', error);
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

    console.log('🔍 GET INVOICE:', invoiceId);

    const invoice = await Invoice.findById(invoiceId);

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found'
      });
    }

    console.log('✅ Invoice found:', invoiceId);

    res.json({
      success: true,
      data: invoice
    });

  } catch (error) {
    console.error('❌ GET INVOICE ERROR:', error);
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

    console.log('📝 UPDATE INVOICE:', invoiceId);

    let invoice = await Invoice.findById(invoiceId);

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found'
      });
    }

    // Update fields
    Object.assign(invoice, updates);

    // Recalculate if items changed
    if (updates.items) {
      invoice.items = updates.items.map(item => ({
        ...item,
        amount: item.quantity * item.unitPrice
      }));
    }

    // Recalculate totals
    invoice.calculateTotals();

    await invoice.save();
    console.log('✅ Invoice updated:', invoiceId);

    res.json({
      success: true,
      message: 'Invoice updated successfully',
      data: invoice
    });

  } catch (error) {
    console.error('❌ UPDATE INVOICE ERROR:', error);
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

    console.log('🗑️ DELETE INVOICE:', invoiceId);

    const invoice = await Invoice.findByIdAndDelete(invoiceId);

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found'
      });
    }

    console.log('✅ Invoice deleted:', invoiceId);

    res.json({
      success: true,
      message: 'Invoice deleted successfully'
    });

  } catch (error) {
    console.error('❌ DELETE INVOICE ERROR:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error deleting invoice'
    });
  }
});

// ==================== UPDATE INVOICE STATUS ====================
router.patch('/status/:invoiceId', async (req, res) => {
  try {
    const { invoiceId } = req.params;
    const { status } = req.body;

    console.log('📝 UPDATE STATUS:', invoiceId, status);

    const invoice = await Invoice.findByIdAndUpdate(
      invoiceId,
      { status, updatedAt: new Date() },
      { new: true }
    );

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found'
      });
    }

    console.log('✅ Status updated:', status);

    res.json({
      success: true,
      message: 'Invoice status updated',
      data: invoice
    });

  } catch (error) {
    console.error('❌ UPDATE STATUS ERROR:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error updating status'
    });
  }
});

module.exports = router;