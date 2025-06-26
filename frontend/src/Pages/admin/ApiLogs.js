import React, { useEffect, useState } from 'react';
import axios from '../../api/axios';

function AdminApiLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get('/api-logs');
      setLogs(res.data);
    } catch {
      setError('Không thể tải danh sách log.');
    }
    setLoading(false);
  };

  const handleDelete = async id => {
    if (!window.confirm('Bạn chắc chắn muốn xóa log này?')) return;
    setError('');
    setSuccess('');
    try {
      await axios.delete(`/api-logs/${id}`);
      setSuccess('Đã xóa log!');
      fetchLogs();
    } catch {
      setError('Không thể xóa log.');
    }
  };

  return (
    <div style={{ maxWidth: 900, margin: 'auto', marginTop: 40 }}>
      <h2>Quản lý API Logs</h2>
      {error && <div style={{ color: 'red', marginBottom: 10 }}>{error}</div>}
      {success && <div style={{ color: 'green', marginBottom: 10 }}>{success}</div>}
      {loading ? (
        <div>Đang tải...</div>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Endpoint</th>
              <th>Method</th>
              <th>Status</th>
              <th>Thời gian</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {logs.map(log => (
              <tr key={log.id}>
                <td>{log.id}</td>
                <td>{log.endpoint}</td>
                <td>{log.method}</td>
                <td>{log.status_code}</td>
                <td>{log.created_at}</td>
                <td>
                  <button onClick={() => handleDelete(log.id)}>Xóa</button>
                </td>
              </tr>
            ))}
            {logs.length === 0 && (
              <tr>
                <td colSpan={6}>Chưa có log nào.</td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default AdminApiLogs;