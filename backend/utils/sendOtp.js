const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail', // hoặc SMTP khác nếu bạn dùng dịch vụ khác
  auth: {
    user: process.env.EMAIL_USER, // email gửi
    pass: process.env.EMAIL_PASS  // mật khẩu ứng dụng (app password)
  }
});

async function sendOtpToEmail(email, otp) {
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Mã OTP xác thực đăng ký Internet Banking',
    text: `Mã OTP của bạn là: ${otp}`
  });
}

module.exports = sendOtpToEmail;