```javascript
const Joi = require('joi');
const { BadRequestError } = require('../utils/errors');

// Base schemas
const idSchema = Joi.string().regex(/^[0-9a-fA-F]{24}$/);
const emailSchema = Joi.string().email().required();
const passwordSchema = Joi.string().min(8).max(72)
  .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
  .required()
  .messages({
    'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, one number and one special character'
  });

// Request validation schemas
const schemas = {
  // Auth routes
  register: Joi.object({
    email: emailSchema,
    password: passwordSchema,
    firstName: Joi.string().min(2).max(50).required(),
    lastName: Joi.string().min(2).max(50).required()
  }),

  login: Joi.object({
    email: emailSchema,
    password: Joi.string().required()
  }),

  forgotPassword: Joi.object({
    email: emailSchema
  }),

  resetPassword: Joi.object({
    token: Joi.string().required(),
    password: passwordSchema
  }),

  // Profile routes  
  updateProfile: Joi.object({
    firstName: Joi.string().min(2).max(50),
    lastName: Joi.string().min(2).max(50),
    phone: Joi.string().regex(/^\+?[\d\s-]{10,}$/),
    bio: Joi.string().max(500),
    birthDate: Joi.date().iso(),
    location: Joi.object({
      country: Joi.string().max(100),
      city: Joi.string().max(100),
      address: Joi.string().max(200)
    })
  }).min(1),

  changePassword: Joi.object({
    currentPassword: Joi.string().required(),
    newPassword: passwordSchema
  }),

  // Admin routes
  updateUserRole: Joi.object({
    userId: idSchema.required(),
    role: Joi.string().valid('user', 'admin', 'moderator').required()
  }),

  // Params validation
  userId: Joi.object({
    userId: idSchema.required()
  })
};

/**
 * Middleware factory for request validation
 * @param {String} schemaName - The name of the schema to validate against
 * @param {String} property - Request property to validate (body, query, params)
 */
const validate = (schemaName, property = 'body') => {
  return async (req, res, next) => {
    try {
      const schema = schemas[schemaName];
      if (!schema) {
        throw new Error(`Schema ${schemaName} not found`);
      }

      const value = await schema.validateAsync(req[property], {
        abortEarly: false,
        stripUnknown: true
      });
      
      // Replace request data with validated data
      req[property] = value;
      next();
    } catch (error) {
      if (error.isJoi) {
        const errors = error.details.map(detail => ({
          field: detail.context.key,
          message: detail.message
        }));
        return next(new BadRequestError('Validation error', errors));
      }
      next(error);
    }
  };
};

// Custom validators
const validateObjectId = (id) => {
  return idSchema.validate(id).error === undefined;
};

const validateEmail = (email) => {
  return emailSchema.validate(email).error === undefined;
};

module.exports = {
  validate,
  validateObjectId,
  validateEmail,
  schemas
};
```