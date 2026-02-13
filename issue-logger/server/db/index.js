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
 * Create users table
 */
const createUsersTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      full_name VARCHAR(255),
      role VARCHAR(50) DEFAULT 'user' CHECK (role IN ('user', 'admin')),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    
    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
  `;

  try {
    await pool.query(query);
    console.log('Table "users" is ready.');
  } catch (err) {
    console.error('Error creating users table:', err);
    throw err;
  }
};

/**
 * Create refresh_tokens table
 */
const createRefreshTokensTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS refresh_tokens (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      token TEXT NOT NULL,
      expires_at TIMESTAMP NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    
    CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_id ON refresh_tokens(user_id);
    CREATE INDEX IF NOT EXISTS idx_refresh_tokens_token ON refresh_tokens(token);
  `;

  try {
    await pool.query(query);
    console.log('Table "refresh_tokens" is ready.');
  } catch (err) {
    console.error('Error creating refresh_tokens table:', err);
    throw err;
  }
};

/**
 * Update issue_logs table to include user_id
 */
const updateIssueLogsTable = async () => {
  const query = `
    -- Add user_id column if it doesn't exist
    DO $$ 
    BEGIN 
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'issue_logs' AND column_name = 'user_id'
      ) THEN
        ALTER TABLE issue_logs ADD COLUMN user_id INTEGER REFERENCES users(id) ON DELETE SET NULL;
        CREATE INDEX idx_issue_logs_user_id ON issue_logs(user_id);
      END IF;
    END $$;
  `;

  try {
    await pool.query(query);
    console.log('Table "issue_logs" updated with user_id.');
  } catch (err) {
    console.error('Error updating issue_logs table:', err);
    throw err;
  }
};

/**
 * Create issue_logs table (original)
 */
const createIssueLogsTable = async () => {
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
    console.error('Error creating issue_logs table:', err);
    throw err;
  }
};

/**
 * Initialize all tables
 */
const createTable = async () => {
  await createUsersTable();
  await createRefreshTokensTable();
  await createIssueLogsTable();
  await updateIssueLogsTable();
  await createUserProfilesTable();
  await createUserPreferencesTable();
  await createUserAddressesTable();
};

/**
 * Create user_profiles table
 */
const createUserProfilesTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS user_profiles (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
      phone VARCHAR(20),
      date_of_birth DATE,
      bio TEXT,
      avatar_url VARCHAR(500),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    
    CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
  `;

  try {
    await pool.query(query);
    console.log('Table "user_profiles" is ready.');
  } catch (err) {
    console.error('Error creating user_profiles table:', err);
    throw err;
  }
};

/**
 * Create user_preferences table
 */
const createUserPreferencesTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS user_preferences (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
      theme VARCHAR(20) DEFAULT 'light',
      language VARCHAR(10) DEFAULT 'en',
      notifications_enabled BOOLEAN DEFAULT true,
      email_notifications BOOLEAN DEFAULT true,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    
    CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);
  `;

  try {
    await pool.query(query);
    console.log('Table "user_preferences" is ready.');
  } catch (err) {
    console.error('Error creating user_preferences table:', err);
    throw err;
  }
};

/**
 * Create user_addresses table
 */
const createUserAddressesTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS user_addresses (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      address_type VARCHAR(20) CHECK (address_type IN ('home', 'work', 'other')),
      street VARCHAR(255),
      city VARCHAR(100),
      state VARCHAR(100),
      postal_code VARCHAR(20),
      country VARCHAR(100),
      is_primary BOOLEAN DEFAULT false,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    
    CREATE INDEX IF NOT EXISTS idx_user_addresses_user_id ON user_addresses(user_id);
  `;

  try {
    await pool.query(query);
    console.log('Table "user_addresses" is ready.');
  } catch (err) {
    console.error('Error creating user_addresses table:', err);
    throw err;
  }
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
