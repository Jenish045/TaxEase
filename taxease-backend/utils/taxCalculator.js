const CONSTANTS = require('../config/constants');

class TaxCalculator {
  // Calculate GST from amount and rate
  static calculateGST(amount, gstRate) {
    if (!CONSTANTS.GST_SLABS.includes(gstRate)) {
      throw new Error(`Invalid GST rate: ${gstRate}`);
    }
    return (amount * gstRate) / 100;
  }

  // Calculate SGST and CGST (Intra-state)
  static calculateSGSTCGST(amount, gstRate) {
    if (!CONSTANTS.GST_SLABS.includes(gstRate)) {
      throw new Error(`Invalid GST rate: ${gstRate}`);
    }
    const sgstRate = gstRate / 2;
    const cgstRate = gstRate / 2;
    const sgst = (amount * sgstRate) / 100;
    const cgst = (amount * cgstRate) / 100;
    
    return {
      sgst: parseFloat(sgst.toFixed(2)),
      cgst: parseFloat(cgst.toFixed(2)),
      totalTax: parseFloat((sgst + cgst).toFixed(2))
    };
  }

  // Calculate IGST (Inter-state)
  static calculateIGST(amount, gstRate) {
    if (!CONSTANTS.GST_SLABS.includes(gstRate)) {
      throw new Error(`Invalid GST rate: ${gstRate}`);
    }
    const igst = (amount * gstRate) / 100;
    return parseFloat(igst.toFixed(2));
  }

  // Calculate tax summary for period
  static calculateTaxSummary(invoices) {
    let totalIncome = 0;
    let totalInputGST = 0;
    let totalOutputGST = 0;
    let invoiceCount = 0;

    invoices.forEach(invoice => {
      totalIncome += invoice.totalAmount || 0;
      totalOutputGST += invoice.totalTax || 0;
      invoiceCount += 1;
    });

    const netGST = totalOutputGST - totalInputGST;
    const estimatedIncomeTax = this.calculateIncomeTax(totalIncome);

    return {
      totalIncome: parseFloat(totalIncome.toFixed(2)),
      totalInputGST: parseFloat(totalInputGST.toFixed(2)),
      totalOutputGST: parseFloat(totalOutputGST.toFixed(2)),
      netGST: parseFloat(netGST.toFixed(2)),
      estimatedIncomeTax: parseFloat(estimatedIncomeTax.toFixed(2)),
      invoiceCount
    };
  }

  // Calculate income tax (simplified - actual calculation is complex)
  static calculateIncomeTax(income) {
    // Simplified income tax calculation for individuals
    // This is a basic calculation - actual ITR requires professional consultation
    if (income <= 250000) {
      return 0; // No tax
    }
    if (income <= 500000) {
      return (income - 250000) * 0.05;
    }
    if (income <= 1000000) {
      return (250000 * 0.05) + ((income - 500000) * 0.20);
    }
    return (250000 * 0.05) + (500000 * 0.20) + ((income - 1000000) * 0.30);
  }

  // Validate invoice amounts
  static validateInvoiceAmounts(invoice) {
    const expectedTotal = invoice.subtotal + invoice.totalTax;
    const difference = Math.abs(expectedTotal - invoice.totalAmount);
    
    return {
      isValid: difference < 1, // Allow 1 rupee difference due to rounding
      expectedTotal: parseFloat(expectedTotal.toFixed(2)),
      difference: parseFloat(difference.toFixed(2))
    };
  }
}

module.exports = TaxCalculator;