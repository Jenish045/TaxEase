const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema({
  // Basic Info
  invoiceNumber: {
    type: String,
    required: true,
    unique: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // Dates
  invoiceDate: {
    type: Date,
    default: Date.now
  },
  dueDate: {
    type: Date
  },

  // Client Info
  clientName: {
    type: String,
    required: true
  },
  clientEmail: {
    type: String,
    required: true
  },
  clientPhone: {
    type: String
  },
  clientAddress: {
    type: String
  },

  // Items
  items: [
    {
      description: String,
      quantity: {
        type: Number,
        default: 0
      },
      unitPrice: {
        type: Number,
        default: 0
      },
      amount: {
        type: Number,
        default: 0
      }
    }
  ],

  // Tax Rates
  sgstRate: {
    type: Number,
    default: 0
  },
  cgstRate: {
    type: Number,
    default: 0
  },
  igstRate: {
    type: Number,
    default: 0
  },

  // Calculated Amounts
  subtotal: {
    type: Number,
    default: 0
  },
  sgstAmount: {
    type: Number,
    default: 0
  },
  cgstAmount: {
    type: Number,
    default: 0
  },
  igstAmount: {
    type: Number,
    default: 0
  },
  grandTotal: {
    type: Number,
    default: 0
  },

  // Additional Info
  notes: String,
  status: {
    type: String,
    enum: ['Draft', 'Sent', 'Paid', 'Overdue'],
    default: 'Draft'
  },

  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// ==================== CALCULATE TOTALS METHOD ====================
invoiceSchema.methods.calculateTotals = function() {
  try {
    // Ensure items is an array
    if (!Array.isArray(this.items)) {
      this.items = [];
    }

    // Calculate subtotal
    this.subtotal = this.items.reduce((sum, item) => {
      const qty = parseFloat(item.quantity) || 0;
      const price = parseFloat(item.unitPrice) || 0;
      return sum + (qty * price);
    }, 0);

    // Calculate tax amounts
    this.sgstAmount = parseFloat((this.subtotal * (this.sgstRate || 0)) / 100) || 0;
    this.cgstAmount = parseFloat((this.subtotal * (this.cgstRate || 0)) / 100) || 0;
    this.igstAmount = parseFloat((this.subtotal * (this.igstRate || 0)) / 100) || 0;

    // Calculate grand total
    this.grandTotal = this.subtotal + this.sgstAmount + this.cgstAmount + this.igstAmount;

    console.log('📊 TOTALS CALCULATED:', {
      subtotal: this.subtotal,
      sgstAmount: this.sgstAmount,
      cgstAmount: this.cgstAmount,
      igstAmount: this.igstAmount,
      grandTotal: this.grandTotal
    });
  } catch (error) {
    console.error('❌ Error calculating totals:', error);
  }

  return this;
};

// ==================== PRE-SAVE HOOK ====================
invoiceSchema.pre('save', function(next) {
  try {
    // Only calculate totals if items exist
    if (this.items && this.items.length > 0) {
      this.calculateTotals();
    }
    next();
  } catch (error) {
    console.error('❌ Pre-save hook error:', error);
    next(error);
  }
});

const Invoice = mongoose.model('Invoice', invoiceSchema);

module.exports = Invoice;