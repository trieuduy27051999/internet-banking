const jwt = require('jsonwebtoken');
const { User, OtpCode } = require('../models');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Middleware xác thực JWT (dành cho tất cả user)
exports.authenticateJWT = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ error: 'Access token required' });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    // Lấy user từ DB và kiểm tra trạng thái
    const user = await User.findByPk(decoded.id);
    if (!user || !user.is_active) {
      return res.status(401).json({ error: 'User not found or inactive' });
    }

    req.user = {
      id: user.id,
      username: user.username,
      role: user.role
    };
    next();
  } catch (err) {
    res.status(500).json({ error: 'Authentication error' });
  }
};

// Middleware phân quyền (role: 'admin', 'employee', 'customer')
exports.authorizeRoles = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  next();
};

// Middleware xác thực OTP cho nghiệp vụ (ví dụ: chuyển tiền, reset mật khẩu)
exports.verifyOtp = (typeField = 'type') => async (req, res, next) => {
  try {
    const { otp, otp_type, reference_id } = req.body;
    if (!otp || !otp_type) {
      return res.status(400).json({ error: 'OTP and OTP type required' });
    }

    const otpRecord = await OtpCode.findOne({
      where: {
        user_id: req.user.id,
        code: otp,
        type: otp_type,
        is_used: false,
        expires_at: { [require('sequelize').Op.gt]: new Date() },
        ...(reference_id ? { reference_id } : {})
      }
    });

    if (!otpRecord) {
      return res.status(400).json({ error: 'Invalid or expired OTP' });
    }

    // Đánh dấu OTP đã dùng
    otpRecord.is_used = true;
    await otpRecord.save();

    next();
  } catch (err) {
    res.status(500).json({ error: 'OTP verification error' });
  }
};