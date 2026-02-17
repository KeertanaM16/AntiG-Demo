const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');
const { JWT_SECRET, JWT_REFRESH_SECRET } = require('../middleware/auth');

const register = async (req, res) => {
  const { 
    email, password, full_name, role,
    // Profile data
    phone, date_of_birth, bio,
    // Preferences
    theme, language, notifications_enabled,
    // Address
    street, city, state, postal_code, country, address_type
  } = req.body;

  // Validation
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters.' });
  }

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Invalid email format.' });
  }

  // Date Validation
  if (date_of_birth) {
    const dateCheck = new Date(date_of_birth);
    if (isNaN(dateCheck.getTime())) {
       return res.status(400).json({ error: 'Invalid date of birth format.' });
    }
  }

  try {
    // Check if user already exists
    const existingUser = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(409).json({ error: 'User already exists.' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Determine role
    const userRole = role === 'admin' ? 'admin' : 'user';

    // 1. Insert user into users table
    const userQuery = `
      INSERT INTO users (email, password, full_name, role) 
      VALUES ($1, $2, $3, $4) 
      RETURNING id, email, full_name, role, created_at
    `;
    const userValues = [email, hashedPassword, full_name || null, userRole];
    const userResult = await db.query(userQuery, userValues);
    const user = userResult.rows[0];

    db.query(
      `INSERT INTO user_profiles (user_id, phone, date_of_birth, bio) 
       VALUES ($1, $2, $3, $4)`,
      [user.id, phone || null, date_of_birth || null, bio || null]
    ).catch(err => {}); 

    await db.query(
      `INSERT INTO user_preferences (user_id, theme, language, notifications_enabled) 
       VALUES ($1, $2, $3, $4)`,
      [user.id, theme || 'light', language || 'en', notifications_enabled !== false]
    );

    if (street && city) {
      await db.query(
        `INSERT INTO user_addresses (user_id, address_type, street, city, state, postal_code, country, is_primary) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [user.id, address_type || 'home', street, city, state || null, postal_code || null, country || null, true]
      );
    }

    res.status(201).json({
      message: 'User registered successfully!',
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
        created_at: user.created_at
      }
    });
  } catch (err) {
    console.error('Error registering user:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

/**
 * Login user
 */
const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  try {
    // Find user
    const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    const user = result.rows[0];

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    // Generate access token (expires in 15 minutes)
    const accessToken = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '15m' }
    );

    // Generate refresh token (expires in 7 days)
    const refreshToken = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      JWT_REFRESH_SECRET,
      { expiresIn: '7d' }
    );

    // Store refresh token in database
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    await db.query(
      'INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)',
      [user.id, refreshToken, expiresAt]
    );

    // Set cookies
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000 // 15 minutes
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.status(200).json({
      message: 'Login successful!',
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        role: user.role
      }
    });
  } catch (err) {
    console.error('Error logging in:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

/**
 * Refresh access token
 */
const refreshAccessToken = async (req, res) => {
  try {
    const refreshToken = req.cookies?.refreshToken || req.body.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({ error: 'Refresh token not provided.' });
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET);

    // Check if refresh token exists in database
    const result = await db.query(
      'SELECT * FROM refresh_tokens WHERE token = $1 AND user_id = $2 AND expires_at > NOW()',
      [refreshToken, decoded.userId]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid or expired refresh token.' });
    }

    // Generate new access token
    const accessToken = jwt.sign(
      { userId: decoded.userId, email: decoded.email, role: decoded.role },
      JWT_SECRET,
      { expiresIn: '15m' }
    );

    // Set cookie
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000
    });

    res.status(200).json({
      message: 'Token refreshed successfully!',
      accessToken
    });
  } catch (err) {
    console.error('Error refreshing token:', err);
    res.status(401).json({ error: 'Invalid refresh token.' });
  }
};

/**
 * Logout user
 */
const logout = async (req, res) => {
  try {
    const refreshToken = req.cookies?.refreshToken || req.body.refreshToken;

    if (refreshToken) {
      // Delete refresh token from database
      await db.query('DELETE FROM refresh_tokens WHERE token = $1', [refreshToken]);
    }

    // Clear cookies
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');

    res.status(200).json({ message: 'Logout successful!' });
  } catch (err) {
    console.error('Error logging out:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

/**
 * Get current user profile
 */
const getProfile = async (req, res) => {
  try {
    // 1. Get User Basic Info
    const userResult = await db.query(
      'SELECT id, email, full_name, role, created_at FROM users WHERE id = $1',
      [req.user.userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const user = userResult.rows[0];

    // 2. Get Profile Data
    // Note: This might be missing if the partial insertion bug occurred
    const profileResult = await db.query(
      'SELECT phone, date_of_birth, bio FROM user_profiles WHERE user_id = $1',
      [userResult.rows[0].id]
    );
    const profile = profileResult.rows[0] || null;

    // 3. Get Preferences
    const preferencesResult = await db.query(
      'SELECT theme, language, notifications_enabled FROM user_preferences WHERE user_id = $1',
      [userResult.rows[0].id]
    );
    const preferences = preferencesResult.rows[0] || {};

    // 4. Get Address
    const addressResult = await db.query(
      'SELECT street, city, state, postal_code, country FROM user_addresses WHERE user_id = $1',
      [userResult.rows[0].id]
    );
    const address = addressResult.rows[0] || null;

    // Return combined data structure
    res.status(200).json({
      user: {
        ...user,
        profile,
        preferences,
        address
      }
    });

  } catch (err) {
    console.error('Error fetching profile:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

module.exports = {
  register,
  login,
  refreshAccessToken,
  logout,
  getProfile
};
