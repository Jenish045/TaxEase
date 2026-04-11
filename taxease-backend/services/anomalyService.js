const Invoice = require('../models/Invoice');
const CONSTANTS = require('../config/constants');
const logger = require('../utils/logger');

class AnomalyService {
  // Detect all anomalies for an invoice
  static async detectAnomalies(invoice, userId) {
    try {
      const anomalies = [];

      // Check 1: Duplicate detection
      const duplicateResult = await this.checkDuplicate(invoice, userId);
      if (duplicateResult.isDuplicate || duplicateResult.possibleDuplicate) {
        anomalies.push({
          type: CONSTANTS.ANOMALY_TYPES.DUPLICATE,
          severity: duplicateResult.isDuplicate ? CONSTANTS.SEVERITY.HIGH : CONSTANTS.SEVERITY.MEDIUM,
          message: `${duplicateResult.isDuplicate ? 'Duplicate invoice found' : 'Possible duplicate invoice'}: ${duplicateResult.reason}`,
          score: duplicateResult.score || duplicateResult.duplicateScore
        });
      }

      // Check 2: Tax validation
      const taxValidation = this.validateTaxes(invoice);
      if (!taxValidation.isValid) {
        anomalies.push({
          type: CONSTANTS.ANOMALY_TYPES.TAX_MISMATCH,
          severity: CONSTANTS.SEVERITY.HIGH,
          message: taxValidation.message
        });
      }

      // Check 3: Amount validation
      const amountValidation = this.validateAmounts(invoice);
      if (!amountValidation.isValid) {
        anomalies.push({
          type: CONSTANTS.ANOMALY_TYPES.AMOUNT_MISMATCH,
          severity: CONSTANTS.SEVERITY.HIGH,
          message: amountValidation.message
        });
      }

      // Check 4: Format validation
      const formatValidation = this.validateFormat(invoice);
      if (!formatValidation.isValid) {
        anomalies.push({
          type: CONSTANTS.ANOMALY_TYPES.FORMAT_ERROR,
          severity: CONSTANTS.SEVERITY.MEDIUM,
          message: formatValidation.message
        });
      }

      // Check 5: Suspicious patterns
      const suspiciousPatterns = this.detectSuspiciousPatterns(invoice);
      anomalies.push(...suspiciousPatterns);

      return anomalies;
    } catch (error) {
      logger.error('Detect anomalies error:', error);
      throw error;
    }
  }

  // Check for duplicate invoices
  static async checkDuplicate(invoice, userId) {
    try {
      // Exact match by hash
      const hashMatch = await Invoice.findOne({
        userId,
        fileHash: invoice.fileHash,
        _id: { $ne: invoice._id }
      });

      if (hashMatch) {
        return {
          isDuplicate: true,
          duplicateOf: hashMatch._id,
          reason: 'Exact file duplicate',
          score: 100
        };
      }

      // Fuzzy match by amount and date
      const fuzzyMatch = await Invoice.findOne({
        userId,
        totalAmount: {
          $gte: invoice.totalAmount * 0.99,
          $lte: invoice.totalAmount * 1.01
        },
        invoiceDate: {
          $gte: new Date(invoice.invoiceDate.getTime() - 86400000),
          $lte: new Date(invoice.invoiceDate.getTime() + 86400000)
        },
        _id: { $ne: invoice._id }
      });

      if (fuzzyMatch) {
        return {
          isDuplicate: false,
          possibleDuplicate: true,
          duplicateOf: fuzzyMatch._id,
          reason: 'Similar amount and date',
          score: 85
        };
      }

      return {
        isDuplicate: false,
        possibleDuplicate: false,
        score: 0
      };
    } catch (error) {
      logger.error('Duplicate check error:', error);
      throw error;
    }
  }

