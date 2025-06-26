import React, { useEffect, useState } from 'react';
import axios from '../api/axios';

function Dashboard() {
  const [accounts, setAccounts] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Lấy userId từ localStorage (đã lưu khi đăng nhập)
  const userId = localStorage.getItem('userId');

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError('');
      try {
        // Lấy danh sách tài khoản
        const accRes = await axios.get(`/accounts/user/${userId}`);
        setAccounts(accRes.data);

        // Lấy thông báo (nếu có API, nếu chưa có thì để mảng rỗng)
        try {
          const notiRes = await axios.get('/notifications');
          setNotifications(notiRes.data);
        } catch {
          setNotifications([]);
        }
      } catch (err) {
        setError('Không thể tải dữ liệu. Vui lòng thử lại.');
      }
      setLoading(false);
    }
    fetchData();
  }, [userId]);

  return (
    <div style={{ maxWidth: 800, margin: 'auto', marginTop: 40 }}>
      <h2>Chào mừng đến Internet Banking!</h2>
      {loading && <div>Đang tải dữ liệu...</div>}
      {error && <div style={{ color: 'red' }}>{error}</div>}

      {/* Danh sách tài khoản */}
      <h3>Tài khoản của bạn</h3>
      <table style={{ width: '100%', marginBottom: 30, borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th>Số tài khoản</th>
            <th>Số dư</th>
            <th>Trạng thái</th>
          </tr>
        </thead>
        <tbody>
          {accounts.map(acc => (
            <tr key={acc.id}>
              <td>{acc.account_number}</td>
              <td>{acc.balance?.toLocaleString('vi-VN')} đ</td>
              <td>{acc.is_active ? 'Đang hoạt động' : 'Đã khóa'}</td>
            </tr>
          ))}
          {accounts.length === 0 && (
            <tr>
              <td colSpan={3}>Bạn chưa có tài khoản nào.</td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Thông báo */}
      <h3>Thông báo mới nhất</h3>
      <ul>
        {notifications.length === 0 && <li>Không có thông báo nào.</li>}
        {notifications.map(noti => (
          <li key={noti.id}>
            <b>{noti.title || 'Thông báo'}</b>: {noti.content || noti.message}
            <span style={{ color: '#888', marginLeft: 10 }}>
              {noti.created_at ? new Date(noti.created_at).toLocaleString() : ''}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Dashboard;