const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key';

/**
 * Middleware to verify JWT access token
 */
const verifyToken = (req, res, next) => {
  try {
    // Get token from header or cookie
    const token = req.headers.authorization?.split(' ')[1] || req.cookies?.accessToken;

    if (!token) {
      return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // { userId, email, role }
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired.' });
    }
    return res.status(401).json({ error: 'Invalid token.' });
  }
};

/**
 * Middleware to check if user is admin
 */
const isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied. Admin only.' });
  }
  next();
};

/**
 * Middleware to verify refresh token
 */
const verifyRefreshToken = (req, res, next) => {
  try {
    const refreshToken = req.cookies?.refreshToken || req.body.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({ error: 'Refresh token not provided.' });
    }

    const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid refresh token.' });
  }
};

module.exports = {
  verifyToken,
  isAdmin,
  verifyRefreshToken,
  JWT_SECRET,
  JWT_REFRESH_SECRET
};
