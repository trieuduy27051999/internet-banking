const jwt = require('jsonwebtoken');
const { User, Employee } = require('../models');

// Cấu hình JWT
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key';
const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY = '7d';

// Tạo JWT tokens
const generateTokens = (payload) => {
  const accessToken = jwt.sign(payload, JWT_SECRET, { 
    expiresIn: ACCESS_TOKEN_EXPIRY 
  });
  
  const refreshToken = jwt.sign(payload, JWT_REFRESH_SECRET, { 
    expiresIn: REFRESH_TOKEN_EXPIRY 
  });

  return { accessToken, refreshToken };
};

// Middleware xác thực cho Customer
const authenticateCustomer = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token is required'
      });
    }

    // Verify access token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Kiểm tra user tồn tại và role
    const user = await User.findByPk(decoded.id);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    // Gán thông tin user vào request
    req.user = {
      id: user.id,
      username: user.username,
      email: user.email,
      role: 'customer'
    };

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Access token expired',
        code: 'TOKEN_EXPIRED'
      });
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid access token'
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Authentication error'
    });
  }
};

// Middleware xác thực cho Employee
const authenticateEmployee = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token is required'
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    
    const employee = await Employee.findByPk(decoded.id);
    if (!employee) {
      return res.status(401).json({
        success: false,
        message: 'Employee not found'
      });
    }

    req.user = {
      id: employee.id,
      username: employee.username,
      email: employee.email,
      role: employee.role // 'employee' hoặc 'admin'
    };

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Access token expired',
        code: 'TOKEN_EXPIRED'
      });
    }
    
    return res.status(401).json({
      success: false,
      message: 'Invalid access token'
    });
  }
};

// Middleware xác thực cho Admin
const authenticateAdmin = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token is required'
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    
    const employee = await Employee.findByPk(decoded.id);
    if (!employee || employee.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    req.user = {
      id: employee.id,
      username: employee.username,
      email: employee.email,
      role: employee.role
    };

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Access token expired',
        code: 'TOKEN_EXPIRED'
      });
    }
    
    return res.status(403).json({
      success: false,
      message: 'Admin access required'
    });
  }
};

// Middleware refresh token
const refreshAccessToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token is required'
      });
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET);
    
    // Tạo access token mới
    const newTokens = generateTokens({
      id: decoded.id,
      username: decoded.username,
      role: decoded.role
    });

    res.json({
      success: true,
      data: {
        accessToken: newTokens.accessToken,
        refreshToken: newTokens.refreshToken
      }
    });
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Refresh token expired'
      });
    }
    
    return res.status(401).json({
      success: false,
      message: 'Invalid refresh token'
    });
  }
};

// Middleware xác thực API liên ngân hàng
const authenticateExternalBank = (req, res, next) => {
  try {
    const signature = req.headers['x-signature'];
    const timestamp = req.headers['x-timestamp'];
    const bankCode = req.headers['x-bank-code'];

    if (!signature || !timestamp || !bankCode) {
      return res.status(401).json({
        success: false,
        message: 'Missing required headers for external bank authentication'
      });
    }

    // Kiểm tra timestamp để tránh replay attack
    const now = Date.now();
    const requestTime = parseInt(timestamp);
    const timeDiff = Math.abs(now - requestTime);
    
    // Cho phép chênh lệch tối đa 5 phút
    if (timeDiff > 5 * 60 * 1000) {
      return res.status(401).json({
        success: false,
        message: 'Request timestamp is too old'
      });
    }

    // Lưu thông tin ngân hàng vào request
    req.externalBank = {
      bankCode,
      signature,
      timestamp
    };

    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'External bank authentication error'
    });
  }
};

module.exports = {
  generateTokens,
  authenticateCustomer,
  authenticateEmployee,
  authenticateAdmin,
  refreshAccessToken,
  authenticateExternalBank,
  JWT_SECRET,
  JWT_REFRESH_SECRET
};