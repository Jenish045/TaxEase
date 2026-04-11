const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema(
  {
    // Invoice Details
    invoiceNumber: {
      type: String,
      required: [true, 'Invoice number is required'],
      unique: true,
      trim: true
    },
    invoiceDate: {
      type: Date,
      required: [true, 'Invoice date is required'],
      default: Date.now
    },
    dueDate: {
      type: Date,
      required: [true, 'Due date is required']
    },

    // User/Owner Info
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required']
    },

    // Client/Customer Info
    clientName: {
      type: String,
      required: [true, 'Client name is required'],
      trim: true
    },
    clientEmail: {
      type: String,
      required: [true, 'Client email is required'],
      lowercase: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Invalid email format']
    },
    clientPhone: {
      type: String,
      match: [/^[0-9]{10}$/, 'Phone number must be 10 digits']
    },
    clientAddress: {
      street: String,
      city: String,
      state: String,
      postalCode: String,
      country: { type: String, default: 'India' }
    },

    // Invoice Items
    items: [
      {
        description: {
          type: String,
          required: true
        },
        quantity: {
          type: Number,
          required: true,
          min: [1, 'Quantity must be at least 1']
        },
        unitPrice: {
          type: Number,
          required: true,
          min: [0, 'Unit price cannot be negative']
        },
        amount: {
          type: Number,
          required: true
        }
      }
    ],

    // Tax Information
    subtotal: {
      type: Number,
      required: true,
      default: 0
    },
    sgstRate: {
      type: Number,
      default: 0
    },
    sgstAmount: {
      type: Number,
      default: 0
    },
    cgstRate: {
      type: Number,
      default: 0
    },
    cgstAmount: {
      type: Number,
      default: 0
    },
    igstRate: {
      type: Number,
      default: 0
    },
    igstAmount: {
      type: Number,
      default: 0
    },
    totalTax: {
      type: Number,
      default: 0
    },
    totalAmount: {
      type: Number,
      required: true,
      default: 0
    },

    // Payment Information
    status: {
      type: String,
      enum: ['draft', 'sent', 'paid', 'overdue', 'cancelled'],
      default: 'draft'
    },
    paymentMethod: {
      type: String,
      enum: ['cash', 'cheque', 'bank_transfer', 'upi', 'credit_card', 'pending'],
      default: 'pending'
    },
    paymentDate: Date,
    notes: {
      type: String,
      maxlength: [500, 'Notes cannot exceed 500 characters']
    },

    // Metadata
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
    collection: 'invoices'
  }
);

// ==================== INDEXES ====================
invoiceSchema.index({ userId: 1 });
invoiceSchema.index({ invoiceNumber: 1 });
invoiceSchema.index({ clientEmail: 1 });
invoiceSchema.index({ invoiceDate: -1 });
invoiceSchema.index({ status: 1 });

// ==================== METHODS ====================

// Calculate totals
invoiceSchema.methods.calculateTotals = function () {
  // Calculate subtotal
  this.subtotal = this.items.reduce((sum, item) => sum + item.amount, 0);

  // Calculate tax amounts
  this.sgstAmount = (this.subtotal * this.sgstRate) / 100;
  this.cgstAmount = (this.subtotal * this.cgstRate) / 100;
  this.igstAmount = (this.subtotal * this.igstRate) / 100;

  this.totalTax = this.sgstAmount + this.cgstAmount + this.igstAmount;
  this.totalAmount = this.subtotal + this.totalTax;

  return this;
};

// Get invoice details
invoiceSchema.methods.toJSON = function () {
  const invoiceObj = this.toObject();
  return invoiceObj;
};

module.exports = mongoose.models.Invoice || mongoose.model('Invoice', invoiceSchema);