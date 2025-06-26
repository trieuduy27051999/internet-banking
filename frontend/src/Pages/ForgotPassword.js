import React, { useState } from 'react';
import axios from '../api/axios';
import { useNavigate } from 'react-router-dom';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async e => {
    e.preventDefault();
    setMessage('');
    setError('');
    try {
      await axios.post('/auth/forgot-password', { email });
      setMessage('Đã gửi mã OTP về email. Vui lòng kiểm tra hộp thư và nhập mã ở trang tiếp theo.');
      setTimeout(() => navigate('/reset-password', { state: { email } }), 2000);
    } catch (err) {
      setError(
        err.response?.data?.error ||
        'Không thể gửi OTP. Vui lòng kiểm tra lại email.'
      );
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: 'auto', marginTop: 80 }}>
      <h2>Quên mật khẩu</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Nhập email đã đăng ký"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          style={{ width: '100%', marginBottom: 10 }}
        />
        <button type="submit" style={{ width: '100%' }}>Gửi OTP</button>
        {error && <div style={{ color: 'red', marginTop: 10 }}>{error}</div>}
        {message && <div style={{ color: 'green', marginTop: 10 }}>{message}</div>}
      </form>
      <div style={{ marginTop: 10 }}>
        <a href="/login">Quay lại đăng nhập</a>
      </div>
    </div>
  );
}

export default ForgotPassword;