import React, { useEffect, useState } from 'react';
import axios from '../../api/axios';

function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get('/users');
      setUsers(res.data);
    } catch {
      setError('Không thể tải danh sách người dùng.');
    }
    setLoading(false);
  };

  const handleToggleActive = async (id) => {
    setError('');
    setSuccess('');
    try {
      await axios.patch(`/users/${id}/toggle-active`);
      setSuccess('Đã cập nhật trạng thái!');
      fetchUsers();
    } catch {
      setError('Không thể cập nhật trạng thái.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn chắc chắn muốn xóa user này?')) return;
    setError('');
    setSuccess('');
    try {
      await axios.delete(`/users/${id}`);
      setSuccess('Đã xóa user!');
      fetchUsers();
    } catch {
      setError('Không thể xóa user.');
    }
  };

  return (
    <div style={{ maxWidth: 900, margin: 'auto', marginTop: 40 }}>
      <h2>Quản lý người dùng</h2>
      {error && <div style={{ color: 'red', marginBottom: 10 }}>{error}</div>}
      {success && <div style={{ color: 'green', marginBottom: 10 }}>{success}</div>}
      {loading ? (
        <div>Đang tải...</div>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Tên đăng nhập</th>
              <th>Họ tên</th>
              <th>Email</th>
              <th>Điện thoại</th>
              <th>Vai trò</th>
              <th>Trạng thái</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id}>
                <td>{u.id}</td>
                <td>{u.username}</td>
                <td>{u.full_name}</td>
                <td>{u.email}</td>
                <td>{u.phone}</td>
                <td>{u.role}</td>
                <td>{u.is_active ? 'Hoạt động' : 'Đã khóa'}</td>
                <td>
                  <button onClick={() => handleToggleActive(u.id)}>
                    {u.is_active ? 'Khóa' : 'Mở'}
                  </button>
                  <button onClick={() => handleDelete(u.id)} style={{ marginLeft: 8 }}>
                    Xóa
                  </button>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan={8}>Không có người dùng nào.</td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default AdminUsers;