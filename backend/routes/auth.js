// backend/routes/auth.js
const express = require('express');
const router = express.Router();
const AuthService = require('../services/authService');
const { authenticateCustomer, authenticateEmployee } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

// Validation rules
const loginValidation = [
  body('username').notEmpty().withMessage('Username is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('recaptchaToken').optional()
];

const changePasswordValidation = [
  body('oldPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters')
];

const forgotPasswordValidation = [
  body('email').isEmail().withMessage('Valid email is required')
];

const resetPasswordValidation = [
  body('otpToken').notEmpty().withMessage('OTP token is required'),
  body('otp').isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits'),
  body('newPassword').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
];

// Helper function to handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

// POST /api/auth/customer/login
router.post('/customer/login', loginValidation, handleValidationErrors, async (req, res) => {
  try {
    const { username, password, recaptchaToken } = req.body;
    
    const result = await AuthService.loginCustomer(username, password, recaptchaToken);
    
    if (result.success) {
      res.json({
        success: true,
        message: 'Login successful',
        data: result.data
      });
    } else {
      res.status(401).json({
        success: false,
        message: result.message
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// POST /api/auth/employee/login
router.post('/employee/login', loginValidation, handleValidationErrors, async (req, res) => {
  try {
    const { username, password } = req.body;
    
    const result = await AuthService.loginEmployee(username, password);
    
    if (result.success) {
      res.json({
        success: true,
        message: 'Login successful',
        data: result.data
      });
    } else {
      res.status(401).json({
        success: false,
        message: result.message
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// POST /api/auth/refresh-token
router.post('/refresh-token', async (req, res) => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: 'Refresh token is required'
      });
    }

    const result = await AuthService.refreshToken(refreshToken);
    
    if (result.success) {
      res.json({
        success: true,
        message: 'Token refreshed successfully',
        data: result.data
      });
    } else {
      res.status(401).json({
        success: false,
        message: result.message
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// POST /api/auth/customer/change-password
router.post('/customer/change-password', 
  authenticateCustomer, 
  changePasswordValidation, 
  handleValidationErrors, 
  async (req, res) => {
    try {
      const { oldPassword, newPassword } = req.body;
      const userId = req.user.id;
      
      const result = await AuthService.changePassword(userId, oldPassword, newPassword, 'customer');
      
      if (result.success) {
        res.json({
          success: true,
          message: result.message
        });
      } else {
        res.status(400).json({
          success: false,
          message: result.message
        });
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
);

// POST /api/auth/employee/change-password
router.post('/employee/change-password', 
  authenticateEmployee, 
  changePasswordValidation, 
  handleValidationErrors, 
  async (req, res) => {
    try {
      const { oldPassword, newPassword } = req.body;
      const userId = req.user.id;
      
      const result = await AuthService.changePassword(userId, oldPassword, newPassword, 'employee');
      
      if (result.success) {
        res.json({
          success: true,
          message: result.message
        });
      } else {
        res.status(400).json({
          success: false,
          message: result.message
        });
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
);

// POST /api/auth/forgot-password
router.post('/forgot-password', 
  forgotPasswordValidation, 
  handleValidationErrors, 
  async (req, res) => {
    try {
      const { email } = req.body;
      
      const result = await AuthService.forgotPassword(email);
      
      if (result.success) {
        res.json({
          success: true,
          message: result.message,
          data: result.data
        });
      } else {
        res.status(400).json({
          success: false,
          message: result.message
        });
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
);

// POST /api/auth/reset-password
router.post('/reset-password', 
  resetPasswordValidation, 
  handleValidationErrors, 
  async (req, res) => {
    try {
      const { otpToken, otp, newPassword } = req.body;
      
      const result = await AuthService.resetPassword(otpToken, otp, newPassword);
      
      if (result.success) {
        res.json({
          success: true,
          message: result.message
        });
      } else {
        res.status(400).json({
          success: false,
          message: result.message
        });
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
);

// POST /api/auth/logout
router.post('/logout', authenticateCustomer, async (req, res) => {
  try {
    const accessToken = req.headers['authorization']?.split(' ')[1];
    
    const result = await AuthService.logout(accessToken);
    
    res.json({
      success: true,
      message: result.message
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// GET /api/auth/me - Get current user info
router.get('/me', authenticateCustomer, async (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        user: req.user
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;