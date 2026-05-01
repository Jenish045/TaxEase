require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database Connection
const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/taxease';

mongoose.connect(mongoUri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000
})
  .then(() => {
    console.log('[MongoDB] Connected successfully');
  })
  .catch((error) => {
    console.error('[MongoDB] Connection failed:', error.message);
    process.exit(1);
  });

// Routes
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
  console.log('[Routes] Auth routes loaded');
} catch (error) {
  console.error('[Routes] Failed to load auth routes:', error.message);
}

// Invoice Routes
try {
  const invoiceRoutes = require('./routes/invoices');
  app.use('/api/invoices', invoiceRoutes);
  console.log('[Routes] Invoice routes loaded');
} catch (error) {
  console.error('[Routes] Failed to load invoice routes:', error.message);
}

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Error Handler
app.use((err, req, res, next) => {
  console.error('[Error]', err.message);
  res.status(500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

// Start Server
const server = app.listen(PORT, () => {
  console.log(`[TaxEase] Server running on port ${PORT}`);
  console.log(`[TaxEase] API available at http://localhost:${PORT}/api`);
});

server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`[Error] Port ${PORT} is already in use`);
  } else {
    console.error('[Error] Server error:', error.message);
  }
  process.exit(1);
});

module.exports = app;