  // Validate tax calculations
  static validateTaxes(invoice) {
    // SGST and CGST should only be for intra-state transactions
    if (invoice.sgst && invoice.cgst && invoice.igst && (invoice.igst > 0)) {
      if (invoice.sgst > 0 && invoice.cgst > 0) {
        return {
          isValid: false,
          message: 'Cannot have both SGST+CGST and IGST. Either SGST+CGST (intra-state) OR IGST (inter-state)'
        };
      }
    }

    // Validate GST rates
    const validRates = CONSTANTS.GST_SLABS;
    if (invoice.sgst && !validRates.includes(invoice.sgst / 2 * 2)) {
      return {
        isValid: false,
        message: `Invalid SGST rate: ${invoice.sgst}`
      };
    }

    return { isValid: true };
  }

  // Validate amounts
  static validateAmounts(invoice) {
    const subtotal = invoice.subtotal || 0;
    const taxes = (invoice.sgst || 0) + (invoice.cgst || 0) + (invoice.igst || 0) + (invoice.otherTaxes || 0);
    const expectedTotal = subtotal + taxes;
    const difference = Math.abs(expectedTotal - invoice.totalAmount);

    if (difference > 1) { // Allow 1 rupee difference
      return {
        isValid: false,
        message: `Amount mismatch: Expected ${expectedTotal}, Got ${invoice.totalAmount}`
      };
    }

    return { isValid: true };
  }

  // Validate format
  static validateFormat(invoice) {
    const errors = [];

    if (!invoice.sellerName) {
      errors.push('Seller name is missing');
    }

    if (!invoice.invoiceNumber) {
      errors.push('Invoice number is missing');
    }

    if (!invoice.invoiceDate) {
      errors.push('Invoice date is missing');
    }

    if (invoice.invoiceDate > new Date()) {
      errors.push('Invoice date is in the future');
    }

    return {
      isValid: errors.length === 0,
      message: errors.join(', ')
    };
  }

  // Detect suspicious patterns
  static detectSuspiciousPatterns(invoice) {
    const anomalies = [];

    // Zero amount
    if (invoice.totalAmount === 0) {
      anomalies.push({
        type: CONSTANTS.ANOMALY_TYPES.SUSPICIOUS_PATTERN,
        severity: CONSTANTS.SEVERITY.HIGH,
        message: 'Invoice has zero amount'
      });
    }

    // Unusually high amount
    if (invoice.totalAmount > 10000000) {
      anomalies.push({
        type: CONSTANTS.ANOMALY_TYPES.SUSPICIOUS_PATTERN,
        severity: CONSTANTS.SEVERITY.MEDIUM,
        message: 'Invoice amount is unusually high (> ₹1 Cr)'
      });
    }

    // Very low tax percentage (suspicious for high value invoices)
    if (invoice.totalAmount > 100000 && invoice.totalTax > 0) {
      const taxPercentage = (invoice.totalTax / invoice.totalAmount) * 100;
      if (taxPercentage < 0.5) {
        anomalies.push({
          type: CONSTANTS.ANOMALY_TYPES.TAX_MISMATCH,
          severity: CONSTANTS.SEVERITY.MEDIUM,
          message: `Very low tax percentage (${taxPercentage.toFixed(2)}%) for high value invoice`
        });
      }
    }

    return anomalies;
  }

  // Get flagged invoices
  static async getFlaggedInvoices(userId) {
    try {
      return await Invoice.find({
        userId,
        flaggedForReview: true
      }).sort({ createdAt: -1 });
    } catch (error) {
      logger.error('Get flagged invoices error:', error);
      throw error;
    }
  }

  // Resolve anomaly
  static async resolveAnomaly(invoiceId, anomalyIndex, resolution) {
    try {
      const invoice = await Invoice.findById(invoiceId);
      if (!invoice) {
        throw new Error('Invoice not found');
      }

      invoice.resolveAnomaly(anomalyIndex);
      invoice.anomalies[anomalyIndex].resolution = resolution;

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
}

module.exports = AnomalyService;