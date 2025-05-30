const { Pool } = require('pg');

console.log('=== Database Connection Test ===');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL);

if (process.env.DATABASE_URL) {
  console.log('DATABASE_URL length:', process.env.DATABASE_URL.length);
  console.log('DATABASE_URL starts with:', process.env.DATABASE_URL.substring(0, 30) + '...');
  
  // Try to parse the URL
  try {
    const url = new URL(process.env.DATABASE_URL);
    console.log('Parsed successfully:');
    console.log('  Protocol:', url.protocol);
    console.log('  Hostname:', url.hostname);
    console.log('  Port:', url.port);
    console.log('  Database:', url.pathname);
    console.log('  Username:', url.username);
    console.log('  Password length:', url.password ? url.password.length : 0);
  } catch (err) {
    console.error('Failed to parse DATABASE_URL:', err.message);
  }
  
  // Try to connect
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });
  
  pool.connect()
    .then(client => {
      console.log('✅ Database connection successful!');
      client.release();
      pool.end();
    })
    .catch(err => {
      console.error('❌ Database connection failed:', err.message);
      console.error('Error code:', err.code);
      console.error('Error hostname:', err.hostname);
      pool.end();
    });
} else {
  console.error('❌ DATABASE_URL is not set!');
} 