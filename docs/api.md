# User Profile Service API Documentation

[![API Version](https://img.shields.io/badge/API%20Version-v1-blue.svg)](https://api.userprofile.com/v1)
[![Documentation](https://img.shields.io/badge/Documentation-Markdown-lightgrey.svg)](./api.md)

## Base URL
```
https://api.userprofile.com/v1
```

## Authentication
All authenticated endpoints require a valid JWT token in the Authorization header:
```
Authorization: Bearer <jwt_token>
```

## Rate Limiting
- 100 requests per IP per 15 minutes for public endpoints
- 1000 requests per IP per 15 minutes for authenticated endpoints

## Endpoints

### Authentication

#### Register New User
```http
POST /auth/register
Content-Type: application/json

{
  "email": "string",
  "password": "string",
  "firstName": "string",
  "lastName": "string"
}
```

**Response:** `201 Created`
```json
{
  "userId": "string",
  "email": "string",
  "verificationToken": "string"
}
```

#### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "string",
  "password": "string"
}
```

**Response:** `200 OK`
```json
{
  "token": "string",
  "refreshToken": "string",
  "expiresIn": 3600
}
```

#### Logout
```http
POST /auth/logout
Authorization: Bearer <token>
```

**Response:** `204 No Content`

#### Refresh Token
```http
POST /auth/refresh
Content-Type: application/json

{
  "refreshToken": "string"
}
```

**Response:** `200 OK`
```json
{
  "token": "string",
  "refreshToken": "string",
  "expiresIn": 3600
}
```

### Password Management

#### Request Password Reset
```http
POST /auth/password/reset-request
Content-Type: application/json

{
  "email": "string"
}
```

**Response:** `202 Accepted`

#### Reset Password
```http
POST /auth/password/reset
Content-Type: application/json

{
  "token": "string",
  "newPassword": "string"
}
```

**Response:** `200 OK`

### Profile Management

#### Get User Profile
```http
GET /profile
Authorization: Bearer <token>
```

**Response:** `200 OK`
```json
{
  "userId": "string",
  "email": "string",
  "firstName": "string",
  "lastName": "string",
  "phoneNumber": "string?",
  "avatar": "string?",
  "role": "string",
  "createdAt": "string",
  "updatedAt": "string"
}
```

#### Update Profile
```http
PATCH /profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "firstName": "string?",
  "lastName": "string?",
  "phoneNumber": "string?"
}
```

**Response:** `200 OK`

#### Upload Profile Photo
```http
POST /profile/photo
Authorization: Bearer <token>
Content-Type: multipart/form-data

file: <image>
```

**Response:** `200 OK`
```json
{
  "avatarUrl": "string"
}
```

### Email Verification

#### Verify Email
```http
POST /auth/verify-email
Content-Type: application/json

{
  "token": "string"
}
```

**Response:** `200 OK`

#### Resend Verification Email
```http
POST /auth/verify-email/resend
Authorization: Bearer <token>
```

**Response:** `202 Accepted`

### Activity Logs

#### Get User Activity
```http
GET /profile/activity
Authorization: Bearer <token>
Query Parameters:
  page: number (default: 1)
  limit: number (default: 20)
```

**Response:** `200 OK`
```json
{
  "activities": [
    {
      "type": "string",
      "description": "string",
      "ipAddress": "string",
      "userAgent": "string",
      "timestamp": "string"
    }
  ],
  "pagination": {
    "total": "number",
    "pages": "number",
    "current": "number",
    "limit": "number"
  }
}
```

## Error Responses

All endpoints can return the following errors:

### 400 Bad Request
```json
{
  "error": "validation_error",
  "message": "string",
  "details": ["string"]
}
```

### 401 Unauthorized
```json
{
  "error": "unauthorized",
  "message": "Invalid or expired token"
}
```

### 403 Forbidden
```json
{
  "error": "forbidden",
  "message": "Insufficient permissions"
}
```

### 429 Too Many Requests
```json
{
  "error": "rate_limit_exceeded",
  "message": "Too many requests",
  "retryAfter": "number"
}
```

### 500 Internal Server Error
```json
{
  "error": "internal_server_error",
  "message": "An unexpected error occurred"
}
```

## Data Models

### User
```json
{
  "id": "string",
  "email": "string",
  "firstName": "string",
  "lastName": "string",
  "phoneNumber": "string?",
  "avatar": "string?",
  "role": "enum(user, admin)",
  "isEmailVerified": "boolean",
  "createdAt": "string",
  "updatedAt": "string"
}
```

### Activity Log
```json
{
  "id": "string",
  "userId": "string",
  "type": "string",
  "description": "string",
  "ipAddress": "string",
  "userAgent": "string",
  "timestamp": "string"
}
```

## Rate Limits and Quotas
- Maximum file upload size: 5MB
- Supported image formats: jpg, jpeg, png
- Session duration: 1 hour
- Refresh token validity: 7 days
- Password reset token validity: 1 hour
- Email verification token validity: 24 hours