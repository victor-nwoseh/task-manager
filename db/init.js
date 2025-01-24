const { pool } = require('../config/database');
const fs = require('fs');
const path = require('path');

const initDatabase = async () => {
  try {
    // Read the schema file
    const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
    
    // Execute the schema
    await pool.query(schema);
    console.log('Database schema initialized successfully');
    
    // Close the pool
    await pool.end();
  } catch (error) {
    console.error('Error initializing database:', error);
    process.exit(1);
  }
};

// Run the initialization
initDatabase(); 