import React, { useEffect, useState } from 'react';
import axios from '../../api/axios';

function TransactionHistory({ accountId }) {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchHistory();
    // eslint-disable-next-line
  }, [accountId]);

  const fetchHistory = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get(`/accounts/${accountId}/transactions`);
      setTransactions(res.data);
    } catch {
      setError('Không thể tải lịch sử giao dịch.');
    }
    setLoading(false);
  };

  return (
    <div style={{ maxWidth: 900, margin: 'auto', marginTop: 40 }}>
      <h2>Lịch sử giao dịch</h2>
      {error && <div style={{ color: 'red', marginBottom: 10 }}>{error}</div>}
      {loading ? (
        <div>Đang tải...</div>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th>Mã GD</th>
              <th>Loại</th>
              <th>Số tiền</th>
              <th>Phí</th>
              <th>Người trả phí</th>
              <th>Nội dung</th>
              <th>Thời gian</th>
              <th>Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {transactions.length > 0 ? (
              transactions.map(tx => (
                <tr key={tx.id}>
                  <td>{tx.id}</td>
                  <td>{tx.transaction_type}</td>
                  <td>{tx.amount}</td>
                  <td>{tx.fee}</td>
                  <td>{tx.fee_payer}</td>
                  <td>{tx.content}</td>
                  <td>{tx.completed_at ? new Date(tx.completed_at).toLocaleString() : ''}</td>
                  <td>{tx.status}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={8}>Chưa có giao dịch nào.</td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default TransactionHistory;