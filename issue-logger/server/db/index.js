const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  ssl: {
    rejectUnauthorized: false,
  },
});

const createTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS issue_logs (
      id SERIAL PRIMARY KEY,
      issue_text TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
  try {
    await pool.query(query);
    console.log('Table "issue_logs" is ready.');
  } catch (err) {
    console.error('Error creating table:', err);
  }
};

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool, // Exporting pool directly just in case
  createTable,
};
