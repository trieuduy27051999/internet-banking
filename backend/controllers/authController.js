const { User, RefreshToken, OtpCode, Account } = require('../models');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');
const sendOtpToEmail = require('../utils/sendOtp');

// JWT config
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key';
const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY = '7d';

// Helper: tạo access/refresh token
function generateTokens(payload) {
  const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRY });
  const refreshToken = jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRY });
  return { accessToken, refreshToken };
}

// Đăng ký user mới
exports.register = async (req, res) => {
  try {
    const { username, email, password, full_name, phone } = req.body;
    if (!username || !email || !password || !full_name)
      return res.status(400).json({ error: 'Missing required fields' });

    const exist = await User.findOne({ where: { [Op.or]: [{ username }, { email }] } });
    if (exist) return res.status(400).json({ error: 'Username or email already exists' });

    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({
      username, email, password_hash: hash, full_name, phone, role: 'customer', is_active: false
    });

    // Sinh OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    await OtpCode.create({
      user_id: user.id,
      code: otp,
      type: 'register',
      expires_at: new Date(Date.now() + 10 * 60 * 1000)
    });

    // Gửi email thật
    await sendOtpToEmail(email, otp);

    res.status(201).json({ message: 'User registered. OTP sent to email.', user: { ...user.toJSON(), password_hash: undefined } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Đăng nhập
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password)
      return res.status(400).json({ error: 'Missing username or password' });

    const user = await User.findOne({ where: { username } });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    if (!user.is_active) {
      return res.status(403).json({ error: 'Tài khoản chưa kích hoạt. Vui lòng xác thực OTP.' });
    }

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) return res.status(401).json({ error: 'Invalid credentials' });

    const tokens = generateTokens({ id: user.id, username: user.username, role: user.role });
    // Lưu refresh token vào DB
    await RefreshToken.create({
      user_id: user.id,
      token: tokens.refreshToken,
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    });

    res.json({
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: { ...user.toJSON(), password_hash: undefined }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Đăng xuất (thu hồi refresh token)
exports.logout = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(400).json({ error: 'Missing refresh token' });

    const token = await RefreshToken.findOne({ where: { token: refreshToken } });
    if (token) {
      token.is_revoked = true;
      await token.save();
    }
    res.json({ message: 'Logged out' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Refresh token
exports.refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(400).json({ error: 'Missing refresh token' });

    const tokenRecord = await RefreshToken.findOne({
      where: { token: refreshToken, is_revoked: false, expires_at: { [Op.gt]: new Date() } }
    });
    if (!tokenRecord) return res.status(401).json({ error: 'Invalid or expired refresh token' });

    let payload;
    try {
      payload = jwt.verify(refreshToken, JWT_REFRESH_SECRET);
    } catch {
      return res.status(401).json({ error: 'Invalid refresh token' });
    }

    const user = await User.findByPk(payload.id);
    if (!user || !user.is_active) return res.status(401).json({ error: 'User not found or inactive' });

    const tokens = generateTokens({ id: user.id, username: user.username, role: user.role });
    // Lưu refresh token mới, thu hồi token cũ
    tokenRecord.is_revoked = true;
    await tokenRecord.save();
    await RefreshToken.create({
      user_id: user.id,
      token: tokens.refreshToken,
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    });

    res.json({
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Đổi mật khẩu (yêu cầu xác thực accessToken)
exports.changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword)
      return res.status(400).json({ error: 'Missing old or new password' });

    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const match = await bcrypt.compare(oldPassword, user.password_hash);
    if (!match) return res.status(400).json({ error: 'Old password incorrect' });

    user.password_hash = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ message: 'Password changed successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Quên mật khẩu: gửi OTP (giả lập gửi email)
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Missing email' });

    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Sinh OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    await OtpCode.create({
      user_id: user.id,
      code: otp,
      type: 'password_reset',
      expires_at: new Date(Date.now() + 10 * 60 * 1000)
    });

    // TODO: Gửi email thực tế ở đây
    console.log(`OTP for ${email}: ${otp}`);

    res.json({ message: 'OTP sent to email (check console in dev)' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Xác thực OTP và reset mật khẩu
exports.resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword)
      return res.status(400).json({ error: 'Missing required fields' });

    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const otpRecord = await OtpCode.findOne({
      where: {
        user_id: user.id,
        code: otp,
        type: 'password_reset',
        is_used: false,
        expires_at: { [Op.gt]: new Date() }
      }
    });
    if (!otpRecord) return res.status(400).json({ error: 'Invalid or expired OTP' });

    user.password_hash = await bcrypt.hash(newPassword, 10);
    await user.save();
    otpRecord.is_used = true;
    await otpRecord.save();

    res.json({ message: 'Password reset successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Lấy thông tin user hiện tại (yêu cầu accessToken)
exports.me = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, { attributes: { exclude: ['password_hash'] } });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Xác thực OTP đăng ký
exports.verifyRegisterOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp)
      return res.status(400).json({ error: 'Missing email or otp' });

    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const otpRecord = await OtpCode.findOne({
      where: {
        user_id: user.id,
        code: otp,
        type: 'register',
        is_used: false,
        expires_at: { [Op.gt]: new Date() }
      }
    });
    if (!otpRecord) return res.status(400).json({ error: 'Invalid or expired OTP' });

    user.is_active = true;
    await user.save();
    otpRecord.is_used = true;
    await otpRecord.save();

    // Tạo số tài khoản cho user nếu chưa có
    const existingAccount = await Account.findOne({ where: { user_id: user.id } });
    if (!existingAccount) {
      // Sinh số tài khoản ngẫu nhiên 10 số, đảm bảo không trùng
      let accountNumber;
      do {
        accountNumber = Math.floor(1000000000 + Math.random() * 9000000000).toString();
      } while (await Account.findOne({ where: { account_number: accountNumber } }));

      await Account.create({
        user_id: user.id,
        account_number: accountNumber,
        balance: 0
      });
    }

    res.json({ message: 'Xác thực OTP thành công. Tài khoản đã được kích hoạt!' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};