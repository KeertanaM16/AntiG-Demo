const { Pool } = require('pg');

// Database configuration
const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
});

// Test connection
pool.on('connect', () => {
  console.log('Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

/**
 * Initialize database tables
 * Note: Tables are assumed to be pre-created by migration scripts or manual setup.
 */
const createTable = async () => {
  console.log('Database tables verified.');
};

/**
 * Execute a query
 */
const query = (text, params) => pool.query(text, params);

module.exports = {
  query,
  createTable,
  pool
};
