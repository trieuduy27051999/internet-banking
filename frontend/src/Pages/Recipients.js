import React, { useEffect, useState } from 'react';
import axios from '../api/axios';

function Recipients() {
  const [recipients, setRecipients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ name: '', account_number: '' });
  const [editingId, setEditingId] = useState(null);
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchRecipients();
  }, []);

  const fetchRecipients = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get('/recipients');
      setRecipients(res.data);
    } catch {
      setError('Không thể tải danh sách người thụ hưởng.');
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
      if (editingId) {
        await axios.put(`/recipients/${editingId}`, form);
        setSuccess('Cập nhật thành công!');
      } else {
        await axios.post('/recipients', form);
        setSuccess('Thêm mới thành công!');
      }
      setForm({ name: '', account_number: '' });
      setEditingId(null);
      fetchRecipients();
    } catch (err) {
      setError(
        err.response?.data?.error ||
        'Không thể lưu người thụ hưởng. Vui lòng kiểm tra lại.'
      );
    }
  };

  const handleEdit = recipient => {
    setForm({ name: recipient.name, account_number: recipient.account_number });
    setEditingId(recipient.id);
  };

  const handleDelete = async id => {
    if (!window.confirm('Bạn chắc chắn muốn xóa người thụ hưởng này?')) return;
    setError('');
    setSuccess('');
    try {
      await axios.delete(`/recipients/${id}`);
      setSuccess('Đã xóa thành công!');
      fetchRecipients();
    } catch {
      setError('Không thể xóa người thụ hưởng.');
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: 'auto', marginTop: 40 }}>
      <h2>Quản lý người thụ hưởng</h2>
      <form onSubmit={handleSubmit} style={{ marginBottom: 20 }}>
        <input
          name="name"
          placeholder="Tên gợi nhớ"
          value={form.name}
          onChange={handleChange}
          required
          style={{ width: '40%', marginRight: 10 }}
        />
        <input
          name="account_number"
          placeholder="Số tài khoản"
          value={form.account_number}
          onChange={handleChange}
          required
          style={{ width: '40%', marginRight: 10 }}
        />
        <button type="submit">{editingId ? 'Cập nhật' : 'Thêm mới'}</button>
        {editingId && (
          <button type="button" onClick={() => { setEditingId(null); setForm({ name: '', account_number: '' }); }}>
            Hủy
          </button>
        )}
      </form>
      {error && <div style={{ color: 'red', marginBottom: 10 }}>{error}</div>}
      {success && <div style={{ color: 'green', marginBottom: 10 }}>{success}</div>}
      {loading ? (
        <div>Đang tải...</div>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th>Tên gợi nhớ</th>
              <th>Số tài khoản</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {recipients.map(rec => (
              <tr key={rec.id}>
                <td>{rec.name}</td>
                <td>{rec.account_number}</td>
                <td>
                  <button onClick={() => handleEdit(rec)}>Sửa</button>
                  <button onClick={() => handleDelete(rec.id)} style={{ marginLeft: 8 }}>Xóa</button>
                </td>
              </tr>
            ))}
            {recipients.length === 0 && (
              <tr>
                <td colSpan={3}>Chưa có người thụ hưởng nào.</td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default Recipients;