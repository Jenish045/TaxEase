const Invoice = require('../models/Invoice');
const User = require('../models/user');
const logger = require('../utils/logger');
const CONSTANTS = require('../config/constants');
const crypto = require('crypto');
const fs = require('fs');
const TaxCalculator = require('../utils/taxCalculator');

const invoiceController = {
  // Create invoice
  createInvoice: async (req, res) => {
    try {
      const {
        invoiceNumber,
        invoiceDate,
        dueDate,
        sellerName,
        sellerGSTIN,
        buyerName,
        buyerGSTIN,
        subtotal,
        sgst,
        cgst,
        igst,
        otherTaxes,
        totalAmount,
        lineItems
      } = req.body;

      // Check user quota
      const user = await User.findById(req.user.userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: CONSTANTS.ERROR_MESSAGES.USER_NOT_FOUND
        });
      }

      const remainingQuota = user.getRemainingQuota();
      if (remainingQuota === 0) {
        return res.status(403).json({
          success: false,
          message: 'Invoice quota exceeded. Upgrade your plan.',
          code: 'QUOTA_EXCEEDED'
        });
      }

      // Check if invoice already exists
      const existingInvoice = await Invoice.findOne({
        userId: req.user.userId,
        invoiceNumber
      });

      if (existingInvoice) {
        return res.status(409).json({
          success: false,
          message: 'Invoice with this number already exists',
          code: 'DUPLICATE_INVOICE'
        });
      }

      // Create new invoice
      const invoice = new Invoice({
        userId: req.user.userId,
        invoiceNumber,
        invoiceDate,
        dueDate,
        sellerName,
        sellerGSTIN,
        buyerName,
        buyerGSTIN,
        subtotal: parseFloat(subtotal),
        sgst: parseFloat(sgst) || 0,
        cgst: parseFloat(cgst) || 0,
        igst: parseFloat(igst) || 0,
        otherTaxes: parseFloat(otherTaxes) || 0,
        totalAmount: parseFloat(totalAmount),
        lineItems: lineItems || [],
        status: CONSTANTS.INVOICE_STATUS.COMPLETED,
        documentType: CONSTANTS.DOCUMENT_TYPE.TEXT_BASED,
        approved: true
      });

      // Calculate and set total tax
      invoice.calculateTotalTax();

      // Generate file hash for duplicate detection
      invoice.fileHash = crypto
        .createHash('md5')
        .update(`${invoiceNumber}${invoiceDate}${totalAmount}`)
        .digest('hex');

      // Validate amounts
      const validation = TaxCalculator.validateInvoiceAmounts(invoice);
      if (!validation.isValid) {
        invoice.addAnomaly(
          CONSTANTS.ANOMALY_TYPES.AMOUNT_MISMATCH,
          CONSTANTS.SEVERITY.MEDIUM,
          `Amount mismatch: Expected ${validation.expectedTotal}, Got ${totalAmount}`
        );
      }

      await invoice.save();

      // Update user invoice count
      user.invoiceCount += 1;
      await user.save();

      logger.info(`Invoice created: ${invoice._id}`);

      res.status(201).json({
        success: true,
        message: CONSTANTS.SUCCESS_MESSAGES.INVOICE_UPLOADED,
        data: {
          invoice
        }
      });
    } catch (error) {
      logger.error('Create invoice error:', error);
      res.status(500).json({
        success: false,
        message: CONSTANTS.ERROR_MESSAGES.SERVER_ERROR
      });
    }
  },

  // Get all invoices for user
  getInvoices: async (req, res) => {
    try {
      const { status, page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

      const pageNum = Math.max(1, parseInt(page));
      const limitNum = Math.min(parseInt(limit) || 10, CONSTANTS.MAX_PAGE_SIZE);
      const skip = (pageNum - 1) * limitNum;

      // Build filter
      const filter = { userId: req.user.userId };
      if (status && Object.values(CONSTANTS.INVOICE_STATUS).includes(status)) {
        filter.status = status;
      }

      // Build sort
      const sortObj = {};
      sortObj[sortBy] = sortOrder === 'asc' ? 1 : -1;

      // Get invoices
      const invoices = await Invoice.find(filter)
        .select('-extractedText')
        .sort(sortObj)
        .skip(skip)
        .limit(limitNum)
        .lean();

      const total = await Invoice.countDocuments(filter);

      res.status(200).json({
        success: true,
        message: CONSTANTS.SUCCESS_MESSAGES.DATA_RETRIEVED,
        data: {
          invoices,
          pagination: {
            page: pageNum,
            limit: limitNum,
            total,
            pages: Math.ceil(total / limitNum)
          }
        }
      });
    } catch (error) {
      logger.error('Get invoices error:', error);
      res.status(500).json({
        success: false,
        message: CONSTANTS.ERROR_MESSAGES.SERVER_ERROR
      });
    }
  },

  // Get invoice by ID
  getInvoiceById: async (req, res) => {
    try {
      const { id } = req.params;

      const invoice = await Invoice.findOne({
        _id: id,
        userId: req.user.userId
      });

      if (!invoice) {
        return res.status(404).json({
          success: false,
          message: CONSTANTS.ERROR_MESSAGES.INVOICE_NOT_FOUND,
          code: 'INVOICE_NOT_FOUND'
        });
      }

      res.status(200).json({
        success: true,
        message: CONSTANTS.SUCCESS_MESSAGES.DATA_RETRIEVED,
        data: {
          invoice
        }
      });
    } catch (error) {
      logger.error('Get invoice error:', error);
      res.status(500).json({
        success: false,
        message: CONSTANTS.ERROR_MESSAGES.SERVER_ERROR
      });
    }
  },

  // Update invoice
  updateInvoice: async (req, res) => {
    try {
      const { id } = req.params;
      const { status, flaggedForReview, reviewNotes, approved } = req.body;

      const invoice = await Invoice.findOne({
        _id: id,
        userId: req.user.userId
      });

      if (!invoice) {
        return res.status(404).json({
          success: false,
          message: CONSTANTS.ERROR_MESSAGES.INVOICE_NOT_FOUND,
          code: 'INVOICE_NOT_FOUND'
        });
      }

      // Update fields
      if (status && Object.values(CONSTANTS.INVOICE_STATUS).includes(status)) {
        invoice.status = status;
      }
      if (flaggedForReview !== undefined) {
        invoice.flaggedForReview = flaggedForReview;
      }
      if (reviewNotes !== undefined) {
        invoice.reviewNotes = reviewNotes;
      }
      if (approved !== undefined) {
        invoice.approved = approved;
        if (approved) {
          invoice.reviewedAt = new Date();
          invoice.reviewedBy = req.user.userId;
        }
      }

      await invoice.save();

      logger.info(`Invoice updated: ${invoice._id}`);

      res.status(200).json({
        success: true,
        message: 'Invoice updated successfully',
        data: {
          invoice
        }
      });
    } catch (error) {
      logger.error('Update invoice error:', error);
      res.status(500).json({
        success: false,
        message: CONSTANTS.ERROR_MESSAGES.SERVER_ERROR
      });
    }
  },

  // Delete invoice
  deleteInvoice: async (req, res) => {
    try {
      const { id } = req.params;

      const invoice = await Invoice.findOneAndDelete({
        _id: id,
        userId: req.user.userId
      });

      if (!invoice) {
        return res.status(404).json({
          success: false,
          message: CONSTANTS.ERROR_MESSAGES.INVOICE_NOT_FOUND,
          code: 'INVOICE_NOT_FOUND'
        });
      }

      // Delete file if exists
      if (invoice.filePath && fs.existsSync(invoice.filePath)) {
        fs.unlinkSync(invoice.filePath);
      }

      // Update user invoice count
      await User.findByIdAndUpdate(
        req.user.userId,
        { $inc: { invoiceCount: -1 } }
      );

      logger.info(`Invoice deleted: ${id}`);

      res.status(200).json({
        success: true,
        message: 'Invoice deleted successfully'
      });
    } catch (error) {
      logger.error('Delete invoice error:', error);
      res.status(500).json({
        success: false,
        message: CONSTANTS.ERROR_MESSAGES.SERVER_ERROR
      });
    }
  },

  // Get invoice summary
  getInvoiceSummary: async (req, res) => {
    try {
      const userId = req.user.userId;

      const summary = await Invoice.aggregate([
        { $match: { userId: require('mongoose').Types.ObjectId(userId) } },
        {
          $group: {
            _id: null,
            totalInvoices: { $sum: 1 },
            totalAmount: { $sum: '$totalAmount' },
            totalTax: { $sum: '$totalTax' },
            flaggedCount: {
              $sum: {
                $cond: ['$flaggedForReview', 1, 0]
              }
            }
          }
        }
      ]);

      const data = summary[0] || {
        totalInvoices: 0,
        totalAmount: 0,
        totalTax: 0,
        flaggedCount: 0
      };

      res.status(200).json({
        success: true,
        message: CONSTANTS.SUCCESS_MESSAGES.DATA_RETRIEVED,
        data: {
          summary: data
        }
      });
    } catch (error) {
      logger.error('Get invoice summary error:', error);
      res.status(500).json({
        success: false,
        message: CONSTANTS.ERROR_MESSAGES.SERVER_ERROR
      });
    }
  }
};

module.exports = invoiceController;