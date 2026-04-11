const TaxSummary = require('../models/TaxSummary');
const Invoice = require('../models/Invoice');
const User = require('../models/User');
const logger = require('../utils/logger');
const CONSTANTS = require('../config/constants');
const TaxCalculator = require('../utils/taxCalculator');

const taxController = {
  // Create or update tax summary for period
  createTaxSummary: async (req, res) => {
    try {
      const { period, periodStartDate, periodEndDate } = req.body;
      const userId = req.user.userId;

      // Check if summary already exists
      let taxSummary = await TaxSummary.findOne({
        userId,
        period
      });

      if (taxSummary) {
        return res.status(409).json({
          success: false,
          message: 'Tax summary for this period already exists',
          code: 'SUMMARY_EXISTS'
        });
      }

      // Get invoices for period
      const invoices = await Invoice.find({
        userId,
        invoiceDate: {
          $gte: new Date(periodStartDate),
          $lte: new Date(periodEndDate)
        },
        approved: true
      });

      // Calculate tax data
      const taxCalculation = TaxCalculator.calculateTaxSummary(invoices);

      // Create tax summary
      taxSummary = new TaxSummary({
        userId,
        period,
        periodStartDate,
        periodEndDate,
        includedInvoices: invoices.map(inv => inv._id),
        invoiceCount: invoices.length,
        totalInvoiceAmount: taxCalculation.totalIncome,
        gstSummary: {
          totalInvoicesSale: {
            count: invoices.length,
            amount: taxCalculation.totalIncome
          },
          totalOutputGST: taxCalculation.totalOutputGST,
          totalInputGST: taxCalculation.totalInputGST
        },
        incomeTaxSummary: {
          totalIncome: taxCalculation.totalIncome,
          estimatedTax: taxCalculation.estimatedIncomeTax
        }
      });

      // Calculate net GST
      taxSummary.calculateNetGST();

      await taxSummary.save();

      logger.info(`Tax summary created: ${taxSummary._id}`);

      res.status(201).json({
        success: true,
        message: 'Tax summary created successfully',
        data: {
          taxSummary
        }
      });
    } catch (error) {
      logger.error('Create tax summary error:', error);
      res.status(500).json({
        success: false,
        message: CONSTANTS.ERROR_MESSAGES.SERVER_ERROR
      });
    }
  },

  // Get tax summary for period
  getTaxSummary: async (req, res) => {
    try {
      const { period } = req.params;
      const userId = req.user.userId;

      const taxSummary = await TaxSummary.findOne({
        userId,
        period
      }).populate('includedInvoices');

      if (!taxSummary) {
        return res.status(404).json({
          success: false,
          message: 'Tax summary not found',
          code: 'SUMMARY_NOT_FOUND'
        });
      }

      res.status(200).json({
        success: true,
        message: CONSTANTS.SUCCESS_MESSAGES.DATA_RETRIEVED,
        data: {
          taxSummary
        }
      });
    } catch (error) {
      logger.error('Get tax summary error:', error);
      res.status(500).json({
        success: false,
        message: CONSTANTS.ERROR_MESSAGES.SERVER_ERROR
      });
    }
  },

  // Get all tax summaries
  getTaxSummaries: async (req, res) => {
    try {
      const { page = 1, limit = 10 } = req.query;
      const userId = req.user.userId;

      const pageNum = Math.max(1, parseInt(page));
      const limitNum = Math.min(parseInt(limit) || 10, CONSTANTS.MAX_PAGE_SIZE);
      const skip = (pageNum - 1) * limitNum;

      const taxSummaries = await TaxSummary.find({ userId })
        .skip(skip)
        .limit(limitNum)
        .sort({ periodStartDate: -1 });

      const total = await TaxSummary.countDocuments({ userId });

      res.status(200).json({
        success: true,
        message: CONSTANTS.SUCCESS_MESSAGES.DATA_RETRIEVED,
        data: {
          taxSummaries,
          pagination: {
            page: pageNum,
            limit: limitNum,
            total,
            pages: Math.ceil(total / limitNum)
          }
        }
      });
    } catch (error) {
      logger.error('Get tax summaries error:', error);
      res.status(500).json({
        success: false,
        message: CONSTANTS.ERROR_MESSAGES.SERVER_ERROR
      });
    }
  },

  // Update tax summary
  updateTaxSummary: async (req, res) => {
    try {
      const { id } = req.params;
      const { gstFiled, itrFiled, complianceStatus, complianceNotes } = req.body;

      const taxSummary = await TaxSummary.findOne({
        _id: id,
        userId: req.user.userId
      });

      if (!taxSummary) {
        return res.status(404).json({
          success: false,
          message: 'Tax summary not found',
          code: 'SUMMARY_NOT_FOUND'
        });
      }

      // Update fields
      if (gstFiled !== undefined) {
        taxSummary.gstSummary.gstFiled = gstFiled;
        if (gstFiled) {
          taxSummary.gstSummary.gstFilingDue = new Date();
        }
      }

      if (itrFiled !== undefined) {
        taxSummary.incomeTaxSummary.itrFiling.filed = itrFiled;
        if (itrFiled) {
          taxSummary.incomeTaxSummary.itrFiling.filingDate = new Date();
        }
      }

      if (complianceStatus) {
        taxSummary.complianceStatus = complianceStatus;
      }

      if (complianceNotes) {
        taxSummary.complianceNotes = complianceNotes;
      }

      taxSummary.updateComplianceStatus();
      await taxSummary.save();

      logger.info(`Tax summary updated: ${id}`);

      res.status(200).json({
        success: true,
        message: 'Tax summary updated successfully',
        data: {
          taxSummary
        }
      });
    } catch (error) {
      logger.error('Update tax summary error:', error);
      res.status(500).json({
        success: false,
        message: CONSTANTS.ERROR_MESSAGES.SERVER_ERROR
      });
    }
  }
};

module.exports = taxController;