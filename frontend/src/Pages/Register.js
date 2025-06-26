import React, { useState } from 'react';
import axios from '../api/axios';
import VerifyRegisterOtp from './VerifyRegisterOtp';

function Register() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');

  const handleRegister = async e => {
    e.preventDefault();
    setError('');
    try {
      await axios.post('/auth/register', { username, email, password, full_name: fullName, phone });
      setStep(2); // chuyển sang bước nhập OTP
    } catch (err) {
      setError(err.response?.data?.error || 'Đăng ký không thành công.');
    }
  };

  if (step === 2) return <VerifyRegisterOtp email={email} />;

  return (
    <div style={{ maxWidth: 400, margin: 'auto', marginTop: 100 }}>
      <h2>Đăng ký tài khoản</h2>
      <form onSubmit={handleRegister}>
        <input
          type="text"
          placeholder="Tên đăng nhập"
          value={username}
          onChange={e => setUsername(e.target.value)}
          required
          style={{ width: '100%', marginBottom: 10 }}
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          style={{ width: '100%', marginBottom: 10 }}
        />
        <input
          type="password"
          placeholder="Mật khẩu"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          style={{ width: '100%', marginBottom: 10 }}
        />
        <input
          type="text"
          placeholder="Họ và tên"
          value={fullName}
          onChange={e => setFullName(e.target.value)}
          required
          style={{ width: '100%', marginBottom: 10 }}
        />
        <input
          type="text"
          placeholder="Số điện thoại"
          value={phone}
          onChange={e => setPhone(e.target.value)}
          required
          style={{ width: '100%', marginBottom: 10 }}
        />
        <button type="submit" style={{ width: '100%' }}>Đăng ký</button>
        {error && <div style={{ color: 'red', marginTop: 10 }}>{error}</div>}
      </form>
    </div>
  );
}

export default Register;