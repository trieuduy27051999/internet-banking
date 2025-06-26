import React, { useState } from 'react';
import axios from '../api/axios';
import { useNavigate } from 'react-router-dom';


function VerifyRegisterOtp({ email }) {
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    try {
      await axios.post('/auth/verify-register-otp', { email, otp });
      // Chuyển sang màn hình đăng nhập sau khi xác thực thành công
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.error || 'OTP không đúng hoặc đã hết hạn.');
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: 'auto', marginTop: 100 }}>
      <h2>Xác thực OTP đăng ký</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Nhập mã OTP"
          value={otp}
          onChange={e => setOtp(e.target.value)}
          required
          style={{ width: '100%', marginBottom: 10 }}
        />
        <button type="submit" style={{ width: '100%' }}>Xác thực</button>
        {error && <div style={{ color: 'red', marginTop: 10 }}>{error}</div>}
      </form>
    </div>
  );
}

export default VerifyRegisterOtp;