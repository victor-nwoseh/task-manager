const jwt = require('jsonwebtoken');
const config = require('../config/config');

const auth = (req, res, next) => {
  try {
    // Get token from header
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

    // Verify token
    const decoded = jwt.verify(token, config.jwt.secret);
    
    // Add user data to request
    req.user = decoded;
    
    next();
  } catch (err) {
    res.status(401).json({
      error: {
        message: 'Invalid token',
        status: 401
      }
    });
  }
};

module.exports = {
  auth,
  JWT_SECRET: config.jwt.secret
}; 