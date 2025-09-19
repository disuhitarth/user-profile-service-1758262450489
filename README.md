# User Profile Service

[![Node.js Version](https://img.shields.io/badge/node-%3E%3D%2016.0.0-brightgreen.svg)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/express-%5E4.18.0-blue.svg)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/mongodb-%5E5.0.0-green.svg)](https://www.mongodb.com/)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

RESTful API service for managing user authentication, profiles, and account management with secure JWT tokens.

## Features

- 🔐 Secure JWT Authentication
- 👥 User Registration & Profile Management
- 🔑 Login/Logout Session Handling
- 📧 Email Verification
- 🔄 Password Reset Flow
- 📸 Profile Photo Upload
- 👮 Role-Based Access Control (RBAC)
- 📝 Activity Logging
- 💾 Redis Session Caching

## Prerequisites

- Node.js >= 16.0.0
- MongoDB >= 5.0.0
- Redis >= 6.0.0
- npm or yarn

## Installation

```bash
# Clone the repository
git clone https://github.com/your-org/user-profile-service.git

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env
```

## Configuration

Create a `.env` file with the following variables:

```env
NODE_ENV=development
PORT=3000
MONGODB_URI=mongodb://localhost:27017/user-profile-db
REDIS_URI=redis://localhost:6379
JWT_SECRET=your-secret-key
JWT_EXPIRATION=24h
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your-email
SMTP_PASS=your-password
```

## API Documentation

### Authentication Endpoints

```
POST /api/auth/register     - Register new user
POST /api/auth/login        - User login
POST /api/auth/logout       - User logout
POST /api/auth/verify-email - Verify email address
POST /api/auth/forgot-password    - Request password reset
POST /api/auth/reset-password     - Reset password
```

### Profile Endpoints

```
GET    /api/profile         - Get user profile
PUT    /api/profile        - Update profile
DELETE /api/profile        - Delete profile
POST   /api/profile/photo  - Upload profile photo
```

### Admin Endpoints

```
GET    /api/admin/users     - List all users
PUT    /api/admin/users/:id - Update user
DELETE /api/admin/users/:id - Delete user
```

## Running the Application

```bash
# Development
npm run dev

# Production
npm start

# Tests
npm test
```

## Docker Support

```bash
# Build image
docker build -t user-profile-service .

# Run container
docker run -p 3000:3000 user-profile-service
```

## Security Features

- JWT token-based authentication
- Password hashing with bcrypt
- Rate limiting
- CORS protection
- XSS prevention
- Input validation with Joi
- Secure HTTP headers
- Session management with Redis

## Testing

```bash
# Run tests with coverage
npm test

# Run specific test suite
npm test -- auth.test.js
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, email support@example.com or open an issue.

## Authors

- **Your Name** - *Initial work* - [YourGithub](https://github.com/yourusername)

## Acknowledgments

- Express.js team
- MongoDB team
- Node.js community

---
Made with ❤️ by [Your Organization](https://your-org.com)