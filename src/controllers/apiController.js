```javascript
const User = require('../models/User');
const Profile = require('../models/Profile');
const { validateUser, validateProfile } = require('../validators/userValidator');
const { generateToken, verifyToken } = require('../utils/jwt');
const { hashPassword, comparePassword } = require('../utils/password');
const { sendVerificationEmail, sendPasswordResetEmail } = require('../services/emailService');
const { uploadToS3, deleteFromS3 } = require('../services/storageService');
const { ActivityLogger } = require('../utils/activityLogger');
const createError = require('http-errors');
const redis = require('../config/redis');

// Cache TTL in seconds
const CACHE_TTL = 3600;

class ApiController {
  /**
   * User registration
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object 
   * @param {Function} next - Express next middleware function
   */
  async register(req, res, next) {
    try {
      const { error } = validateUser(req.body);
      if (error) throw createError(400, error.details[0].message);

      const { email, password, firstName, lastName } = req.body;

      const existingUser = await User.findOne({ email });
      if (existingUser) throw createError(409, 'Email already registered');

      const hashedPassword = await hashPassword(password);
      
      const user = new User({
        email,
        password: hashedPassword,
        firstName,
        lastName,
        verificationToken: generateToken({ email }, '24h')
      });

      await user.save();

      await sendVerificationEmail(email, user.verificationToken);

      ActivityLogger.log('user_registered', { userId: user._id });

      res.status(201).json({
        message: 'Registration successful. Please verify your email.',
        userId: user._id
      });

    } catch (err) {
      next(err);
    }
  }

  /**
   * User login
   */
  async login(req, res, next) {
    try {
      const { email, password } = req.body;

      const user = await User.findOne({ email }).select('+password');
      if (!user) throw createError(401, 'Invalid credentials');

      if (!user.isVerified) {
        throw createError(403, 'Please verify your email first');
      }

      const isValidPassword = await comparePassword(password, user.password);
      if (!isValidPassword) throw createError(401, 'Invalid credentials');

      const token = generateToken({ userId: user._id, role: user.role });

      // Store session in Redis
      await redis.setex(`session:${user._id}`, CACHE_TTL, token);

      ActivityLogger.log('user_login', { userId: user._id });

      res.json({
        token,
        user: {
          id: user._id,
          email: user.email,
          role: user.role
        }
      });

    } catch (err) {
      next(err);
    }
  }

  /**
   * User logout
   */
  async logout(req, res, next) {
    try {
      await redis.del(`session:${req.user._id}`);
      ActivityLogger.log('user_logout', { userId: req.user._id });
      res.json({ message: 'Logged out successfully' });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Get user profile
   */
  async getProfile(req, res, next) {
    try {
      const cachedProfile = await redis.get(`profile:${req.user._id}`);
      if (cachedProfile) {
        return res.json(JSON.parse(cachedProfile));
      }

      const profile = await Profile.findOne({ userId: req.user._id });
      if (!profile) throw createError(404, 'Profile not found');

      await redis.setex(
        `profile:${req.user._id}`, 
        CACHE_TTL,
        JSON.stringify(profile)
      );

      res.json(profile);

    } catch (err) {
      next(err);
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(req, res, next) {
    try {
      const { error } = validateProfile(req.body);
      if (error) throw createError(400, error.details[0].message);

      const profile = await Profile.findOneAndUpdate(
        { userId: req.user._id },
        { $set: req.body },
        { new: true, runValidators: true }
      );

      await redis.del(`profile:${req.user._id}`);
      
      ActivityLogger.log('profile_updated', { 
        userId: req.user._id,
        updates: req.body
      });

      res.json(profile);

    } catch (err) {
      next(err);
    }
  }

  /**
   * Upload profile photo
   */
  async uploadProfilePhoto(req, res, next) {
    try {
      if (!req.file) throw createError(400, 'No file uploaded');

      const user = await User.findById(req.user._id);
      
      // Delete old photo if exists
      if (user.profilePhoto) {
        await deleteFromS3(user.profilePhoto);
      }

      const photoUrl = await uploadToS3(req.file, `profile-photos/${req.user._id}`);
      
      user.profilePhoto = photoUrl;
      await user.save();

      await redis.del(`profile:${req.user._id}`);

      ActivityLogger.log('profile_photo_updated', { userId: req.user._id });

      res.json({ photoUrl });

    } catch (err) {
      next(err);
    }
  }

  /**
   * Request password reset
   */
  async requestPasswordReset(req, res, next) {
    try {
      const { email } = req.body;
      
      const user = await User.findOne({ email });
      if (!user) throw createError(404, 'User not found');

      const resetToken = generateToken({ userId: user._id }, '1h');
      
      user.passwordResetToken = resetToken;
      user.passwordResetExpires = Date.now() + 3600000; // 1 hour
      await user.save();

      await sendPasswordResetEmail(email, resetToken);

      ActivityLogger.log('password_reset_requested', { userId: user._id });

      res.json({ message: 'Password reset email sent' });

    } catch (err) {
      next(err);
    }
  }

  /**
   * Reset password
   */
  async resetPassword(req, res, next) {
    try {
      const { token, newPassword } = req.body;

      const decoded = verifyToken(token);
      
      const user = await User.findOne({
        _id: decoded.userId,
        passwordResetToken: token,
        passwordResetExpires: { $gt: Date.now() }
      });

      if (!user) throw createError(400, 'Invalid or expired reset token');

      user.password = await hashPassword(newPassword);
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save();

      // Invalidate all sessions
      await redis.del(`session:${user._id}`);

      ActivityLogger.log('password_reset_completed', { userId: user._id });

      res.json({ message: 'Password reset successful' });

    } catch (err) {
      next(err);
    }
  }

  /**
   * Verify email
   */
  async verifyEmail(req, res, next) {
    try {
      const { token } = req.params;

      const decoded = verifyToken(token);
      
      const user = await User.findOne({
        email: decoded.email,
        verificationToken: token
      });

      if (!user)