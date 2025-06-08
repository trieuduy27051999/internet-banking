const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    // Cấu hình SMTP transporter
    this.transporter = nodemailer.createTransporter({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: process.env.SMTP_PORT || 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER, // Gmail address
        pass: process.env.SMTP_PASS  // Gmail app password
      }
    });
  }

  // Template cho email OTP chuyển khoản
  static getTransferOTPTemplate(recipientName, amount, recipientAccount, otp) {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>Xác thận giao dịch chuyển khoản</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #1976d2; color: white; padding: 20px; text-align: center; }
            .content { background: #f9f9f9; padding: 20px; border: 1px solid #ddd; }
            .otp-box { background: #fff; border: 2px solid #1976d2; padding: 15px; text-align: center; margin: 20px 0; }
            .otp-code { font-size: 24px; font-weight: bold; color: #1976d2; letter-spacing: 3px; }
            .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
            .warning { background: #fff3cd; border: 1px solid #ffeaa7; padding: 10px; margin: 10px 0; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🏦 Internet Banking</h1>
                <h2>Xác thận giao dịch chuyển khoản</h2>
            </div>
            
            <div class="content">
                <p>Kính chào <strong>${recipientName}</strong>,</p>
                
                <p>Bạn vừa thực hiện yêu cầu chuyển khoản với thông tin sau:</p>
                
                <table style="width: 100%; border-collapse: collapse; margin: 15px 0;">
                    <tr style="background: #f8f9fa;">
                        <td style="padding: 10px; border: 1px solid #dee2e6; font-weight: bold;">Số tiền:</td>
                        <td style="padding: 10px; border: 1px solid #dee2e6;">${amount.toLocaleString('vi-VN')} VNĐ</td>
                    </tr>
                    <tr>
                        <td style="padding: 10px; border: 1px solid #dee2e6; font-weight: bold;">Tài khoản nhận:</td>
                        <td style="padding: 10px; border: 1px solid #dee2e6;">${recipientAccount}</td>
                    </tr>
                    <tr style="background: #f8f9fa;">
                        <td style="padding: 10px; border: 1px solid #dee2e6; font-weight: bold;">Thời gian:</td>
                        <td style="padding: 10px; border: 1px solid #dee2e6;">${new Date().toLocaleString('vi-VN')}</td>
                    </tr>
                </table>
                
                <div class="otp-box">
                    <p style="margin: 0 0 10px 0;">Mã OTP xác thận giao dịch:</p>
                    <div class="otp-code">${otp}</div>
                    <p style="margin: 10px 0 0 0; font-size: 14px; color: #666;">
                        Mã OTP có hiệu lực trong <strong>10 phút</strong>
                    </p>
                </div>
                
                <div class="warning">
                    <strong>⚠️ Lưu ý bảo mật:</strong>
                    <ul style="margin: 5px 0;">
                        <li>Không chia sẻ mã OTP với bất kỳ ai</li>
                        <li>Ngân hàng không bao giờ yêu cầu OTP qua điện thoại</li>
                        <li>Nếu không phải bạn thực hiện, vui lòng liên hệ ngay hotline</li>
                    </ul>
                </div>
                
                <p>Trân trọng,<br><strong>Ngân hàng Internet Banking</strong></p>
            </div>
            
            <div class="footer">
                <p>Email này được gửi tự động, vui lòng không phản hồi.<br>
                Hotline: 1900-xxxx | Website: www.internetbanking.com</p>
            </div>
        </div>
    </body>
    </html>`;
  }

  // Template cho email OTP reset password
  static getPasswordResetOTPTemplate(recipientName, otp) {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>Đặt lại mật khẩu</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #dc3545; color: white; padding: 20px; text-align: center; }
            .content { background: #f9f9f9; padding: 20px; border: 1px solid #ddd; }
            .otp-box { background: #fff; border: 2px solid #dc3545; padding: 15px; text-align: center; margin: 20px 0; }
            .otp-code { font-size: 24px; font-weight: bold; color: #dc3545; letter-spacing: 3px; }
            .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🔐 Đặt lại mật khẩu</h1>
            </div>
            
            <div class="content">
                <p>Kính chào <strong>${recipientName}</strong>,</p>
                
                <p>Bạn vừa yêu cầu đặt lại mật khẩu cho tài khoản Internet Banking.</p>
                
                <div class="otp-box">
                    <p style="margin: 0 0 10px 0;">Mã OTP xác thận:</p>
                    <div class="otp-code">${otp}</div>
                    <p style="margin: 10px 0 0 0; font-size: 14px; color: #666;">
                        Mã OTP có hiệu lực trong <strong>10 phút</strong>
                    </p>
                </div>
                
                <p><strong>Nếu không phải bạn thực hiện, vui lòng bỏ qua email này hoặc liên hệ hotline ngay.</strong></p>
                
                <p>Trân trọng,<br><strong>Ngân hàng Internet Banking</strong></p>
            </div>
            
            <div class="footer">
                <p>Email này được gửi tự động, vui lòng không phản hồi.</p>
            </div>
        </div>
    </body>
    </html>`;
  }

  // Gửi OTP chuyển khoản
  static async sendTransferOTP(email, recipientName, amount, recipientAccount, otp) {
    try {
      const emailService = new EmailService();
      
      const mailOptions = {
        from: `"Internet Banking" <${process.env.SMTP_USER}>`,
        to: email,
        subject: '🏦 Xác thận giao dịch chuyển khoản - OTP',
        html: this.getTransferOTPTemplate(recipientName, amount, recipientAccount, otp)
      };

      const result = await emailService.transporter.sendMail(mailOptions);
      console.log('Transfer OTP email sent:', result.messageId);
      return { success: true, messageId: result.messageId };
    } catch (error) {
      console.error('Error sending transfer OTP email:', error);
      return { success: false, error: error.message };
    }
  }

  // Gửi OTP reset password
  static async sendPasswordResetOTP(email, otp, recipientName) {
    try {
      const emailService = new EmailService();
      
      const mailOptions = {
        from: `"Internet Banking" <${process.env.SMTP_USER}>`,
        to: email,
        subject: '🔐 Đặt lại mật khẩu - OTP xác thận',
        html: this.getPasswordResetOTPTemplate(recipientName, otp)
      };

      const result = await emailService.transporter.sendMail(mailOptions);
      console.log('Password reset OTP email sent:', result.messageId);
      return { success: true, messageId: result.messageId };
    } catch (error) {
      console.error('Error sending password reset OTP email:', error);
      return { success: false, error: error.message };
    }
  }

  // Gửi thông báo nhắc nợ
  static async sendDebtNotification(email, recipientName, senderName, amount, message) {
    try {
      const emailService = new EmailService();
      
      const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #ff9800; color: white; padding: 20px; text-align: center;">
          <h1>💰 Thông báo nhắc nợ</h1>
        </div>
        <div style="padding: 20px; background: #f9f9f9;">
          <p>Kính chào <strong>${recipientName}</strong>,</p>
          <p>Bạn có một nhắc nợ mới từ <strong>${senderName}</strong>:</p>
          <div style="background: white; padding: 15px; border-left: 4px solid #ff9800; margin: 15px 0;">
            <p><strong>Số tiền:</strong> ${amount.toLocaleString('vi-VN')} VNĐ</p>
            <p><strong>Nội dung:</strong> ${message}</p>
            <p><strong>Thời gian:</strong> ${new Date().toLocaleString('vi-VN')}</p>
          </div>
          <p>Vui lòng đăng nhập Internet Banking để xem chi tiết và thanh toán.</p>
        </div>
      </div>`;
      
      const mailOptions = {
        from: `"Internet Banking" <${process.env.SMTP_USER}>`,
        to: email,
        subject: '💰 Thông báo nhắc nợ mới',
        html: htmlContent
      };

      const result = await emailService.transporter.sendMail(mailOptions);
      return { success: true, messageId: result.messageId };
    } catch (error) {
      console.error('Error sending debt notification:', error);
      return { success: false, error: error.message };
    }
  }

  // Gửi thông báo giao dịch thành công
  static async sendTransactionNotification(email, recipientName, transactionData) {
    try {
      const emailService = new EmailService();
      
      const { type, amount, fromAccount, toAccount, message, transactionId } = transactionData;
      
      const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #4caf50; color: white; padding: 20px; text-align: center;">
          <h1>✅ Giao dịch thành công</h1>
        </div>
        <div style="padding: 20px; background: #f9f9f9;">
          <p>Kính chào <strong>${recipientName}</strong>,</p>
          <p>Giao dịch của bạn đã được thực hiện thành công:</p>
          <table style="width: 100%; border-collapse: collapse; margin: 15px 0;">
            <tr><td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Mã giao dịch:</td><td style="padding: 8px; border: 1px solid #ddd;">${transactionId}</td></tr>
            <tr><td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Loại giao dịch:</td><td style="padding: 8px; border: 1px solid #ddd;">${type}</td></tr>
            <tr><td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Số tiền:</td><td style="padding: 8px; border: 1px solid #ddd;">${amount.toLocaleString('vi-VN')} VNĐ</td></tr>
            <tr><td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Từ tài khoản:</td><td style="padding: 8px; border: 1px solid #ddd;">${fromAccount}</td></tr>
            <tr><td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Đến tài khoản:</td><td style="padding: 8px; border: 1px solid #ddd;">${toAccount}</td></tr>
            <tr><td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Nội dung:</td><td style="padding: 8px; border: 1px solid #ddd;">${message}</td></tr>
            <tr><td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Thời gian:</td><td style="padding: 8px; border: 1px solid #ddd;">${new Date().toLocaleString('vi-VN')}</td></tr>
          </table>
          <p>Cảm ơn bạn đã sử dụng dịch vụ Internet Banking.</p>
        </div>
      </div>`;
      
      const mailOptions = {
        from: `"Internet Banking" <${process.env.SMTP_USER}>`,
        to: email,
        subject: `✅ Giao dịch thành công - ${transactionId}`,
        html: htmlContent
      };

      const result = await emailService.transporter.sendMail(mailOptions);
      return { success: true, messageId: result.messageId };
    } catch (error) {
      console.error('Error sending transaction notification:', error);
      return { success: false, error: error.message };
    }
  }
}

module.exports = EmailService;