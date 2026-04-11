const User = require('../models/user');
const jwtUtils = require('../utils/jwt');
const logger = require('../utils/logger');
const CONSTANTS = require('../config/constants');

const authController = {
  // Signup
  signup: async (req, res) => {
    try {
      const { firstName, lastName, email, password } = req.body;

      // Check if user exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: CONSTANTS.ERROR_MESSAGES.USER_ALREADY_EXISTS,
          code: 'USER_EXISTS'
        });
      }

      // Create new user
      const user = new User({
        firstName,
        lastName,
        email,
        password,
        role: CONSTANTS.ROLES.USER,
        isActive: true
      });

      await user.save();

      // Generate tokens
      const accessToken = jwtUtils.generateAccessToken(user._id, user.email);
      const refreshToken = jwtUtils.generateRefreshToken(user._id);

      logger.info(`User registered: ${user._id}`);

      res.status(201).json({
        success: true,
        message: CONSTANTS.SUCCESS_MESSAGES.SIGNUP_SUCCESS,
        data: {
          user: user.toPublicJSON(),
          accessToken,
          refreshToken
        }
      });
    } catch (error) {
      logger.error('Signup error:', error);
      res.status(500).json({
        success: false,
        message: CONSTANTS.ERROR_MESSAGES.SERVER_ERROR,
        code: 'SIGNUP_FAILED'
      });
    }
  },

  // Login
  login: async (req, res) => {
    try {
      const { email, password } = req.body;

      // Find user
      const user = await User.findOne({ email }).select('+password');
      if (!user) {
        return res.status(401).json({
          success: false,
          message: CONSTANTS.ERROR_MESSAGES.INVALID_CREDENTIALS,
          code: 'INVALID_CREDENTIALS'
        });
      }

      // Check password
      const isPasswordValid = await user.matchPassword(password);
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: CONSTANTS.ERROR_MESSAGES.INVALID_CREDENTIALS,
          code: 'INVALID_CREDENTIALS'
        });
      }

      // Check if user is active
      if (!user.isActive) {
        return res.status(403).json({
          success: false,
          message: 'Account is inactive',
          code: 'ACCOUNT_INACTIVE'
        });
      }

      // Generate tokens
      const accessToken = jwtUtils.generateAccessToken(user._id, user.email);
      const refreshToken = jwtUtils.generateRefreshToken(user._id);

      // Update last login
      user.lastLogin = new Date();
      user.lastLoginIP = req.ip;
      await user.save();

      logger.info(`User logged in: ${user._id}`);

      res.status(200).json({
        success: true,
        message: CONSTANTS.SUCCESS_MESSAGES.LOGIN_SUCCESS,
        data: {
          user: user.toPublicJSON(),
          accessToken,
          refreshToken
        }
      });
    } catch (error) {
      logger.error('Login error:', error);
      res.status(500).json({
        success: false,
        message: CONSTANTS.ERROR_MESSAGES.SERVER_ERROR,
        code: 'LOGIN_FAILED'
      });
    }
  },

  // Refresh token
  refreshToken: async (req, res) => {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return res.status(401).json({
          success: false,
          message: 'Refresh token not found',
          code: 'NO_REFRESH_TOKEN'
        });
      }

      try {
        const decoded = jwtUtils.verifyRefreshToken(refreshToken);
        const user = await User.findById(decoded.userId);

        if (!user || !user.isActive) {
          return res.status(401).json({
            success: false,
            message: 'User not found or inactive',
            code: 'USER_INACTIVE'
          });
        }

        const newAccessToken = jwtUtils.generateAccessToken(user._id, user.email);
        const newRefreshToken = jwtUtils.generateRefreshToken(user._id);

        res.status(200).json({
          success: true,
          message: 'Token refreshed successfully',
          data: {
            accessToken: newAccessToken,
            refreshToken: newRefreshToken
          }
        });
      } catch (error) {
        return res.status(403).json({
          success: false,
          message: 'Invalid refresh token',
          code: 'INVALID_REFRESH_TOKEN'
        });
      }
    } catch (error) {
      logger.error('Token refresh error:', error);
      res.status(500).json({
        success: false,
        message: CONSTANTS.ERROR_MESSAGES.SERVER_ERROR,
        code: 'REFRESH_FAILED'
      });
    }
  },

  // Logout
  logout: async (req, res) => {
    try {
      logger.info(`User logged out: ${req.user?.userId}`);

      res.status(200).json({
        success: true,
        message: CONSTANTS.SUCCESS_MESSAGES.LOGOUT_SUCCESS
      });
    } catch (error) {
      logger.error('Logout error:', error);
      res.status(500).json({
        success: false,
        message: CONSTANTS.ERROR_MESSAGES.SERVER_ERROR,
        code: 'LOGOUT_FAILED'
      });
    }
  }
};

module.exports = authController;