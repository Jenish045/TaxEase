const jwt = require('jsonwebtoken');
const config = require('../config/environment');
const logger = require('./logger');

const jwtUtils = {
  // Generate access token
  generateAccessToken: (userId, email) => {
    try {
      const token = jwt.sign(
        {
          userId,
          email,
          type: 'access'
        },
        config.jwtSecret,
        {
          expiresIn: config.jwtExpire,
          issuer: 'taxease-api',
          audience: 'taxease-client'
        }
      );
      return token;
    } catch (error) {
      logger.error('Error generating access token:', error);
      throw error;
    }
  },

  // Generate refresh token
  generateRefreshToken: (userId) => {
    try {
      const token = jwt.sign(
        {
          userId,
          type: 'refresh'
        },
        config.refreshTokenSecret,
        {
          expiresIn: config.refreshTokenExpire,
          issuer: 'taxease-api'
        }
      );
      return token;
    } catch (error) {
      logger.error('Error generating refresh token:', error);
      throw error;
    }
  },

  // Verify access token
  verifyAccessToken: (token) => {
    try {
      const decoded = jwt.verify(token, config.jwtSecret);
      return decoded;
    } catch (error) {
      logger.warn('Token verification failed:', error.message);
      throw error;
    }
  },

  // Verify refresh token
  verifyRefreshToken: (token) => {
    try {
      const decoded = jwt.verify(token, config.refreshTokenSecret);
      return decoded;
    } catch (error) {
      logger.warn('Refresh token verification failed:', error.message);
      throw error;
    }
  },

  // Decode token without verification (for debugging)
  decodeToken: (token) => {
    try {
      return jwt.decode(token);
    } catch (error) {
      logger.error('Error decoding token:', error);
      return null;
    }
  }
};

module.exports = jwtUtils;