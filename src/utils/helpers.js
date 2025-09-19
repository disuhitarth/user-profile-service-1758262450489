```javascript
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const config = require('../config');

/**
 * Generate a cryptographically secure random token
 * @param {number} bytes - Number of bytes for token
 * @returns {string} Random hex token
 */
const generateSecureToken = (bytes = 32) => {
  return crypto.randomBytes(bytes).toString('hex');
};

/**
 * Generate JWT token with user data
 * @param {Object} user - User object with id and role
 * @returns {string} Signed JWT token
 */
const generateJWT = (user) => {
  const payload = {
    id: user.id,
    role: user.role,
    iat: Date.now()
  };
  return jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn
  });
};

/**
 * Verify and decode JWT token
 * @param {string} token - JWT token to verify
 * @returns {Object|null} Decoded token payload or null if invalid
 */
const verifyJWT = (token) => {
  try {
    return jwt.verify(token, config.jwt.secret);
  } catch (err) {
    return null;
  }
};

/**
 * Generate password reset token
 * @returns {Object} Token and expiry
 */
const generatePasswordResetToken = () => {
  return {
    token: generateSecureToken(),
    expires: Date.now() + config.passwords.resetTokenExpiry
  };
};

/**
 * Generate email verification token
 * @returns {Object} Token and expiry  
 */
const generateEmailVerificationToken = () => {
  return {
    token: generateSecureToken(16),
    expires: Date.now() + config.email.verificationTokenExpiry
  };
};

/**
 * Check if timestamp is expired
 * @param {number} timestamp - Timestamp to check
 * @returns {boolean} True if expired
 */
const isExpired = (timestamp) => {
  return Date.now() > timestamp;
};

/**
 * Normalize email address
 * @param {string} email - Email to normalize
 * @returns {string} Normalized email
 */
const normalizeEmail = (email) => {
  return email.toLowerCase().trim();
};

/**
 * Generate session ID
 * @returns {string} Session ID
 */
const generateSessionId = () => {
  return generateSecureToken(24);
};

/**
 * Sanitize user object by removing sensitive fields
 * @param {Object} user - User object to sanitize
 * @returns {Object} Sanitized user object
 */
const sanitizeUser = (user) => {
  const sanitized = { ...user };
  delete sanitized.password;
  delete sanitized.resetToken;
  delete sanitized.verificationToken;
  delete sanitized.__v;
  return sanitized;
};

/**
 * Generate activity log entry
 * @param {string} userId - User ID
 * @param {string} action - Activity action
 * @param {Object} details - Additional details
 * @returns {Object} Activity log entry
 */
const generateActivityLog = (userId, action, details = {}) => {
  return {
    userId,
    action,
    details,
    timestamp: new Date(),
    ip: details.ip || null
  };
};

/**
 * Parse authorization header
 * @param {string} authHeader - Authorization header
 * @returns {string|null} Token or null if invalid
 */
const parseAuthHeader = (authHeader) => {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.substring(7);
};

/**
 * Calculate pagination values
 * @param {number} page - Page number
 * @param {number} limit - Items per page
 * @returns {Object} Skip and limit values
 */
const getPagination = (page = 1, limit = 10) => {
  return {
    skip: (page - 1) * limit,
    limit: parseInt(limit)
  };
};

module.exports = {
  generateSecureToken,
  generateJWT,
  verifyJWT,
  generatePasswordResetToken,
  generateEmailVerificationToken,
  isExpired,
  normalizeEmail,
  generateSessionId,
  sanitizeUser,
  generateActivityLog,
  parseAuthHeader,
  getPagination
};
```