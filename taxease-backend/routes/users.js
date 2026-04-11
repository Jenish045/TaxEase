const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/auth');
const validationMiddleware = require('../middleware/validation');
const CONSTANTS = require('../config/constants');

// All user routes require authentication
router.use(authMiddleware.verifyToken);

// Get current user profile
router.get('/profile', userController.getCurrentUser);

// Update user profile
router.put(
  '/profile',
  validationMiddleware.updateUserRules(),
  validationMiddleware.validate,
  userController.updateProfile
);

// Change password
router.post(
  '/change-password',
  validationMiddleware.changePasswordRules(),
  validationMiddleware.validate,
  userController.changePassword
);

// Get user statistics
router.get('/statistics', userController.getStatistics);

// Admin routes (only for admin users)
router.get(
  '/',
  authMiddleware.requireRole(CONSTANTS.ROLES.ADMIN),
  userController.listUsers
);

router.get(
  '/:id',
  authMiddleware.requireRole(CONSTANTS.ROLES.ADMIN),
  userController.getUserById
);

module.exports = router;