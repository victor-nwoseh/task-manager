const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const initRenderDatabase = async () => {
  // Create a new pool connection using the DATABASE_URL from Render
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    console.log('Connecting to Render database...');
    
    // Test the connection
    const client = await pool.connect();
    console.log('Successfully connected to database');
    client.release();

    // Read the schema file
    const schemaPath = path.join(__dirname, '..', 'db', 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    console.log('Executing database schema...');
    // Execute the schema
    await pool.query(schema);
    console.log('Database schema initialized successfully');
    
  } catch (error) {
    console.error('Error initializing database:', error);
    process.exit(1);
  } finally {
    // Close the pool
    await pool.end();
    console.log('Database connection closed');
  }
};

// Run the initialization
initRenderDatabase(); 