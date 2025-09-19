```javascript
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');
const upload = require('../middleware/upload');
const { 
  authController,
  userController,
  profileController
} = require('../controllers');
const { 
  registerSchema,
  loginSchema, 
  updateProfileSchema,
  resetPasswordSchema,
  emailVerificationSchema
} = require('../validators/auth');

// Auth routes
router.post(
  '/auth/register',
  validate(registerSchema),
  authController.register
);

router.post(
  '/auth/login',
  validate(loginSchema), 
  authController.login
);

router.post(
  '/auth/logout',
  auth(),
  authController.logout
);

router.post(
  '/auth/refresh-token',
  authController.refreshToken
);

router.post(
  '/auth/forgot-password',
  validate(emailVerificationSchema),
  authController.forgotPassword
);

router.post(
  '/auth/reset-password',
  validate(resetPasswordSchema),
  authController.resetPassword
);

router.post(
  '/auth/verify-email',
  validate(emailVerificationSchema),
  authController.verifyEmail
);

// User routes
router.get(
  '/users/me',
  auth(),
  userController.getProfile
);

router.patch(
  '/users/me',
  auth(),
  validate(updateProfileSchema),
  userController.updateProfile
);

router.delete(
  '/users/me',
  auth(),
  userController.deleteAccount
);

router.post(
  '/users/me/photo',
  auth(),
  upload.single('photo'),
  userController.uploadPhoto
);

router.delete(
  '/users/me/photo',
  auth(),
  userController.deletePhoto
);

// Admin routes
router.get(
  '/admin/users',
  auth('admin'),
  userController.getAllUsers
);

router.get(
  '/admin/users/:userId',
  auth('admin'),
  userController.getUser
);

router.patch(
  '/admin/users/:userId',
  auth('admin'),
  validate(updateProfileSchema),
  userController.updateUser
);

router.delete(
  '/admin/users/:userId',
  auth('admin'),
  userController.deleteUser
);

// Profile routes
router.get(
  '/profiles',
  profileController.getPublicProfiles
);

router.get(
  '/profiles/:username',
  profileController.getPublicProfile
);

router.get(
  '/profiles/:username/activity',
  profileController.getUserActivity
);

// Session routes
router.get(
  '/sessions',
  auth(),
  userController.getActiveSessions
);

router.delete(
  '/sessions/:sessionId',
  auth(),
  userController.revokeSession
);

router.delete(
  '/sessions',
  auth(),
  userController.revokeAllSessions
);

// Health check
router.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK' });
});

module.exports = router;
```