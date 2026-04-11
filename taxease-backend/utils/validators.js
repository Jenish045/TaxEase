const CONSTANTS = require('../config/constants');

const validators = {
  // Email validation
  validateEmail: (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  // Password validation
  validatePassword: (password) => {
    // Min 8 chars, 1 uppercase, 1 lowercase, 1 number
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    return passwordRegex.test(password);
  },

  // GST validation
  validateGST: (gst) => {
    const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
    return gstRegex.test(gst);
  },

  // PAN validation
  validatePAN: (pan) => {
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    return panRegex.test(pan);
  },

  // Phone validation
  validatePhone: (phone) => {
    const phoneRegex = /^[0-9]{10}$/;
    return phoneRegex.test(phone);
  },

  // Invoice number validation
  validateInvoiceNumber: (invoiceNumber) => {
    return invoiceNumber && invoiceNumber.trim().length > 0;
  },

  // Amount validation
  validateAmount: (amount) => {
    return !isNaN(amount) && parseFloat(amount) >= 0;
  },

  // File validation
  validateFile: (file, allowedTypes = CONSTANTS.ALLOWED_FILE_TYPES, maxSize = config.maxFileSize) => {
    if (!file) return { valid: false, error: 'File is required' };

    if (!allowedTypes.includes(file.mimetype)) {
      return { valid: false, error: 'Only PDF files are allowed' };
    }

    if (file.size > maxSize) {
      return { valid: false, error: `File size must be less than ${maxSize / (1024 * 1024)}MB` };
    }

    return { valid: true };
  }
};

module.exports = validators;