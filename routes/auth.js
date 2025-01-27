const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../middleware/auth');
const db = require('../config/database');
const { passwordValidator } = require('../middleware/validation');

// Register new user
router.post('/register', async (req, res, next) => {
  try {
    const { username, password } = req.body;

    // Validate input
    if (!username || !password) {
      return res.status(400).json({
        error: {
          message: 'Username and password are required',
          status: 400
        }
      });
    }

    // Validate password complexity
    const passwordValidation = passwordValidator(password);
    if (!passwordValidation.isValid) {
      return res.status(400).json({
        error: {
          message: 'Password does not meet requirements',
          details: passwordValidation.errors,
          status: 400
        }
      });
    }

    // Check if username already exists
    const userExists = await db.query(
      'SELECT id FROM users WHERE username = $1',
      [username]
    );

    if (userExists.rows.length > 0) {
      return res.status(400).json({
        error: {
          message: 'Username already exists',
          status: 400
        }
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Insert user into database
    const result = await db.query(
      'INSERT INTO users (username, password_hash) VALUES ($1, $2) RETURNING id, username',
      [username, passwordHash]
    );

    // Create JWT token
    const token = jwt.sign(
      { id: result.rows[0].id, username: result.rows[0].username },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: result.rows[0].id,
        username: result.rows[0].username
      },
      token
    });
  } catch (err) {
    next(err);
  }
});

// Login user
router.post('/login', async (req, res, next) => {
  try {
    const { username, password } = req.body;

    // Validate input
    if (!username || !password) {
      return res.status(400).json({
        error: {
          message: 'Username and password are required',
          status: 400
        }
      });
    }

    // Get user from database
    const result = await db.query(
      'SELECT id, username, password_hash FROM users WHERE username = $1',
      [username]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        error: {
          message: 'Invalid credentials',
          status: 401
        }
      });
    }

    const user = result.rows[0];

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({
        error: {
          message: 'Invalid credentials',
          status: 401
        }
      });
    }

    // Create JWT token
    const token = jwt.sign(
      { id: user.id, username: user.username },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        username: user.username
      },
      token
    });
  } catch (err) {
    next(err);
  }
});

// Verify token
router.get('/verify', async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: {
          message: 'No token provided',
          status: 401
        }
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    // Get fresh user data from database
    const result = await db.query(
      'SELECT id, username FROM users WHERE id = $1',
      [decoded.id]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        error: {
          message: 'User not found',
          status: 401
        }
      });
    }

    res.json({
      user: result.rows[0]
    });
  } catch (err) {
    res.status(401).json({
      error: {
        message: 'Invalid token',
        status: 401
      }
    });
  }
});

module.exports = router; 