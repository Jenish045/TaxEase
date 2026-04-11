const express = require('express');
const router = express.Router();
const User = require('../models/User');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

// Simple SHA256 password hashing
function hashPassword(password) {
  return crypto
    .createHash('sha256')
    .update(password + 'taxease-salt-2026')
    .digest('hex');
}

// ==================== SIGNUP ====================
router.post('/signup', async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    console.log('📝 SIGNUP REQUEST:', { 
      firstName, 
      lastName, 
      email, 
      passwordLength: password.length 
    });

    // Validation
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      console.log('❌ User already exists:', email);
      return res.status(400).json({
        success: false,
        message: 'Email already registered'
      });
    }

    // Hash password
    console.log('🔐 Hashing password...');
    const hashedPassword = hashPassword(password);
    console.log('✅ Password hashed');
    console.log('🔐 Stored hash:', hashedPassword);

    // Create user
    const newUser = new User({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword
    });

    await newUser.save();
    console.log('✅ User saved to database:', newUser.email);

    // Generate tokens
    const accessToken = jwt.sign(
      { userId: newUser._id, email: newUser.email },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    const refreshToken = jwt.sign(
      { userId: newUser._id },
      process.env.JWT_REFRESH_SECRET || 'your-refresh-secret',
      { expiresIn: '30d' }
    );

    console.log('✅ SIGNUP SUCCESS:', newUser.email);

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      data: {
        user: {
          id: newUser._id,
          firstName: newUser.firstName,
          lastName: newUser.lastName,
          email: newUser.email
        },
        accessToken,
        refreshToken
      }
    });

  } catch (error) {
    console.error('❌ SIGNUP ERROR:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error creating account'
    });
  }
});

// ==================== LOGIN ====================
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log('🔐 LOGIN REQUEST:', { 
      email, 
      passwordLength: password.length 
    });

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Find user
    console.log('🔍 Finding user:', email.toLowerCase().trim());
    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');
    
    if (!user) {
      console.log('❌ User not found:', email.toLowerCase().trim());
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    console.log('✅ User found:', user.email);

    // Hash input password and compare
    console.log('🔐 Comparing passwords...');
    const inputHash = hashPassword(password);
    
    console.log('📝 Input password:', password);
    console.log('📝 Input hash:', inputHash);
    console.log('📝 Stored hash:', user.password);

    const isPasswordValid = inputHash === user.password;
    
    console.log('🔐 Password match result:', isPasswordValid);

    if (!isPasswordValid) {
      console.log('❌ Password mismatch for:', email);
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    console.log('✅ Password correct!');

    // Generate tokens
    const accessToken = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    const refreshToken = jwt.sign(
      { userId: user._id },
      process.env.JWT_REFRESH_SECRET || 'your-refresh-secret',
      { expiresIn: '30d' }
    );

    console.log('✅ LOGIN SUCCESS:', user.email);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email
        },
        accessToken,
        refreshToken
      }
    });

  } catch (error) {
    console.error('❌ LOGIN ERROR:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error during login'
    });
  }
});

module.exports = router;