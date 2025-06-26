import React, { useEffect, useState } from 'react';
import axios from '../api/axios';

function Transfer() {
  const [accounts, setAccounts] = useState([]);
  const [fromAccount, setFromAccount] = useState('');
  const [toAccount, setToAccount] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState(1); // 1: nhập thông tin, 2: nhập OTP
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const userId = localStorage.getItem('userId');

  useEffect(() => {
    async function fetchAccounts() {
      try {
        const res = await axios.get(`/accounts/user/${userId}`);
        setAccounts(res.data);
        if (res.data.length > 0) setFromAccount(res.data[0].id);
      } catch {
        setAccounts([]);
      }
    }
    fetchAccounts();
  }, [userId]);

  // Bước 1: Gửi yêu cầu chuyển tiền (gửi OTP)
  const handleTransfer = async e => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      await axios.post('/transactions', {
        from_account_id: fromAccount,
        to_account_number: toAccount,
        amount,
        description
      });
      setStep(2); // Chuyển sang bước nhập OTP
      setSuccess('Đã gửi OTP về email/SMS. Vui lòng nhập mã OTP để xác nhận.');
    } catch (err) {
      setError(
        err.response?.data?.error ||
        'Không thể thực hiện chuyển tiền. Vui lòng kiểm tra lại thông tin.'
      );
    }
    setLoading(false);
  };

  // Bước 2: Xác thực OTP
  const handleVerifyOtp = async e => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      await axios.post('/transactions/verify-otp', {
        from_account_id: fromAccount,
        to_account_number: toAccount,
        amount,
        otp
      });
      setSuccess('Chuyển tiền thành công!');
      setStep(1);
      setToAccount('');
      setAmount('');
      setDescription('');
      setOtp('');
    } catch (err) {
      setError(
        err.response?.data?.error ||
        'OTP không đúng hoặc đã hết hạn.'
      );
    }
    setLoading(false);
  };

  return (
    <div style={{ maxWidth: 500, margin: 'auto', marginTop: 40 }}>
      <h2>Chuyển tiền</h2>
      {step === 1 && (
        <form onSubmit={handleTransfer}>
          <label>Tài khoản nguồn:</label>
          <select
            value={fromAccount}
            onChange={e => setFromAccount(e.target.value)}
            style={{ width: '100%', marginBottom: 10 }}
          >
            {accounts.map(acc => (
              <option key={acc.id} value={acc.id}>
                {acc.account_number} ({acc.balance?.toLocaleString('vi-VN')} đ)
              </option>
            ))}
          </select>
          <input
            type="text"
            placeholder="Số tài khoản nhận"
            value={toAccount}
            onChange={e => setToAccount(e.target.value)}
            required
            style={{ width: '100%', marginBottom: 10 }}
          />
          <input
            type="number"
            placeholder="Số tiền"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            required
            min={1000}
            style={{ width: '100%', marginBottom: 10 }}
          />
          <input
            type="text"
            placeholder="Nội dung chuyển khoản"
            value={description}
            onChange={e => setDescription(e.target.value)}
            style={{ width: '100%', marginBottom: 10 }}
          />
          <button type="submit" style={{ width: '100%' }} disabled={loading}>
            Gửi OTP
          </button>
          {error && <div style={{ color: 'red', marginTop: 10 }}>{error}</div>}
          {success && <div style={{ color: 'green', marginTop: 10 }}>{success}</div>}
        </form>
      )}

      {step === 2 && (
        <form onSubmit={handleVerifyOtp}>
          <input
            type="text"
            placeholder="Nhập mã OTP"
            value={otp}
            onChange={e => setOtp(e.target.value)}
            required
            style={{ width: '100%', marginBottom: 10 }}
          />
          <button type="submit" style={{ width: '100%' }} disabled={loading}>
            Xác nhận chuyển tiền
          </button>
          {error && <div style={{ color: 'red', marginTop: 10 }}>{error}</div>}
          {success && <div style={{ color: 'green', marginTop: 10 }}>{success}</div>}
        </form>
      )}
    </div>
  );
}

export default Transfer;