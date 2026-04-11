const dotenv = require('dotenv');

dotenv.config();

const config = {
  // Server
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  apiUrl: process.env.API_URL || 'http://localhost:5000',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',

  // Database
  dbType: process.env.DB_TYPE || 'mongodb',
  mongodbUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/taxease',

  // JWT
  jwtSecret: process.env.JWT_SECRET || 'default_secret_change_in_production',
  jwtExpire: process.env.JWT_EXPIRE || '7d',
  refreshTokenSecret: process.env.REFRESH_TOKEN_SECRET || 'default_refresh_secret',
  refreshTokenExpire: process.env.REFRESH_TOKEN_EXPIRE || '30d',

  // File Upload
  uploadDir: process.env.UPLOAD_DIR || './uploads',
  maxFileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024, // 10MB
  allowedFileTypes: (process.env.ALLOWED_FILE_TYPES || 'application/pdf').split(','),

  // Email
  smtpHost: process.env.SMTP_HOST,
  smtpPort: process.env.SMTP_PORT,
  smtpUser: process.env.SMTP_USER,
  smtpPassword: process.env.SMTP_PASSWORD,
  smtpFrom: process.env.SMTP_FROM,

  // Logging
  logLevel: process.env.LOG_LEVEL || 'info',
  logFile: process.env.LOG_FILE || './logs/app.log',

  // External Services
  djangoServiceUrl: process.env.DJANGO_SERVICE_URL || 'http://localhost:8000',
  flaskServiceUrl: process.env.FLASK_SERVICE_URL || 'http://localhost:5001',

  // API Keys
  stripeApiKey: process.env.STRIPE_API_KEY,
  razorpayKeyId: process.env.RAZORPAY_KEY_ID
};

module.exports = config;