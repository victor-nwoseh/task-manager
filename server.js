// server.js
// Purpose: Minimal Express server to verify setup

const express = require('express');  // 1. Import Express, the Node.js framework
const app = express();              // 2. Create an Express app instance

// Middleware for parsing JSON bodies
app.use(express.json());

// Middleware for handling CORS
app.use((req, res, next) => {
  const allowedOrigins = [
    'https://nwosehstasks.netlify.app',
    'http://localhost:5173'  // Add your local frontend development server
  ];
  
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  }
  
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

// Import and use tasks router
const tasksRouter = require('./routes/tasks');
app.use('/tasks', tasksRouter);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});