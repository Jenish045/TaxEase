const mongoose = require('mongoose');
const CONSTANTS = require('../config/constants');

const taxSummarySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    period: {
      type: String, // Format: "Q1-2024" or "FY-2023-24"
      required: true,
      index: true
    },
    periodStartDate: {
      type: Date,
      required: true
    },
    periodEndDate: {
      type: Date,
      required: true
    },

    // GST Summary
    gstSummary: {
      totalInvoicesSale: {
        count: { type: Number, default: 0 },
        amount: { type: Number, default: 0 }
      },
      totalInvoicesPurchase: {
        count: { type: Number, default: 0 },
        amount: { type: Number, default: 0 }
      },
      totalInputGST: { type: Number, default: 0 },
      totalOutputGST: { type: Number, default: 0 },
      netGSTPaid: { type: Number, default: 0 },
      netGSTRefund: { type: Number, default: 0 },
      gstFilingDue: Date,
      gstFiled: { type: Boolean, default: false },
      gstReference: String
    },

    // Income Tax Summary
    incomeTaxSummary: {
      totalIncome: { type: Number, default: 0 },
      totalDeductions: { type: Number, default: 0 },
      taxableIncome: { type: Number, default: 0 },
      estimatedTax: { type: Number, default: 0 },
      taxPaid: { type: Number, default: 0 },
      itrFiling: {
        filed: { type: Boolean, default: false },
        filingDate: Date,
        reference: String,
        status: {
          type: String,
          enum: ['draft', 'submitted', 'accepted', 'rejected'],
          default: 'draft'
        }
      }
    },

    // TDS Summary
    tdsSummary: {
      totalTDSDeducted: { type: Number, default: 0 },
      totalTDSPaid: { type: Number, default: 0 },
      tdsCertificates: [
        {
          certificateNumber: String,
          issuedBy: String,
          amount: Number,
          certificateDate: Date
        }
      ]
    },

    // Invoice Details
    includedInvoices: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: 'Invoice',
      index: true
    },
    invoiceCount: { type: Number, default: 0 },
    totalInvoiceAmount: { type: Number, default: 0 },

    // Compliance Status
    complianceStatus: {
      type: String,
      enum: ['pending', 'in_progress', 'compliant', 'non_compliant', 'need_revision'],
      default: 'pending'
    },
    complianceNotes: String,
    lastComplianceCheck: Date,

    // Financial Summary
    financialSummary: {
      revenue: { type: Number, default: 0 },
      expenses: { type: Number, default: 0 },
      netProfit: { type: Number, default: 0 },
      profitMargin: { type: Number, default: 0 }
    },

    // Approvals & Timestamps
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    approvedAt: Date,
    isFinalized: {
      type: Boolean,
      default: false
    },

    createdAt: {
      type: Date,
      default: Date.now
    },
    updatedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true,
    collection: 'tax_summaries'
  }
);

// ==================== INDEXES ====================
taxSummarySchema.index({ userId: 1, period: 1 }, { unique: true });
taxSummarySchema.index({ periodStartDate: 1, periodEndDate: 1 });

// ==================== METHODS ====================

taxSummarySchema.methods.calculateNetGST = function () {
  this.gstSummary.netGSTPaid = 
    (this.gstSummary.totalOutputGST || 0) - (this.gstSummary.totalInputGST || 0);
  
  if (this.gstSummary.netGSTPaid < 0) {
    this.gstSummary.netGSTRefund = Math.abs(this.gstSummary.netGSTPaid);
    this.gstSummary.netGSTPaid = 0;
  }
  
  return this.gstSummary.netGSTPaid;
};

taxSummarySchema.methods.calculateTaxableIncome = function () {
  this.incomeTaxSummary.taxableIncome = 
    (this.incomeTaxSummary.totalIncome || 0) - (this.incomeTaxSummary.totalDeductions || 0);
  return this.incomeTaxSummary.taxableIncome;
};

taxSummarySchema.methods.updateComplianceStatus = function () {
  const gstFiled = this.gstSummary.gstFiled;
  const itrFiled = this.incomeTaxSummary.itrFiling.filed;

  if (gstFiled && itrFiled) {
    this.complianceStatus = 'compliant';
  } else if (gstFiled || itrFiled) {
    this.complianceStatus = 'in_progress';
  } else {
    this.complianceStatus = 'pending';
  }
  return this.complianceStatus;
};

module.exports = mongoose.models.TaxSummary || mongoose.model('TaxSummary', taxSummarySchema);