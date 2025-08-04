const { body, param, query, validationResult } = require('express-validator');
const { ValidationError } = require('./errorHandler');

/**
 * Middleware to validate request data
 */
const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => ({
      field: error.path,
      message: error.msg,
      value: error.value
    }));

    return res.status(400).json({
      error: 'ValidationError',
      message: 'Request validation failed',
      details: errorMessages
    });
  }

  next();
};

/**
 * Validation rules for payment intents
 */
const validatePaymentIntent = [
  body('amount')
    .isFloat({ min: 0.01 })
    .withMessage('Amount must be a positive number'),
  body('currency')
    .isIn(['usd', 'eur', 'gbp', 'cad', 'aud'])
    .withMessage('Currency must be one of: usd, eur, gbp, cad, aud'),
  body('metadata')
    .optional()
    .isObject()
    .withMessage('Metadata must be an object'),
  validateRequest
];

/**
 * Validation rules for payment methods
 */
const validatePaymentMethod = [
  body('type')
    .isIn(['card', 'bank_account', 'paypal'])
    .withMessage('Payment method type must be card, bank_account, or paypal'),
  body('token')
    .optional()
    .isString()
    .withMessage('Token must be a string'),
  body('card')
    .optional()
    .isObject()
    .withMessage('Card details must be an object'),
  validateRequest
];

/**
 * Validation rules for orders
 */
const validateOrder = [
  body('items')
    .isArray({ min: 1 })
    .withMessage('Order must contain at least one item'),
  body('items.*.product_id')
    .isInt({ min: 1 })
    .withMessage('Product ID must be a positive integer'),
  body('items.*.quantity')
    .isInt({ min: 1 })
    .withMessage('Quantity must be a positive integer'),
  body('shipping_address')
    .isObject()
    .withMessage('Shipping address is required'),
  body('shipping_address.street')
    .isString()
    .trim()
    .isLength({ min: 1 })
    .withMessage('Street address is required'),
  body('shipping_address.city')
    .isString()
    .trim()
    .isLength({ min: 1 })
    .withMessage('City is required'),
  body('shipping_address.state')
    .isString()
    .trim()
    .isLength({ min: 1 })
    .withMessage('State is required'),
  body('shipping_address.postal_code')
    .isString()
    .trim()
    .isLength({ min: 1 })
    .withMessage('Postal code is required'),
  body('shipping_address.country')
    .isString()
    .trim()
    .isLength({ min: 1 })
    .withMessage('Country is required'),
  validateRequest
];

/**
 * Validation rules for refunds
 */
const validateRefund = [
  body('amount')
    .isFloat({ min: 0.01 })
    .withMessage('Refund amount must be a positive number'),
  body('reason')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 1, max: 500 })
    .withMessage('Refund reason must be between 1 and 500 characters'),
  validateRequest
];

/**
 * Validation rules for webhooks
 */
const validateWebhook = [
  body('type')
    .isString()
    .trim()
    .isLength({ min: 1 })
    .withMessage('Webhook type is required'),
  body('data')
    .isObject()
    .withMessage('Webhook data is required'),
  validateRequest
];

/**
 * Validation rules for ID parameters
 */
const validateId = [
  param('id')
    .isUUID()
    .withMessage('ID must be a valid UUID'),
  validateRequest
];

/**
 * Validation rules for pagination
 */
const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  validateRequest
];

/**
 * Validation rules for search queries
 */
const validateSearch = [
  query('q')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Search query must be between 1 and 100 characters'),
  validatePagination
];

module.exports = {
  validateRequest,
  validatePaymentIntent,
  validatePaymentMethod,
  validateOrder,
  validateRefund,
  validateWebhook,
  validateId,
  validatePagination,
  validateSearch
}; 