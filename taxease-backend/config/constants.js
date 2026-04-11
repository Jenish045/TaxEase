const CONSTANTS = {
  // User Roles
  ROLES: {
    ADMIN: 'admin',
    USER: 'user',
    AUDITOR: 'auditor'
  },

  // Invoice Status
  INVOICE_STATUS: {
    PENDING: 'pending',
    PROCESSING: 'processing',
    COMPLETED: 'completed',
    FAILED: 'failed',
    FLAGGED: 'flagged'
  },

  // Document Types
  DOCUMENT_TYPE: {
    TEXT_BASED: 'text_based',
    SCANNED: 'scanned'
  },

  // Tax Types
  TAX_TYPES: {
    GST: 'GST',
    INCOME_TAX: 'income_tax',
    TDS: 'TDS'
  },

  // GST Slabs
  GST_SLABS: [0, 5, 12, 18, 28],

  // Business Types
  BUSINESS_TYPES: [
    'individual',
    'partnership',
    'private_ltd',
    'public_ltd',
    'llp',
    'proprietorship'
  ],

  // Subscription Plans
  SUBSCRIPTION_PLANS: {
    FREE: 'free',
    PRO: 'pro',
    ENTERPRISE: 'enterprise'
  },

  // Anomaly Types
  ANOMALY_TYPES: {
    DUPLICATE: 'duplicate',
    TAX_MISMATCH: 'tax_mismatch',
    FORMAT_ERROR: 'format_error',
    SUSPICIOUS_PATTERN: 'suspicious_pattern',
    AMOUNT_MISMATCH: 'amount_mismatch'
  },

  // Severity Levels
  SEVERITY: {
    LOW: 'low',
    MEDIUM: 'medium',
    HIGH: 'high'
  },

  // Error Messages
  ERROR_MESSAGES: {
    UNAUTHORIZED: 'Unauthorized access',
    INVALID_TOKEN: 'Invalid or expired token',
    USER_NOT_FOUND: 'User not found',
    INVALID_CREDENTIALS: 'Invalid email or password',
    USER_ALREADY_EXISTS: 'User with this email already exists',
    VALIDATION_ERROR: 'Validation failed',
    SERVER_ERROR: 'Internal server error',
    INVALID_FILE: 'Invalid file type or size',
    INVOICE_NOT_FOUND: 'Invoice not found',
    INSUFFICIENT_PERMISSIONS: 'Insufficient permissions'
  },

  // Success Messages
  SUCCESS_MESSAGES: {
    LOGIN_SUCCESS: 'Login successful',
    LOGOUT_SUCCESS: 'Logout successful',
    SIGNUP_SUCCESS: 'Account created successfully',
    INVOICE_UPLOADED: 'Invoice uploaded successfully',
    DATA_RETRIEVED: 'Data retrieved successfully',
    PROFILE_UPDATED: 'Profile updated successfully',
    PASSWORD_CHANGED: 'Password changed successfully'
  },

  // Pagination
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100,

  // Token
  TOKEN_TYPES: {
    ACCESS: 'access',
    REFRESH: 'refresh'
  }
};

module.exports = CONSTANTS;