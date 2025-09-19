```javascript
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');
const morgan = require('morgan');
const passport = require('passport');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');

const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const profileRoutes = require('./routes/profile.routes');
const errorHandler = require('./middleware/errorHandler');
const { jwtStrategy } = require('./config/passport');

// Initialize express app
const app = express();

// Security middleware
app.use(helmet()); // Set security HTTP headers
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || 'http://localhost:3000',
  credentials: true
}));
app.use(mongoSanitize()); // Sanitize inputs against NoSQL query injection
app.use(xss()); // Sanitize inputs against XSS attacks
app.use(hpp()); // Protect against HTTP Parameter Pollution attacks

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later'
});
app.use('/api', limiter);

// Body parser middleware
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Gzip compression
app.use(compression());

// Request logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Initialize passport and JWT strategy
app.use(passport.initialize());
passport.use('jwt', jwtStrategy);

// API routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', passport.authenticate('jwt', { session: false }), userRoutes);
app.use('/api/v1/profiles', passport.authenticate('jwt', { session: false }), profileRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API documentation redirect
app.get('/docs', (req, res) => {
  res.redirect(process.env.API_DOCS_URL || '/api-docs');
});

// Handle undefined routes
app.all('*', (req, res) => {
  res.status(404).json({
    status: 'error',
    message: `Cannot find ${req.originalUrl} on this server`
  });
});

// Global error handling middleware
app.use(errorHandler);

// Graceful shutdown handler
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Performing graceful shutdown...');
  // Implement cleanup logic here
  process.exit(0);
});

module.exports = app;
```