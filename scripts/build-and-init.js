const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const buildAndInit = async () => {
  console.log('Starting build and initialization process...');
  
  // Only run database initialization if DATABASE_URL is available
  if (!process.env.DATABASE_URL) {
    console.log('DATABASE_URL not found, skipping database initialization');
    console.log('This is normal during build time - database will be initialized on first run');
    return;
  }

  // Create a new pool connection using the DATABASE_URL from Render
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    console.log('Attempting to connect to database...');
    
    // Test the connection with timeout
    const client = await Promise.race([
      pool.connect(),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Connection timeout')), 10000)
      )
    ]);
    
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
    console.log('Database initialization failed (this is normal during build):', error.message);
    console.log('Database will be initialized when the service starts');
  } finally {
    try {
      await pool.end();
      console.log('Database connection closed');
    } catch (err) {
      // Ignore connection close errors
    }
  }
};

// Run the build and initialization
buildAndInit().then(() => {
  console.log('Build process completed');
}).catch((error) => {
  console.log('Build completed with warnings:', error.message);
  // Don't exit with error code to avoid build failure
}); 