import React, { useState } from 'react';
import axios from '../api/axios';
import { useLocation, useNavigate } from 'react-router-dom';

function ResetPassword() {
  const location = useLocation();
  const navigate = useNavigate();
  // Lấy email từ state nếu có, hoặc để trống
  const [email, setEmail] = useState(location.state?.email || '');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async e => {
    e.preventDefault();
    setMessage('');
    setError('');
    try {
      await axios.post('/auth/reset-password', { email, otp, newPassword });
      setMessage('Đổi mật khẩu thành công! Đang chuyển về trang đăng nhập...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(
        err.response?.data?.error ||
        'Không thể đặt lại mật khẩu. Vui lòng kiểm tra lại thông tin.'
      );
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: 'auto', marginTop: 80 }}>
      <h2>Đặt lại mật khẩu</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email đã đăng ký"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          style={{ width: '100%', marginBottom: 10 }}
        />
        <input
          type="text"
          placeholder="Mã OTP"
          value={otp}
          onChange={e => setOtp(e.target.value)}
          required
          style={{ width: '100%', marginBottom: 10 }}
        />
        <input
          type="password"
          placeholder="Mật khẩu mới"
          value={newPassword}
          onChange={e => setNewPassword(e.target.value)}
          required
          style={{ width: '100%', marginBottom: 10 }}
        />
        <button type="submit" style={{ width: '100%' }}>Đặt lại mật khẩu</button>
        {error && <div style={{ color: 'red', marginTop: 10 }}>{error}</div>}
        {message && <div style={{ color: 'green', marginTop: 10 }}>{message}</div>}
      </form>
      <div style={{ marginTop: 10 }}>
        <a href="/login">Quay lại đăng nhập</a>
      </div>
    </div>
  );
}

export default ResetPassword;