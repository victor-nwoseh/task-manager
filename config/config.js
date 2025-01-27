// Create this new file to manage configuration
const config = {
  jwt: {
    secret: process.env.JWT_SECRET || 'your-development-secret-key',
    expiresIn: '24h'
  },
  db: {
    url: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production'
  },
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
  }
};

module.exports = config; 