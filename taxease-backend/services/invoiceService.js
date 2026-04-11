const Invoice = require('../models/Invoice');
const User = require('../models/User');
const CONSTANTS = require('../config/constants');
const TaxCalculator = require('../utils/taxCalculator');
const logger = require('../utils/logger');
const crypto = require('crypto');

class InvoiceService {
  // Check for duplicate invoices
  static async checkDuplicates(userId, fileHash, totalAmount, invoiceDate) {
    try {
      // Check by file hash
      const hashMatch = await Invoice.findOne({
        userId,
        fileHash
      });

      if (hashMatch) {
        return {
          isDuplicate: true,
          duplicateOf: hashMatch._id,
          reason: 'Exact file duplicate',
          score: 100
      };
      }

      // Check by similar amounts and dates (within 1 day)
      const dateLowerBound = new Date(invoiceDate);
      dateLowerBound.setDate(dateLowerBound.getDate() - 1);
      
      const dateUpperBound = new Date(invoiceDate);
      dateUpperBound.setDate(dateUpperBound.getDate() + 1);

      const amountMatch = await Invoice.findOne({
        userId,
        totalAmount: {
          $gte: totalAmount * 0.99,
          $lte: totalAmount * 1.01
        },
        invoiceDate: {
          $gte: dateLowerBound,
          $lte: dateUpperBound
        },
        _id: { $ne: `${this._id}` }
      });

      if (amountMatch) {
        return {
          isDuplicate: false,
          possibleDuplicate: true,
          duplicateOf: amountMatch._id,
          reason: 'Similar amount and date',
          score: 85
        };
      }

      return {
        isDuplicate: false,
        possibleDuplicate: false,
        duplicateScore: 0
      };
    } catch (error) {
      logger.error('Duplicate check error:', error);
      throw error;
    }
  }

  // Validate invoice data
  static validateInvoiceData(invoiceData) {
    const errors = [];

    // Required fields
    if (!invoiceData.invoiceNumber) {
      errors.push('Invoice number is required');
    }

    if (!invoiceData.invoiceDate) {
      errors.push('Invoice date is required');
    }

    if (!invoiceData.totalAmount || invoiceData.totalAmount < 0) {
      errors.push('Valid total amount is required');
    }

    // Validate dates
    if (invoiceData.invoiceDate && invoiceData.dueDate) {
      const invoiceDate = new Date(invoiceData.invoiceDate);
      const dueDate = new Date(invoiceData.dueDate);
      
      if (dueDate < invoiceDate) {
        errors.push('Due date cannot be before invoice date');
      }
    }

    // Validate GSTIN if provided
    if (invoiceData.sellerGSTIN) {
      const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
      if (!gstRegex.test(invoiceData.sellerGSTIN)) {
        errors.push('Invalid seller GSTIN format');
      }
    }

    // Validate tax amounts
    const totalTax = (invoiceData.sgst || 0) + (invoiceData.cgst || 0) + (invoiceData.igst || 0);
    const expectedTotal = (invoiceData.subtotal || 0) + totalTax;
    
    if (Math.abs(expectedTotal - invoiceData.totalAmount) > 1) {
      errors.push('Total amount does not match subtotal + taxes');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Detect anomalies
  static detectAnomalies(invoice) {
    const anomalies = [];

    // Check for zero amounts
    if (invoice.totalAmount === 0) {
      anomalies.push({
        type: CONSTANTS.ANOMALY_TYPES.SUSPICIOUS_PATTERN,
        severity: CONSTANTS.SEVERITY.HIGH,
        message: 'Invoice has zero amount'
      });
    }

    // Check for unusually high amounts
    if (invoice.totalAmount > 10000000) { // 1 crore
      anomalies.push({
        type: CONSTANTS.ANOMALY_TYPES.SUSPICIOUS_PATTERN,
        severity: CONSTANTS.SEVERITY.MEDIUM,
        message: 'Invoice amount is unusually high'
      });
    }

    // Check for tax rate mismatches
    if (invoice.sgst && invoice.cgst && invoice.igst) {
      if (invoice.sgst > 0 && invoice.cgst > 0 && invoice.igst > 0) {
        anomalies.push({
          type: CONSTANTS.ANOMALY_TYPES.TAX_MISMATCH,
          severity: CONSTANTS.SEVERITY.HIGH,
          message: 'Invoice has both SGST+CGST and IGST (invalid combination)'
        });
      }
    }

    // Check for missing required fields
    if (!invoice.sellerName) {
      anomalies.push({
        type: CONSTANTS.ANOMALY_TYPES.FORMAT_ERROR,
        severity: CONSTANTS.SEVERITY.MEDIUM,
        message: 'Seller name is missing'
      });
    }

    // Check future dates
    if (invoice.invoiceDate && invoice.invoiceDate > new Date()) {
      anomalies.push({
        type: CONSTANTS.ANOMALY_TYPES.SUSPICIOUS_PATTERN,
        severity: CONSTANTS.SEVERITY.MEDIUM,
        message: 'Invoice date is in the future'
      });
    }

    return anomalies;
  }

  // Get invoice by hash (for duplicate detection)
  static async getInvoiceByHash(fileHash) {
    try {
      return await Invoice.findOne({ fileHash });
    } catch (error) {
      logger.error('Get invoice by hash error:', error);
      throw error;
    }
  }

  // Get invoices for tax period
  static async getInvoicesForPeriod(userId, startDate, endDate) {
    try {
      return await Invoice.find({
        userId,
        invoiceDate: {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        },
        approved: true
      });
    } catch (error) {
      logger.error('Get invoices for period error:', error);
      throw error;
    }
  }

  // Mark anomalies as resolved
  static async resolveAnomaly(invoiceId, anomalyIndex) {
    try {
      const invoice = await Invoice.findById(invoiceId);
      if (!invoice) {
        throw new Error('Invoice not found');
      }

      invoice.resolveAnomaly(anomalyIndex);
      
      // Check if all anomalies are resolved
      const unresolvedAnomalies = invoice.anomalies.filter(a => !a.isResolved);
      if (unresolvedAnomalies.length === 0) {
        invoice.flaggedForReview = false;
      }

      await invoice.save();
      return invoice;
    } catch (error) {
      logger.error('Resolve anomaly error:', error);
      throw error;
    }
  }

  // Generate tax report
  static async generateTaxReport(userId, startDate, endDate) {
    try {
      const invoices = await this.getInvoicesForPeriod(userId, startDate, endDate);
      const calculation = TaxCalculator.calculateTaxSummary(invoices);

      return {
        period: {
          startDate,
          endDate
        },
        invoiceCount: calculation.invoiceCount,
        totalIncome: calculation.totalIncome,
        totalInputGST: calculation.totalInputGST,
        totalOutputGST: calculation.totalOutputGST,
        netGST: calculation.netGST,
        estimatedIncomeTax: calculation.estimatedIncomeTax,
        generatedAt: new Date()
      };
    } catch (error) {
      logger.error('Generate tax report error:', error);
      throw error;
    }
  }
}

module.exports = InvoiceService;