const jwt = require('jsonwebtoken');
const { supabase } = require('../services/supabase');

/**
 * Middleware to authenticate JWT tokens
 */
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        error: 'Access token required',
        message: 'Please provide a valid authentication token'
      });
    }

    // Verify token with Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({
        error: 'Invalid token',
        message: 'The provided token is invalid or expired'
      });
    }

    // Add user to request object
    req.user = user;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(500).json({
      error: 'Authentication failed',
      message: 'An error occurred during authentication'
    });
  }
};

/**
 * Middleware to check if user has required role
 */
const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Authentication required',
        message: 'Please authenticate first'
      });
    }

    const userRole = req.user.user_metadata?.role || 'user';
    
    if (!roles.includes(userRole)) {
      return res.status(403).json({
        error: 'Insufficient permissions',
        message: 'You do not have permission to access this resource'
      });
    }

    next();
  };
};

/**
 * Middleware to check if user owns the resource
 */
const requireOwnership = (resourceType) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          error: 'Authentication required',
          message: 'Please authenticate first'
        });
      }

      const resourceId = req.params.id || req.body.id;
      
      if (!resourceId) {
        return res.status(400).json({
          error: 'Resource ID required',
          message: 'Please provide a valid resource ID'
        });
      }

      // Check ownership based on resource type
      let query;
      switch (resourceType) {
        case 'order':
          query = supabase
            .from('orders')
            .select('user_id')
            .eq('id', resourceId)
            .single();
          break;
        case 'payment_method':
          query = supabase
            .from('payment_methods')
            .select('user_id')
            .eq('id', resourceId)
            .single();
          break;
        default:
          return res.status(400).json({
            error: 'Invalid resource type',
            message: 'Unsupported resource type for ownership check'
          });
      }

      const { data, error } = await query;

      if (error || !data) {
        return res.status(404).json({
          error: 'Resource not found',
          message: 'The requested resource does not exist'
        });
      }

      if (data.user_id !== req.user.id) {
        return res.status(403).json({
          error: 'Access denied',
          message: 'You do not have permission to access this resource'
        });
      }

      next();
    } catch (error) {
      console.error('Ownership check error:', error);
      return res.status(500).json({
        error: 'Ownership verification failed',
        message: 'An error occurred while verifying resource ownership'
      });
    }
  };
};

module.exports = {
  authenticateToken,
  requireRole,
  requireOwnership
}; 