const { Pool } = require('pg');

let pool;

if (process.env.NODE_ENV === 'production') {
  // Production configuration
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });
} else {
  // Local development configuration
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: false
  });
}

// Test the connection
pool.connect((err, client, release) => {
  if (err) {
    return console.error('Error acquiring client:', err.stack);
  }
  console.log('Successfully connected to database');
  release();
});

// Export the pool for use in other files
module.exports = {
  query: (text, params) => pool.query(text, params),
  pool
}; 