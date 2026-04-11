const mongoose = require('mongoose');
const crypto = require('crypto');
const CONSTANTS = require('../config/constants');

const userSchema = new mongoose.Schema(
  {
    // Personal Information
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
      minlength: [2, 'First name must be at least 2 characters'],
      maxlength: [50, 'First name cannot exceed 50 characters']
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true,
      minlength: [2, 'Last name must be at least 2 characters'],
      maxlength: [50, 'Last name cannot exceed 50 characters']
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Invalid email format']
    },
    phone: {
      type: String,
      match: [/^[0-9]{10}$/, 'Phone number must be 10 digits'],
      sparse: true
    },

    // Authentication
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false // Don't return password by default
    },

    // Tax Information
    gstNumber: {
      type: String,
      sparse: true,
      uppercase: true,
      match: [/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$|^$/, 'Invalid GST format']
    },
    panNumber: {
      type: String,
      sparse: true,
      uppercase: true,
      match: [/^[A-Z]{5}[0-9]{4}[A-Z]{1}$|^$/, 'Invalid PAN format']
    },
    businessName: {
      type: String,
      trim: true,
      maxlength: [100, 'Business name cannot exceed 100 characters']
    },
    businessType: {
      type: String,
      enum: CONSTANTS.BUSINESS_TYPES,
      default: 'individual'
    },

    // Account Details
    role: {
      type: String,
      enum: Object.values(CONSTANTS.ROLES),
      default: CONSTANTS.ROLES.USER
    },
    isActive: {
      type: Boolean,
      default: true
    },
    isEmailVerified: {
      type: Boolean,
      default: false
    },
    emailVerificationToken: {
      type: String,
      select: false
    },

    // Profile Information
    profilePicture: {
      type: String,
      default: null
    },
    bio: {
      type: String,
      maxlength: [500, 'Bio cannot exceed 500 characters']
    },

    // Address
    address: {
      street: String,
      city: String,
      state: String,
      postalCode: String,
      country: { type: String, default: 'India' }
    },

    // Subscription Information
    subscriptionPlan: {
      type: String,
      enum: Object.values(CONSTANTS.SUBSCRIPTION_PLANS),
      default: CONSTANTS.SUBSCRIPTION_PLANS.FREE
    },
    subscriptionExpiry: Date,
    subscriptionStartDate: Date,

    // Preferences
    preferences: {
      language: { type: String, default: 'en' },
      timezone: { type: String, default: 'IST' },
      notificationsEnabled: { type: Boolean, default: true },
      twoFactorEnabled: { type: Boolean, default: false }
    },

    // Last Login
    lastLogin: Date,
    lastLoginIP: String,

    // Metadata
    invoiceCount: { type: Number, default: 0 },
    totalTaxFiled: { type: Number, default: 0 },

    // Timestamps
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
    collection: 'users'
  }
);

// ==================== INDEXES ====================
userSchema.index({ email: 1 });
userSchema.index({ gstNumber: 1 });
userSchema.index({ panNumber: 1 });
userSchema.index({ createdAt: -1 });

// ==================== MIDDLEWARE ====================

// ✅ NO PASSWORD HASHING HERE
// Password is already hashed in auth.js with SHA256
// This pre-save hook is REMOVED to avoid double-hashing

// Update the updatedAt timestamp
userSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

// ==================== METHODS ====================

// Compare password using SHA256 (same method as auth.js)
userSchema.methods.matchPassword = async function (enteredPassword) {
  const inputHash = crypto
    .createHash('sha256')
    .update(enteredPassword + 'taxease-salt-2026')
    .digest('hex');
  return inputHash === this.password;
};

// Get public profile (without password)
userSchema.methods.toPublicJSON = function () {
  const userObj = this.toObject();
  delete userObj.password;
  delete userObj.emailVerificationToken;
  return userObj;
};

// Get full name
userSchema.methods.getFullName = function () {
  return `${this.firstName} ${this.lastName}`.trim();
};

// Check subscription status
userSchema.methods.isSubscriptionActive = function () {
  if (this.subscriptionPlan === CONSTANTS.SUBSCRIPTION_PLANS.FREE) {
    return true; // Free plan is always active
  }
  if (!this.subscriptionExpiry) {
    return false;
  }
  return this.subscriptionExpiry > new Date();
};

// Get remaining invoice quota
userSchema.methods.getRemainingQuota = function () {
  if (this.subscriptionPlan === CONSTANTS.SUBSCRIPTION_PLANS.FREE) {
    return Math.max(0, 50 - this.invoiceCount);
  }
  return Infinity; // Unlimited for paid plans
};

module.exports = mongoose.models.User || mongoose.model('User', userSchema);