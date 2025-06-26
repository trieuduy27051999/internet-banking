import React, { useEffect, useState } from 'react';
import axios from '../api/axios';
import { useParams } from 'react-router-dom';

function AccountDetail() {
  const { id } = useParams();
  const [account, setAccount] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchDetail() {
      setLoading(true);
      setError('');
      try {
        // Lấy thông tin tài khoản
        const accRes = await axios.get(`/accounts/${id}`);
        setAccount(accRes.data);

        // Lấy lịch sử giao dịch
        const tranRes = await axios.get(`/accounts/${id}/transactions?limit=20&page=1`);
        setTransactions(tranRes.data.transactions || []);
      } catch (err) {
        setError('Không thể tải chi tiết tài khoản.');
      }
      setLoading(false);
    }
    fetchDetail();
  }, [id]);

  return (
    <div style={{ maxWidth: 900, margin: 'auto', marginTop: 40 }}>
      <h2>Chi tiết tài khoản</h2>
      {loading && <div>Đang tải...</div>}
      {error && <div style={{ color: 'red' }}>{error}</div>}

      {account && (
        <div style={{ marginBottom: 30 }}>
          <b>Số tài khoản:</b> {account.account_number} <br />
          <b>Số dư:</b> {account.balance?.toLocaleString('vi-VN')} đ <br />
          <b>Trạng thái:</b> {account.is_active ? 'Đang hoạt động' : 'Đã khóa'} <br />
        </div>
      )}

      <h3>Lịch sử giao dịch</h3>
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
                {tran.from_account_id === account.id
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

export default AccountDetail;