// server.js
// Purpose: Minimal Express server to verify setup

require('dotenv').config();
const express = require('express');  // 1. Import Express, the Node.js framework
const rateLimit = require('express-rate-limit');
const config = require('./config/config');
const app = express();              // 2. Create an Express app instance
const helmet = require('helmet');

// Middleware for parsing JSON bodies
app.use(express.json());

// Middleware for handling CORS
app.use((req, res, next) => {
  const allowedOrigins = [
    'https://personal-task-manager-frontend.onrender.com', // Updated Render frontend URL
    'https://personal-task-manager-frontend-bikg.onrender.com', // Alternative pattern
    /^https:\/\/personal-task-manager-frontend.*\.onrender\.com$/, // Pattern for any Render frontend URL
    'http://localhost:5173'
  ];
  
  const origin = req.headers.origin;
  console.log('Request origin:', origin); // Debug logging
  
  // Check if origin matches any allowed origins (including regex patterns)
  const isAllowed = allowedOrigins.some(allowedOrigin => {
    if (typeof allowedOrigin === 'string') {
      return allowedOrigin === origin;
    } else if (allowedOrigin instanceof RegExp) {
      return allowedOrigin.test(origin);
    }
    return false;
  });
  
  if (isAllowed) {
    res.header('Access-Control-Allow-Origin', origin);
  }
  
  // Add these headers
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  next();
});

// Import and use tasks router
const tasksRouter = require('./routes/tasks');
const authRouter = require('./routes/auth');
const { auth } = require('./middleware/auth');

// Rate limiting middleware
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 20 : 100, // 100 attempts in development, 5 in production
  message: {
    error: {
      message: 'Too many login attempts. Please try again later.',
      status: 429
    }
  }
});

// Apply rate limiter to authentication routes
app.use('/auth/login', authLimiter);
app.use('/auth/register', authLimiter);

// Auth routes (unprotected)
app.use('/auth', authRouter);

// Protected routes
app.use('/tasks', auth, tasksRouter);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error details:', err);
  console.error('Error stack:', err.stack);
  res.status(err.status || 500).json({
    error: {
      message: err.message || 'Internal Server Error',
      status: err.status || 500
    }
  });
});

// 4. Basic route to test server
app.get('/', (req, res) => {
  res.send('Backend environment is set up!');
});

// Custom error handling for undefined routes
app.use((req, res) => {
  res.status(404).json({
    error: {
      message: 'Route not found',
      status: 404
    }
  });
});

app.use(helmet());

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});