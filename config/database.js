const { Pool } = require('pg');

let pool;

// Log environment for debugging
console.log('Database configuration - NODE_ENV:', process.env.NODE_ENV);
console.log('Database configuration - DATABASE_URL exists:', !!process.env.DATABASE_URL);

// Debug the DATABASE_URL format (safely)
if (process.env.DATABASE_URL) {
  const urlParts = process.env.DATABASE_URL.split('@');
  if (urlParts.length > 1) {
    const hostPart = urlParts[1].split('/')[0];
    console.log('Database host part:', hostPart);
  }
  console.log('DATABASE_URL starts with:', process.env.DATABASE_URL.substring(0, 20) + '...');
} else {
  console.log('DATABASE_URL is not set!');
}

if (process.env.NODE_ENV === 'production') {
  // Production configuration
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    },
    // Add connection pool settings
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  });
} else {
  // Local development configuration
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: false,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  });
}

// Test the connection with better error handling
pool.connect((err, client, release) => {
  if (err) {
    console.error('Error acquiring database client:', err);
    console.error('DATABASE_URL format check:', process.env.DATABASE_URL ? 'URL exists' : 'URL missing');
    
    // Try to parse the URL manually to see what's wrong
    if (process.env.DATABASE_URL) {
      try {
        const url = new URL(process.env.DATABASE_URL);
        console.log('Parsed hostname:', url.hostname);
        console.log('Parsed port:', url.port);
        console.log('Parsed protocol:', url.protocol);
      } catch (parseErr) {
        console.error('Error parsing DATABASE_URL:', parseErr.message);
      }
    }
    return;
  }
  console.log('Successfully connected to database');
  release();
});

// Handle pool errors
pool.on('error', (err, client) => {
  console.error('Unexpected error on idle client', err);
});

// Export the pool for use in other files
module.exports = {
  query: (text, params) => {
    console.log('Executing query:', text.substring(0, 50) + '...');
    return pool.query(text, params);
  },
  pool
}; 