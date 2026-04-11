require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

console.log('🚀 Starting TaxEase Backend Server...');

// ==================== MIDDLEWARE ====================

// CORS Configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Body Parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ==================== DATABASE CONNECTION ====================

const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/taxease';

console.log('📡 Connecting to MongoDB...');

mongoose.connect(mongoUri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000
})
  .then(() => {
    console.log('✅ MongoDB connected successfully!');
    console.log('📍 Database:', mongoUri);
  })
  .catch((error) => {
    console.error('❌ MongoDB connection failed:', error);
    process.exit(1);
  });

// ==================== ROUTES ====================

// Test Route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'TaxEase Backend API is running'
  });
});

// Auth Routes
try {
  const authRoutes = require('./routes/auth');
  app.use('/api/auth', authRoutes);
  console.log('✅ Auth routes registered');
} catch (error) {
  console.error('❌ Error loading auth routes:', error.message);
}

// Invoice Routes
try {
  const invoiceRoutes = require('./routes/invoices');
  app.use('/api/invoices', invoiceRoutes);
  console.log('✅ Invoice routes registered');
} catch (error) {
  console.error('❌ Error loading invoice routes:', error.message);
}

// ==================== ERROR HANDLING ====================

// 404 Handler
app.use((req, res) => {
  console.log('❌ 404 - Route not found:', req.method, req.path);
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('❌ Server Error:', err.message);
  res.status(500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

// ==================== START SERVER ====================

const server = app.listen(PORT, () => {
  console.log('');
  console.log('╔════════════════════════════════════════╗');
  console.log('║     🚀 TaxEase Backend Server v1.0    ║');
  console.log('╠════════════════════════════════════════╣');
  console.log(`║  ✅ Server is running on port ${PORT}${' '.repeat(17 - PORT.toString().length)}║`);
  console.log('║  📍 API Routes:                        ║');
  console.log('║     - POST /api/auth/signup            ║');
  console.log('║     - POST /api/auth/login             ║');
  console.log('║     - GET  /api/invoices/list/:userId  ║');
  console.log('║     - POST /api/invoices/create        ║');
  console.log('║     - DELETE /api/invoices/delete/:id  ║');
  console.log('╚════════════════════════════════════════╝');
  console.log('');
});

// Handle Server Errors
server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} is already in use!`);
  } else {
    console.error('❌ Server error:', error);
  }
  process.exit(1);
});

module.exports = app;