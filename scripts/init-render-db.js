const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const initRenderDatabase = async () => {
  // Create a new pool connection using the DATABASE_URL from Render
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? {
      rejectUnauthorized: false
    } : false
  });

  try {
    console.log('Connecting to database...');
    
    // Test the connection
    const client = await pool.connect();
    console.log('Successfully connected to database');
    client.release();

    // Check if tables already exist
    const tablesExist = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'users'
      );
    `);

    if (tablesExist.rows[0].exists) {
      console.log('Database tables already exist, skipping initialization');
      return;
    }

    // Read the schema file
    const schemaPath = path.join(__dirname, '..', 'db', 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    console.log('Executing database schema...');
    // Execute the schema
    await pool.query(schema);
    console.log('Database schema initialized successfully');
    
  } catch (error) {
    console.error('Error initializing database:', error);
    // Don't exit the process, just log the error
    // The server should still try to start
  } finally {
    // Close the pool
    await pool.end();
    console.log('Database connection closed');
  }
};

// Only run if this file is executed directly
if (require.main === module) {
  initRenderDatabase();
} else {
  // Export for use in other files
  module.exports = initRenderDatabase;
} 