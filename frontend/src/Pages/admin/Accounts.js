import React, { useEffect, useState } from 'react';
import axios from '../../api/axios';

function AdminAccounts() {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get('/accounts');
      setAccounts(res.data);
    } catch {
      setError('Không thể tải danh sách tài khoản.');
    }
    setLoading(false);
  };

  return (
    <div style={{ maxWidth: 900, margin: 'auto', marginTop: 40 }}>
      <h2>Quản lý tài khoản</h2>
      {error && <div style={{ color: 'red', marginBottom: 10 }}>{error}</div>}
      {loading ? (
        <div>Đang tải...</div>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Số tài khoản</th>
              <th>Chủ tài khoản</th>
              <th>Số dư</th>
              <th>Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {accounts.map(acc => (
              <tr key={acc.id}>
                <td>{acc.id}</td>
                <td>{acc.account_number}</td>
                <td>{acc.User ? acc.User.full_name : ''}</td>
                <td>{acc.balance}</td>
                <td>{acc.is_active ? 'Hoạt động' : 'Đã khóa'}</td>
              </tr>
            ))}
            {accounts.length === 0 && (
              <tr>
                <td colSpan={5}>Không có tài khoản nào.</td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default AdminAccounts;