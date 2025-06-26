import React, { useEffect, useState } from 'react';
import axios from '../api/axios';

function Transactions() {
  const [accounts, setAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState('');
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const userId = localStorage.getItem('userId');

  // Lấy danh sách tài khoản khi mount
  useEffect(() => {
    async function fetchAccounts() {
      try {
        const res = await axios.get(`/accounts/user/${userId}`);
        setAccounts(res.data);
        if (res.data.length > 0) setSelectedAccount(res.data[0].id);
      } catch {
        setAccounts([]);
      }
    }
    fetchAccounts();
  }, [userId]);

  // Lấy giao dịch khi chọn tài khoản
  useEffect(() => {
    if (!selectedAccount) return;
    async function fetchTransactions() {
      setLoading(true);
      setError('');
      try {
        const res = await axios.get(`/accounts/${selectedAccount}/transactions?limit=50&page=1`);
        setTransactions(res.data.transactions || []);
      } catch {
        setError('Không thể tải lịch sử giao dịch.');
      }
      setLoading(false);
    }
    fetchTransactions();
  }, [selectedAccount]);

  return (
    <div style={{ maxWidth: 900, margin: 'auto', marginTop: 40 }}>
      <h2>Lịch sử giao dịch</h2>
      <div style={{ marginBottom: 20 }}>
        <label>Chọn tài khoản:&nbsp;</label>
        <select
          value={selectedAccount}
          onChange={e => setSelectedAccount(e.target.value)}
        >
          {accounts.map(acc => (
            <option key={acc.id} value={acc.id}>
              {acc.account_number} ({acc.balance?.toLocaleString('vi-VN')} đ)
            </option>
          ))}
        </select>
      </div>
      {loading && <div>Đang tải...</div>}
      {error && <div style={{ color: 'red' }}>{error}</div>}
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th>Mã GD</th>
            <th>Loại</th>
            <th>Số tiền</th>
            <th>Tài khoản đối ứng</th>
            <th>Thời gian</th>
            <th>Nội dung</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map(tran => (
            <tr key={tran.id}>
              <td>{tran.id}</td>
              <td>{tran.type}</td>
              <td>{tran.amount?.toLocaleString('vi-VN')} đ</td>
              <td>
                {tran.from_account_id === Number(selectedAccount)
                  ? tran.to_account_number
                  : tran.from_account_number}
              </td>
              <td>
                {tran.created_at
                  ? new Date(tran.created_at).toLocaleString()
                  : ''}
              </td>
              <td>{tran.description}</td>
            </tr>
          ))}
          {transactions.length === 0 && (
            <tr>
              <td colSpan={6}>Chưa có giao dịch nào.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default Transactions;