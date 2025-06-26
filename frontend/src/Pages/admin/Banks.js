import React, { useEffect, useState } from 'react';
import axios from '../../api/axios';

function AdminBanks() {
  const [banks, setBanks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [form, setForm] = useState({ bank_name: '', bank_code: '', short_name: '' });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchBanks();
  }, []);

  const fetchBanks = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get('/external');
      setBanks(res.data);
    } catch {
      setError('Không thể tải danh sách ngân hàng.');
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
        await axios.put(`/external/${editingId}`, form);
        setSuccess('Cập nhật ngân hàng thành công!');
      } else {
        await axios.post('/external', form);
        setSuccess('Thêm ngân hàng thành công!');
      }
      setForm({ bank_name: '', bank_code: '', short_name: '' });
      setEditingId(null);
      fetchBanks();
    } catch (err) {
      setError(
        err.response?.data?.error ||
        'Không thể lưu ngân hàng. Vui lòng kiểm tra lại.'
      );
    }
  };

  const handleEdit = bank => {
    setForm({ bank_name: bank.bank_name, bank_code: bank.bank_code, short_name: bank.short_name });
    setEditingId(bank.id);
  };

  const handleDelete = async id => {
    if (!window.confirm('Bạn chắc chắn muốn xóa ngân hàng này?')) return;
    setError('');
    setSuccess('');
    try {
      await axios.delete(`/external/${id}`);
      setSuccess('Đã xóa ngân hàng!');
      fetchBanks();
    } catch {
      setError('Không thể xóa ngân hàng.');
    }
  };

  return (
    <div style={{ maxWidth: 700, margin: 'auto', marginTop: 40 }}>
      <h2>Quản lý ngân hàng đối tác</h2>
      <form onSubmit={handleSubmit} style={{ marginBottom: 20 }}>
        <input
          name="bank_name"
          placeholder="Tên ngân hàng"
          value={form.bank_name}
          onChange={handleChange}
          required
          style={{ width: '30%', marginRight: 10 }}
        />
        <input
          name="bank_code"
          placeholder="Mã ngân hàng (BIN)"
          value={form.bank_code}
          onChange={handleChange}
          required
          style={{ width: '20%', marginRight: 10 }}
        />
        <input
          name="short_name"
          placeholder="Tên viết tắt"
          value={form.short_name}
          onChange={handleChange}
          style={{ width: '20%', marginRight: 10 }}
        />
        <button type="submit">{editingId ? 'Cập nhật' : 'Thêm mới'}</button>
        {editingId && (
          <button type="button" onClick={() => { setEditingId(null); setForm({ bank_name: '', bank_code: '', short_name: '' }); }}>
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
              <th>Tên ngân hàng</th>
              <th>BIN</th>
              <th>Tên viết tắt</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {banks.map(bank => (
              <tr key={bank.id}>
                <td>{bank.bank_name}</td>
                <td>{bank.bank_code}</td>
                <td>{bank.short_name}</td>
                <td>
                  <button onClick={() => handleEdit(bank)}>Sửa</button>
                  <button onClick={() => handleDelete(bank.id)} style={{ marginLeft: 8 }}>Xóa</button>
                </td>
              </tr>
            ))}
            {banks.length === 0 && (
              <tr>
                <td colSpan={4}>Chưa có ngân hàng nào.</td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default AdminBanks;