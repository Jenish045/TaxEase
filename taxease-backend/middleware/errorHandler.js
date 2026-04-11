const logger = require('../utils/logger');
const CONSTANTS = require('../config/constants');

const errorHandler = (err, req, res, next) => {
  // Log error
  logger.error({
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    ip: req.ip,
    userId: req.user?.userId
  });

  // Default error response
  let statusCode = err.statusCode || 500;
  let message = err.message || CONSTANTS.ERROR_MESSAGES.SERVER_ERROR;
  let errorCode = err.code || 'INTERNAL_ERROR';

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation failed';
    errorCode = 'VALIDATION_ERROR';
    const errors = Object.values(err.errors).map(error => error.message);
    return res.status(statusCode).json({
      success: false,
      message,
      code: errorCode,
      errors
    });
  }

  // Mongoose cast error
  if (err.name === 'CastError') {
    statusCode = 400;
    message = 'Invalid ID format';
    errorCode = 'INVALID_ID';
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyPattern)[0];
    message = `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`;
    errorCode = 'DUPLICATE_ENTRY';
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 403;
    message = CONSTANTS.ERROR_MESSAGES.INVALID_TOKEN;
    errorCode = 'INVALID_TOKEN';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token has expired';
    errorCode = 'TOKEN_EXPIRED';
  }

  // Multer file upload errors
  if (err.name === 'MulterError') {
    statusCode = 400;
    if (err.code === 'FILE_TOO_LARGE') {
      message = 'File size exceeds maximum limit';
    } else if (err.code === 'LIMIT_FILE_COUNT') {
      message = 'Too many files uploaded';
    } else {
      message = 'File upload error';
    }
    errorCode = err.code;
  }

  // Send error response
  res.status(statusCode).json({
    success: false,
    message,
    code: errorCode,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = errorHandler;