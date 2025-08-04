const express = require('express');
const { supabase } = require('../services/supabase');
const jwt = require('jsonwebtoken');

const router = express.Router();

/**
 * Validate user token
 * POST /api/auth/validate
 */
router.post('/validate', async (req, res, next) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        error: 'ValidationError',
        message: 'Token is required'
      });
    }

    // Verify token with Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({
        error: 'UnauthorizedError',
        message: 'Invalid or expired token'
      });
    }

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          role: user.user_metadata?.role || 'user',
          created_at: user.created_at
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Get user profile
 * GET /api/auth/profile
 */
router.get('/profile', async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        error: 'UnauthorizedError',
        message: 'Token is required'
      });
    }

    // Verify token with Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({
        error: 'UnauthorizedError',
        message: 'Invalid or expired token'
      });
    }

    // Get additional user data from database
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          role: user.user_metadata?.role || 'user',
          created_at: user.created_at,
          profile: userProfile || null
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Refresh token
 * POST /api/auth/refresh
 */
router.post('/refresh', async (req, res, next) => {
  try {
    const { refresh_token } = req.body;

    if (!refresh_token) {
      return res.status(400).json({
        error: 'ValidationError',
        message: 'Refresh token is required'
      });
    }

    // Refresh token with Supabase
    const { data, error } = await supabase.auth.refreshSession({
      refresh_token
    });

    if (error) {
      return res.status(401).json({
        error: 'UnauthorizedError',
        message: 'Invalid refresh token'
      });
    }

    res.json({
      success: true,
      data: {
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
        expires_at: data.session.expires_at
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Logout user
 * POST /api/auth/logout
 */
router.post('/logout', async (req, res, next) => {
  try {
    const { refresh_token } = req.body;

    if (refresh_token) {
      // Sign out with Supabase
      const { error } = await supabase.auth.signOut({
        scope: 'local'
      });

      if (error) {
        console.error('Logout error:', error);
      }
    }

    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router; 