const User = require('../models/User');
const Invoice = require('../models/Invoice');
const logger = require('../utils/logger');
const CONSTANTS = require('../config/constants');

const userController = {
  // Get current user
  getCurrentUser: async (req, res) => {
    try {
      const user = await User.findById(req.user.userId);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: CONSTANTS.ERROR_MESSAGES.USER_NOT_FOUND,
          code: 'USER_NOT_FOUND'
        });
      }

      res.status(200).json({
        success: true,
        message: CONSTANTS.SUCCESS_MESSAGES.DATA_RETRIEVED,
        data: {
          user: user.toPublicJSON()
        }
      });
    } catch (error) {
      logger.error('Get current user error:', error);
      res.status(500).json({
        success: false,
        message: CONSTANTS.ERROR_MESSAGES.SERVER_ERROR
      });
    }
  },

  // Update user profile
  updateProfile: async (req, res) => {
    try {
      const { firstName, lastName, phone, gstNumber, panNumber, businessName, businessType, address, preferences } = req.body;

      const user = await User.findById(req.user.userId);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: CONSTANTS.ERROR_MESSAGES.USER_NOT_FOUND,
          code: 'USER_NOT_FOUND'
        });
      }

      // Update fields
      if (firstName) user.firstName = firstName;
      if (lastName) user.lastName = lastName;
      if (phone) user.phone = phone;
      if (gstNumber) user.gstNumber = gstNumber.toUpperCase();
      if (panNumber) user.panNumber = panNumber.toUpperCase();
      if (businessName) user.businessName = businessName;
      if (businessType) user.businessType = businessType;
      if (address) user.address = { ...user.address, ...address };
      if (preferences) user.preferences = { ...user.preferences, ...preferences };

      await user.save();

      logger.info(`User profile updated: ${user._id}`);

      res.status(200).json({
        success: true,
        message: CONSTANTS.SUCCESS_MESSAGES.PROFILE_UPDATED,
        data: {
          user: user.toPublicJSON()
        }
      });
    } catch (error) {
      logger.error('Update profile error:', error);
      res.status(500).json({
        success: false,
        message: CONSTANTS.ERROR_MESSAGES.SERVER_ERROR
      });
    }
  },

  // Change password
  changePassword: async (req, res) => {
    try {
      const { currentPassword, newPassword } = req.body;

      const user = await User.findById(req.user.userId).select('+password');

      if (!user) {
        return res.status(404).json({
          success: false,
          message: CONSTANTS.ERROR_MESSAGES.USER_NOT_FOUND,
          code: 'USER_NOT_FOUND'
        });
      }

      // Verify current password
      const isPasswordValid = await user.matchPassword(currentPassword);
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: 'Current password is incorrect',
          code: 'INVALID_PASSWORD'
        });
      }

      // Update password
      user.password = newPassword;
      await user.save();

      logger.info(`User password changed: ${user._id}`);

      res.status(200).json({
        success: true,
        message: CONSTANTS.SUCCESS_MESSAGES.PASSWORD_CHANGED
      });
    } catch (error) {
      logger.error('Change password error:', error);
      res.status(500).json({
        success: false,
        message: CONSTANTS.ERROR_MESSAGES.SERVER_ERROR
      });
    }
  },

  // Get user statistics
  getStatistics: async (req, res) => {
    try {
      const user = await User.findById(req.user.userId);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: CONSTANTS.ERROR_MESSAGES.USER_NOT_FOUND,
          code: 'USER_NOT_FOUND'
        });
      }

      // Get invoice statistics
      const totalInvoices = await Invoice.countDocuments({ userId: req.user.userId });
      const pendingInvoices = await Invoice.countDocuments({
        userId: req.user.userId,
        status: CONSTANTS.INVOICE_STATUS.PENDING
      });
      const flaggedInvoices = await Invoice.countDocuments({
        userId: req.user.userId,
        flaggedForReview: true
      });
      
      const totalAmountResult = await Invoice.aggregate([
        { $match: { userId: require('mongoose').Types.ObjectId(req.user.userId) } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
      ]);

      const totalAmount = totalAmountResult[0]?.total || 0;

      res.status(200).json({
        success: true,
        message: CONSTANTS.SUCCESS_MESSAGES.DATA_RETRIEVED,
        data: {
          statistics: {
            totalInvoices,
            pendingInvoices,
            flaggedInvoices,
            totalAmount: Math.round(totalAmount * 100) / 100,
            subscriptionPlan: user.subscriptionPlan,
            remainingQuota: user.getRemainingQuota()
          }
        }
      });
    } catch (error) {
      logger.error('Get statistics error:', error);
      res.status(500).json({
        success: false,
        message: CONSTANTS.ERROR_MESSAGES.SERVER_ERROR
      });
    }
  },

  // Get user by ID (Admin only)
  getUserById: async (req, res) => {
    try {
      const { id } = req.params;
      const user = await User.findById(id);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: CONSTANTS.ERROR_MESSAGES.USER_NOT_FOUND,
          code: 'USER_NOT_FOUND'
        });
      }

      res.status(200).json({
        success: true,
        message: CONSTANTS.SUCCESS_MESSAGES.DATA_RETRIEVED,
        data: { user: user.toPublicJSON() }
      });
    } catch (error) {
      logger.error('Get user by ID error:', error);
      res.status(500).json({
        success: false,
        message: CONSTANTS.ERROR_MESSAGES.SERVER_ERROR
      });
    }
  },

  // List all users (Admin only)
  listUsers: async (req, res) => {
    try {
      const { page = 1, limit = 10, role, isActive } = req.query;

      const pageNum = Math.max(1, parseInt(page));
      const limitNum = Math.min(parseInt(limit) || 10, CONSTANTS.MAX_PAGE_SIZE);
      const skip = (pageNum - 1) * limitNum;

      // Build filter
      const filter = {};
      if (role) filter.role = role;
      if (isActive !== undefined) filter.isActive = isActive === 'true';

      // Get users
      const users = await User.find(filter)
        .select('-password')
        .skip(skip)
        .limit(limitNum)
        .sort({ createdAt: -1 })
        .lean();

      const total = await User.countDocuments(filter);

      res.status(200).json({
        success: true,
        message: CONSTANTS.SUCCESS_MESSAGES.DATA_RETRIEVED,
        data: {
          users,
          pagination: {
            page: pageNum,
            limit: limitNum,
            total,
            pages: Math.ceil(total / limitNum)
          }
        }
      });
    } catch (error) {
      logger.error('List users error:', error);
      res.status(500).json({
        success: false,
        message: CONSTANTS.ERROR_MESSAGES.SERVER_ERROR
      });
    }
  }
};

module.exports = userController;