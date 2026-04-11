export const API_ENDPOINTS = {
  // Auth
  AUTH_LOGIN: '/auth/login',
  AUTH_SIGNUP: '/auth/signup',
  AUTH_LOGOUT: '/auth/logout',
  AUTH_REFRESH: '/auth/refresh-token',

  // Users
  USER_PROFILE: '/users/profile',
  USER_UPDATE: '/users/profile',
  USER_STATS: '/users/statistics',
  USER_CHANGE_PASSWORD: '/users/change-password',

  // Invoices
  INVOICES_LIST: '/invoices',
  INVOICES_CREATE: '/invoices',
  INVOICES_DETAIL: (id) => `/invoices/${id}`,
  INVOICES_UPDATE: (id) => `/invoices/${id}`,
  INVOICES_DELETE: (id) => `/invoices/${id}`,
  INVOICES_UPLOAD: '/invoices/upload'
};

export const INVOICE_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  FAILED: 'failed',
  FLAGGED: 'flagged'
};

export const INVOICE_STATUS_COLORS = {
  pending: '#FFA500',
  processing: '#4169E1',
  completed: '#28A745',
  failed: '#DC3545',
  flagged: '#FF6347'
};

export const TAX_TYPES = {
  GST: 'GST',
  INCOME_TAX: 'income_tax',
  TDS: 'TDS'
};

export const BUSINESS_TYPES = [
  { value: 'individual', label: 'Individual' },
  { value: 'partnership', label: 'Partnership' },
  { value: 'private_ltd', label: 'Private Limited' },
  { value: 'public_ltd', label: 'Public Limited' },
  { value: 'llp', label: 'LLP' },
  { value: 'proprietorship', label: 'Proprietorship' }
];

export const GST_SLABS = [0, 5, 12, 18, 28];

export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100
};

export const ERROR_MESSAGES = {
  UNAUTHORIZED: 'Unauthorized access',
  INVALID_TOKEN: 'Invalid or expired token',
  USER_NOT_FOUND: 'User not found',
  INVALID_CREDENTIALS: 'Invalid email or password',
  USER_ALREADY_EXISTS: 'User with this email already exists',
  VALIDATION_ERROR: 'Validation failed',
  SERVER_ERROR: 'Internal server error',
  INVALID_FILE: 'Invalid file type or size',
  NETWORK_ERROR: 'Network error. Please check your connection.'
};

export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'Login successful',
  LOGOUT_SUCCESS: 'Logout successful',
  SIGNUP_SUCCESS: 'Account created successfully',
  INVOICE_UPLOADED: 'Invoice uploaded successfully',
  PROFILE_UPDATED: 'Profile updated successfully'
};

export const ALLOWED_FILE_TYPES = ['application/pdf'];
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

// API Base URL
export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
export const API_TIMEOUT = parseInt(process.env.REACT_APP_API_TIMEOUT) || 10000;