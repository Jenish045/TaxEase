const CONSTANTS = require('../config/constants');
const jwtUtils = require('../utils/jwt');
const logger = require('../utils/logger');
const User = require('../models/User');

const authMiddleware = {
  // Verify JWT Token
  verifyToken: async (req, res, next) => {
    try {
      const authHeader = req.headers['authorization'];
      const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

      if (!token) {
        return res.status(401).json({
          success: false,
          message: 'No token provided',
          code: 'NO_TOKEN'
        });
      }

      try {
        const decoded = jwtUtils.verifyAccessToken(token);
        // ✅ Extract userId and set both id and userId for compatibility
        req.user = {
          id: decoded.userId,
          userId: decoded.userId,
          email: decoded.email
        };
        next();
      } catch (error) {
        if (error.name === 'TokenExpiredError') {
          return res.status(401).json({
            success: false,
            message: 'Token has expired',
            code: 'TOKEN_EXPIRED'
          });
        }
        return res.status(403).json({
          success: false,
          message: 'Invalid token',
          code: 'INVALID_TOKEN'
        });
      }
    } catch (error) {
      logger.error('Token verification error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  },

  // Check User Role
  requireRole: (...allowedRoles) => {
    return async (req, res, next) => {
      try {
        if (!req.user) {
          return res.status(401).json({
            success: false,
            message: 'Unauthorized'
          });
        }

        const user = await User.findById(req.user.userId);
        if (!user) {
          return res.status(404).json({
            success: false,
            message: 'User not found'
          });
        }

        if (!allowedRoles.includes(user.role)) {
          return res.status(403).json({
            success: false,
            message: 'Insufficient permissions'
          });
        }

        req.user.role = user.role;
        next();
      } catch (error) {
        logger.error('Role check error:', error);
        res.status(500).json({
          success: false,
          message: 'Server error'
        });
      }
    };
  },

  // Optional authentication
  optionalAuth: (req, res, next) => {
    try {
      const authHeader = req.headers['authorization'];
      const token = authHeader && authHeader.split(' ')[1];

      if (token) {
        try {
          const decoded = jwtUtils.verifyAccessToken(token);
          req.user = {
            id: decoded.userId,
            userId: decoded.userId,
            email: decoded.email
          };
        } catch (error) {
          logger.debug('Optional token validation failed, continuing without auth');
        }
      }
      next();
    } catch (error) {
      logger.error('Optional auth error:', error);
      next();
    }
  }
};

module.exports = authMiddleware;