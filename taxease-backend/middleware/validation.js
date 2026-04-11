const { body, param, query, validationResult } = require('express-validator');
const CONSTANTS = require('../config/constants');
const validators = require('../utils/validators');

const validationMiddleware = {
  // Validate request and return errors
  validate: (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: CONSTANTS.ERROR_MESSAGES.VALIDATION_ERROR,
        code: 'VALIDATION_ERROR',
        errors: errors.array().map(err => ({
          field: err.param,
          message: err.msg,
          value: err.value
        }))
      });
    }
    next();
  },

  // Auth validation rules
  signupRules: () => [
    body('firstName')
      .trim()
      .notEmpty().withMessage('First name is required')
      .isLength({ min: 2 }).withMessage('First name must be at least 2 characters'),
    body('lastName')
      .trim()
      .notEmpty().withMessage('Last name is required')
      .isLength({ min: 2 }).withMessage('Last name must be at least 2 characters'),
    body('email')
      .trim()
      .isEmail().withMessage('Valid email is required')
      .normalizeEmail(),
    body('password')
      .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage('Password must contain uppercase, lowercase, and numbers'),
    body('confirmPassword')
      .custom((value, { req }) => value === req.body.password)
      .withMessage('Passwords do not match')
  ],

  loginRules: () => [
    body('email')
      .trim()
      .isEmail().withMessage('Valid email is required')
      .normalizeEmail(),
    body('password').notEmpty().withMessage('Password is required')
  ],

  // User validation rules
  updateUserRules: () => [
    body('firstName').optional().trim().isLength({ min: 2 }).withMessage('First name must be at least 2 characters'),
    body('lastName').optional().trim().isLength({ min: 2 }).withMessage('Last name must be at least 2 characters'),
    body('phone')
      .optional()
      .matches(/^[0-9]{10}$/).withMessage('Phone must be 10 digits'),
    body('gstNumber')
      .optional()
      .matches(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/).withMessage('Invalid GST format'),
    body('panNumber')
      .optional()
      .matches(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/).withMessage('Invalid PAN format')
  ],

  // Invoice validation rules
  createInvoiceRules: () => [
    body('invoiceNumber').trim().notEmpty().withMessage('Invoice number is required'),
    body('invoiceDate').isISO8601().withMessage('Valid invoice date is required'),
    body('subtotal').isFloat({ min: 0 }).withMessage('Subtotal must be a positive number'),
    body('totalAmount').isFloat({ min: 0 }).withMessage('Total amount must be a positive number'),
    body('sellerName').optional().trim(),
    body('sellerGSTIN')
      .optional()
      .matches(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/).withMessage('Invalid GSTIN format'),
    body('sgst').optional().isFloat({ min: 0 }).withMessage('SGST must be a positive number'),
    body('cgst').optional().isFloat({ min: 0 }).withMessage('CGST must be a positive number'),
    body('igst').optional().isFloat({ min: 0 }).withMessage('IGST must be a positive number')
  ],

  // Change password rules
  changePasswordRules: () => [
    body('currentPassword').notEmpty().withMessage('Current password is required'),
    body('newPassword')
      .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage('Password must contain uppercase, lowercase, and numbers'),
    body('confirmPassword')
      .custom((value, { req }) => value === req.body.newPassword)
      .withMessage('Passwords do not match')
  ]
};

module.exports = validationMiddleware;