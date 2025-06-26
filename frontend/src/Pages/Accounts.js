import React, { useEffect, useState } from 'react';
import axios from '../api/axios';
import { useNavigate } from 'react-router-dom';

function Accounts() {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const userId = localStorage.getItem('userId');
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchAccounts() {
      setLoading(true);
      setError('');
      try {
        const accessToken = localStorage.getItem('accessToken');
        const res = await axios.get(`/accounts/user/${userId}`, {
          headers: { Authorization: `Bearer ${accessToken}` }
        });
        setAccounts(res.data);
      } catch (err) {
        setError('Không thể tải danh sách tài khoản.');
      }
      setLoading(false);
    }
    fetchAccounts();
  }, [userId]);

  const handleDetail = (id) => {
    navigate(`/accounts/${id}`);
  };

  return (
    <div style={{ maxWidth: 800, margin: 'auto', marginTop: 40 }}>
      <h2>Danh sách tài khoản</h2>
      {loading && <div>Đang tải...</div>}
      {error && <div style={{ color: 'red' }}>{error}</div>}
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th>Số tài khoản</th>
            <th>Số dư</th>
            <th>Trạng thái</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {accounts.map(acc => (
            <tr key={acc.id}>
              <td>{acc.account_number}</td>
              <td>{acc.balance?.toLocaleString('vi-VN')} đ</td>
              <td>{acc.is_active ? 'Đang hoạt động' : 'Đã khóa'}</td>
              <td>
                <button onClick={() => handleDetail(acc.id)}>Xem chi tiết</button>
              </td>
            </tr>
          ))}
          {accounts.length === 0 && (
            <tr>
              <td colSpan={4}>Bạn chưa có tài khoản nào.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default Accounts;