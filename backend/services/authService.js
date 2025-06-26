const { User, Employee, Account } = require('../models');
const JWTUtils = require('../utils/jwtUtils');
const EmailService = require('./emailService');

class AuthService {
  
  // Đăng nhập customer
  static async loginCustomer(username, password, recaptchaToken) {
    try {
      // Verify reCAPTCHA (implement riêng hoặc dùng google-recaptcha-v2)
      const isRecaptchaValid = await this.verifyRecaptcha(recaptchaToken);
      if (!isRecaptchaValid) {
        throw new Error('Invalid reCAPTCHA');
      }

      // Tìm user theo username hoặc email
      const user = await User.findOne({
        where: {
          [Op.or]: [
            { username: username },
            { email: username }
          ]
        }
      });

      if (!user) {
        throw new Error('Invalid credentials');
      }

      // Verify password
      const isPasswordValid = JWTUtils.verifyPassword(password, user.password);
      if (!isPasswordValid) {
        throw new Error('Invalid credentials');
      }

      // Tạo tokens
      const tokens = JWTUtils.generateTokenPair({
        id: user.id,
        username: user.username,
        email: user.email,
        role: 'customer'
      });

      // Lấy danh sách tài khoản của user
      const accounts = await Account.findAll({
        where: { userId: user.id },
        attributes: ['id', 'accountNumber', 'balance']
      });

      return {
        success: true,
        data: {
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
            fullName: user.fullName,
            phone: user.phone
          },
          accounts,
          tokens
        }
      };
    } catch (error) {
      return {
        success: false,
        message: error.message
      };
    }
  }

  // Đăng nhập employee/admin
  static async loginEmployee(username, password) {
    try {
      const employee = await Employee.findOne({
        where: {
          [Op.or]: [
            { username: username },
            { email: username }
          ]
        }
      });

      if (!employee) {
        throw new Error('Invalid credentials');
      }

      const isPasswordValid = JWTUtils.verifyPassword(password, employee.password);
      if (!isPasswordValid) {
        throw new Error('Invalid credentials');
      }

      const tokens = JWTUtils.generateTokenPair({
        id: employee.id,
        username: employee.username,
        email: employee.email,
        role: employee.role
      });

      return {
        success: true,
        data: {
          employee: {
            id: employee.id,
            username: employee.username,
            email: employee.email,
            fullName: employee.fullName,
            role: employee.role
          },
          tokens
        }
      };
    } catch (error) {
      return {
        success: false,
        message: error.message
      };
    }
  }

  // Refresh access token
  static async refreshToken(refreshToken) {
    try {
      const verification = JWTUtils.verifyRefreshToken(refreshToken);
      if (!verification.valid) {
        throw new Error('Invalid refresh token');
      }

      const { decoded } = verification;
      
      // Tạo tokens mới
      const newTokens = JWTUtils.generateTokenPair({
        id: decoded.id,
        username: decoded.username,
        email: decoded.email,
        role: decoded.role
      });

      return {
        success: true,
        data: { tokens: newTokens }
      };
    } catch (error) {
      return {
        success: false,
        message: error.message
      };
    }
  }

  // Đổi mật khẩu
  static async changePassword(userId, oldPassword, newPassword, role = 'customer') {
    try {
      const Model = role === 'customer' ? User : Employee;
      const user = await Model.findByPk(userId);

      if (!user) {
        throw new Error('User not found');
      }

      // Verify old password
      const isOldPasswordValid = JWTUtils.verifyPassword(oldPassword, user.password);
      if (!isOldPasswordValid) {
        throw new Error('Current password is incorrect');
      }

      // Hash new password
      const hashedNewPassword = JWTUtils.hashPassword(newPassword);
      
      // Update password
      await user.update({ password: hashedNewPassword });

      return {
        success: true,
        message: 'Password changed successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: error.message
      };
    }
  }

  // Quên mật khẩu - gửi OTP
  static async forgotPassword(email) {
    try {
      // Tìm user theo email
      const user = await User.findOne({ where: { email } });
      if (!user) {
        throw new Error('Email not found');
      }

      // Tạo OTP
      const otp = JWTUtils.generateOTP();
      const otpToken = JWTUtils.generateOTPToken({
        userId: user.id,
        email: user.email,
        otp: otp,
        purpose: 'reset_password'
      }, '10m');

      // Gửi email OTP
      await EmailService.sendPasswordResetOTP(email, otp, user.fullName);

      return {
        success: true,
        message: 'OTP sent to your email',
        data: { otpToken }
      };
    } catch (error) {
      return {
        success: false,
        message: error.message
      };
    }
  }

  // Reset mật khẩu với OTP
  static async resetPassword(otpToken, otp, newPassword) {
    try {
      // Verify OTP token
      const verification = JWTUtils.verifyOTPToken(otpToken);
      if (!verification.valid) {
        throw new Error('Invalid or expired OTP token');
      }

      const { decoded } = verification;
      
      // Verify OTP
      if (decoded.otp !== otp || decoded.purpose !== 'reset_password') {
        throw new Error('Invalid OTP');
      }

      // Find user and update password
      const user = await User.findByPk(decoded.userId);
      if (!user) {
        throw new Error('User not found');
      }

      const hashedPassword = JWTUtils.hashPassword(newPassword);
      await user.update({ password: hashedPassword });

      return {
        success: true,
        message: 'Password reset successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: error.message
      };
    }
  }

  // Verify reCAPTCHA
  static async verifyRecaptcha(recaptchaToken) {
    try {
      const axios = require('axios');
      const secretKey = process.env.RECAPTCHA_SECRET_KEY;
      
      const response = await axios.post(
        'https://www.google.com/recaptcha/api/siteverify',
        null,
        {
          params: {
            secret: secretKey,
            response: recaptchaToken
          }
        }
      );

      return response.data.success;
    } catch (error) {
      console.error('reCAPTCHA verification error:', error);
      return false;
    }
  }

  // Logout (thêm token vào blacklist nếu cần)
  static async logout(accessToken) {
    try {
      // Implement token blacklist nếu cần
      // await TokenBlacklist.create({ token: accessToken });
      
      return {
        success: true,
        message: 'Logged out successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: error.message
      };
    }
  }
}

module.exports = AuthService;