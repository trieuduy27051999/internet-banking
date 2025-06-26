const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateJWT } = require('../middleware/auth');

// Đăng ký
router.post('/register', authController.register);

// Xác thực OTP đăng ký
router.post('/verify-register-otp', authController.verifyRegisterOtp);

// Đăng nhập
router.post('/login', authController.login);

// Đăng xuất
router.post('/logout', authenticateJWT, authController.logout);

// Refresh token
router.post('/refresh-token', authController.refreshToken);

// Đổi mật khẩu (yêu cầu đăng nhập)
router.post('/change-password', authenticateJWT, authController.changePassword);

// Quên mật khẩu - gửi OTP
router.post('/forgot-password', authController.forgotPassword);

// Xác thực OTP và reset mật khẩu
router.post('/reset-password', authController.resetPassword);

// Lấy thông tin user hiện tại (yêu cầu đăng nhập)
router.get('/me', authenticateJWT, authController.me);



module.exports = router;