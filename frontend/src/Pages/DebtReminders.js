import React, { useEffect, useState } from 'react';
import axios from '../api/axios';

function DebtReminders() {
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ to_account_number: '', amount: '', note: '' });
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchReminders();
  }, []);

  const fetchReminders = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get('/debt-reminders');
      setReminders(res.data);
    } catch {
      setError('Không thể tải danh sách nhắc nợ.');
    }
    setLoading(false);
  };

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      await axios.post('/debt-reminders', form);
      setSuccess('Tạo nhắc nợ thành công!');
      setForm({ to_account_number: '', amount: '', note: '' });
      fetchReminders();
    } catch (err) {
      setError(
        err.response?.data?.error ||
        'Không thể tạo nhắc nợ. Vui lòng kiểm tra lại.'
      );
    }
  };

  const handlePay = async id => {
    if (!window.confirm('Bạn chắc chắn muốn thanh toán nhắc nợ này?')) return;
    setError('');
    setSuccess('');
    try {
      await axios.patch(`/debt-reminders/${id}/pay`);
      setSuccess('Thanh toán thành công!');
      fetchReminders();
    } catch {
      setError('Không thể thanh toán nhắc nợ.');
    }
  };

  const handleCancel = async id => {
    if (!window.confirm('Bạn chắc chắn muốn hủy nhắc nợ này?')) return;
    setError('');
    setSuccess('');
    try {
      await axios.patch(`/debt-reminders/${id}/cancel`);
      setSuccess('Đã hủy nhắc nợ!');
      fetchReminders();
    } catch {
      setError('Không thể hủy nhắc nợ.');
    }
  };

  return (
    <div style={{ maxWidth: 700, margin: 'auto', marginTop: 40 }}>
      <h2>Nhắc nợ</h2>
      <form onSubmit={handleSubmit} style={{ marginBottom: 20 }}>
        <input
          name="to_account_number"
          placeholder="Số tài khoản người nhận nhắc nợ"
          value={form.to_account_number}
          onChange={handleChange}
          required
          style={{ width: '30%', marginRight: 10 }}
        />
        <input
          name="amount"
          type="number"
          placeholder="Số tiền"
          value={form.amount}
          onChange={handleChange}
          required
          min={1000}
          style={{ width: '20%', marginRight: 10 }}
        />
        <input
          name="note"
          placeholder="Nội dung"
          value={form.note}
          onChange={handleChange}
          style={{ width: '30%', marginRight: 10 }}
        />
        <button type="submit">Tạo nhắc nợ</button>
      </form>
      {error && <div style={{ color: 'red', marginBottom: 10 }}>{error}</div>}
      {success && <div style={{ color: 'green', marginBottom: 10 }}>{success}</div>}
      {loading ? (
        <div>Đang tải...</div>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th>Số tài khoản gửi</th>
              <th>Số tài khoản nhận</th>
              <th>Số tiền</th>
              <th>Nội dung</th>
              <th>Trạng thái</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {reminders.map(rem => (
              <tr key={rem.id}>
                <td>{rem.from_account_number}</td>
                <td>{rem.to_account_number}</td>
                <td>{rem.amount?.toLocaleString('vi-VN')} đ</td>
                <td>{rem.note}</td>
                <td>{rem.status === 'paid' ? 'Đã thanh toán' : rem.status === 'cancelled' ? 'Đã hủy' : 'Chờ xử lý'}</td>
                <td>
                  {rem.status === 'pending' && rem.is_receiver && (
                    <button onClick={() => handlePay(rem.id)}>Thanh toán</button>
                  )}
                  {rem.status === 'pending' && rem.is_sender && (
                    <button onClick={() => handleCancel(rem.id)}>Hủy</button>
                  )}
                </td>
              </tr>
            ))}
            {reminders.length === 0 && (
              <tr>
                <td colSpan={6}>Chưa có nhắc nợ nào.</td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default DebtReminders;