const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail', // hoặc SMTP khác
  auth: {
    user: process.env.EMAIL_USER, // email gửi
    pass: process.env.EMAIL_PASS// dùng app password, không dùng mật khẩu gmail thường
  }
});

async function sendMail(to, subject, { amount, toAccountNumber, time, content }) {
  const html = `
  <div style="font-family: Arial, sans-serif; background: #f6f8fa; padding: 32px;">
    <div style="max-width: 500px; margin: auto; background: #fff; border-radius: 8px; box-shadow: 0 2px 8px #eee; padding: 32px;">
      <h2 style="color: #1976d2; margin-bottom: 16px;">Giao dịch thành công</h2>
      <p style="font-size: 16px; color: #333;">Bạn vừa chuyển khoản thành công với thông tin sau:</p>
      <table style="width: 100%; margin: 16px 0; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 0; color: #555;">Số tiền:</td>
          <td style="padding: 8px 0; font-weight: bold; color: #1976d2;">${Number(amount).toLocaleString('vi-VN')} đ</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #555;">Tài khoản nhận:</td>
          <td style="padding: 8px 0;">${toAccountNumber}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #555;">Thời gian:</td>
          <td style="padding: 8px 0;">${time}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #555;">Nội dung:</td>
          <td style="padding: 8px 0;">${content || '(Không có)'}</td>
        </tr>
      </table>
      <div style="margin-top: 24px; color: #888; font-size: 13px;">
        Nếu bạn không thực hiện giao dịch này, vui lòng liên hệ ngay với ngân hàng để được hỗ trợ.<br>
        Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi!
      </div>
    </div>
  </div>
  `;

  await transporter.sendMail({
    from: `"Banking App" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html
  });
}

async function sendOtpMail(to, otp) {
  const html = `
    <div style="font-family: Arial, sans-serif; background: #f6f8fa; padding: 32px;">
      <div style="max-width: 420px; margin: auto; background: #fff; border-radius: 8px; box-shadow: 0 2px 8px #eee; padding: 32px;">
        <h2 style="color: #1976d2; margin-bottom: 16px;">Mã xác thực OTP</h2>
        <p style="font-size: 16px; color: #333;">Mã OTP của bạn là:</p>
        <div style="font-size: 32px; font-weight: bold; color: #1976d2; letter-spacing: 4px; margin: 16px 0;">${otp}</div>
        <p style="color: #555;">Mã có hiệu lực trong 5 phút. Tuyệt đối không chia sẻ mã này cho bất kỳ ai.</p>
        <div style="margin-top: 24px; color: #888; font-size: 13px;">
          Nếu bạn không thực hiện yêu cầu này, vui lòng liên hệ ngay với ngân hàng để được hỗ trợ.<br>
          Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi!
        </div>
      </div>
    </div>
  `;
  await transporter.sendMail({
    from: `"Banking App" <${process.env.EMAIL_USER}>`,
    to,
    subject: 'Mã xác thực OTP giao dịch',
    html
  });
}

module.exports = { sendMail, sendOtpMail };