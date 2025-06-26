const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key';

class JWTUtils {
  
  // Tạo cặp access token và refresh token
  static generateTokenPair(payload) {
    const accessToken = jwt.sign(
      { ...payload, type: 'access' }, 
      JWT_SECRET, 
      { expiresIn: '15m' }
    );
    
    const refreshToken = jwt.sign(
      { ...payload, type: 'refresh' }, 
      JWT_REFRESH_SECRET, 
      { expiresIn: '7d' }
    );

    return { accessToken, refreshToken };
  }

  // Verify access token
  static verifyAccessToken(token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      if (decoded.type !== 'access') {
        throw new Error('Invalid token type');
      }
      return { valid: true, decoded };
    } catch (error) {
      return { valid: false, error: error.message };
    }
  }

  // Verify refresh token
  static verifyRefreshToken(token) {
    try {
      const decoded = jwt.verify(token, JWT_REFRESH_SECRET);
      if (decoded.type !== 'refresh') {
        throw new Error('Invalid token type');
      }
      return { valid: true, decoded };
    } catch (error) {
      return { valid: false, error: error.message };
    }
  }

  // Tạo OTP token (dùng cho email verification)
  static generateOTPToken(payload, expiresIn = '10m') {
    return jwt.sign(
      { ...payload, type: 'otp' },
      JWT_SECRET,
      { expiresIn }
    );
  }

  // Verify OTP token
  static verifyOTPToken(token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      if (decoded.type !== 'otp') {
        throw new Error('Invalid token type');
      }
      return { valid: true, decoded };
    } catch (error) {
      return { valid: false, error: error.message };
    }
  }

  // Tạo signature cho API liên ngân hàng
  static createAPISignature(data, secretKey) {
    const dataString = typeof data === 'string' ? data : JSON.stringify(data);
    return crypto
      .createHmac('sha256', secretKey)
      .update(dataString)
      .digest('hex');
  }

  // Verify signature cho API liên ngân hàng
  static verifyAPISignature(data, signature, secretKey) {
    const expectedSignature = this.createAPISignature(data, secretKey);
    return crypto.timingSafeEqual(
      Buffer.from(signature, 'hex'),
      Buffer.from(expectedSignature, 'hex')
    );
  }

  // Tạo request ID duy nhất
  static generateRequestId() {
    return crypto.randomUUID();
  }

  // Hash password
  static hashPassword(password) {
    const bcrypt = require('bcrypt');
    return bcrypt.hashSync(password, 12);
  }

  // Verify password
  static verifyPassword(password, hashedPassword) {
    const bcrypt = require('bcrypt');
    return bcrypt.compareSync(password, hashedPassword);
  }

  // Tạo OTP 6 chữ số
  static generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  // Tạo số tài khoản ngẫu nhiên
  static generateAccountNumber() {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `${timestamp}${random}`;
  }
}

module.exports = JWTUtils;