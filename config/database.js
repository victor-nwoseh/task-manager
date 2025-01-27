const { Pool } = require('pg');

// Database configuration
const pool = process.env.DATABASE_URL
  ? new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false
      }
    })
  : new Pool({
      user: 'postgres',      // default postgres user
      host: 'localhost',     // database host
      database: 'task_manager', // database name
      password: 'victor2005',  // database password
      port: 5432,           // default postgres port
    });

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