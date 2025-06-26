import React, { useEffect, useState } from 'react';
import axios from '../api/axios';

function Profile() {
  const userId = localStorage.getItem('userId');
  const [profile, setProfile] = useState({
    username: '',
    email: '',
    full_name: '',
    phone: ''
  });
  const [loading, setLoading] = useState(true);
  const [editSuccess, setEditSuccess] = useState('');
  const [editError, setEditError] = useState('');
  const [pwForm, setPwForm] = useState({ oldPassword: '', newPassword: '' });
  const [pwSuccess, setPwSuccess] = useState('');
  const [pwError, setPwError] = useState('');

  useEffect(() => {
    async function fetchProfile() {
      setLoading(true);
      try {
        const res = await axios.get(`/users/${userId}`);
        setProfile({
          username: res.data.username,
          email: res.data.email,
          full_name: res.data.full_name,
          phone: res.data.phone
        });
      } catch {
        setEditError('Không thể tải thông tin cá nhân.');
      }
      setLoading(false);
    }
    fetchProfile();
  }, [userId]);

  const handleChange = e => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleUpdate = async e => {
    e.preventDefault();
    setEditSuccess('');
    setEditError('');
    try {
      await axios.put(`/users/${userId}`, {
        full_name: profile.full_name,
        phone: profile.phone,
        email: profile.email
      });
      setEditSuccess('Cập nhật thông tin thành công!');
    } catch (err) {
      setEditError(
        err.response?.data?.error ||
        'Không thể cập nhật thông tin.'
      );
    }
  };

  const handlePwChange = e => {
    setPwForm({ ...pwForm, [e.target.name]: e.target.value });
  };

  const handleChangePassword = async e => {
    e.preventDefault();
    setPwSuccess('');
    setPwError('');
    try {
      await axios.post(`/users/${userId}/change-password`, pwForm);
      setPwSuccess('Đổi mật khẩu thành công!');
      setPwForm({ oldPassword: '', newPassword: '' });
    } catch (err) {
      setPwError(
        err.response?.data?.error ||
        'Không thể đổi mật khẩu. Vui lòng kiểm tra lại.'
      );
    }
  };

  return (
    <div style={{ maxWidth: 500, margin: 'auto', marginTop: 40 }}>
      <h2>Thông tin cá nhân</h2>
      {loading ? (
        <div>Đang tải...</div>
      ) : (
        <form onSubmit={handleUpdate}>
          <div>
            <label>Tên đăng nhập:</label>
            <input value={profile.username} disabled style={{ width: '100%', marginBottom: 10 }} />
          </div>
          <div>
            <label>Email:</label>
            <input
              name="email"
              value={profile.email}
              onChange={handleChange}
              required
              style={{ width: '100%', marginBottom: 10 }}
            />
          </div>
          <div>
            <label>Họ và tên:</label>
            <input
              name="full_name"
              value={profile.full_name}
              onChange={handleChange}
              required
              style={{ width: '100%', marginBottom: 10 }}
            />
          </div>
          <div>
            <label>Số điện thoại:</label>
            <input
              name="phone"
              value={profile.phone}
              onChange={handleChange}
              required
              style={{ width: '100%', marginBottom: 10 }}
            />
          </div>
          <button type="submit" style={{ width: '100%' }}>Cập nhật thông tin</button>
          {editError && <div style={{ color: 'red', marginTop: 10 }}>{editError}</div>}
          {editSuccess && <div style={{ color: 'green', marginTop: 10 }}>{editSuccess}</div>}
        </form>
      )}

      <h3 style={{ marginTop: 40 }}>Đổi mật khẩu</h3>
      <form onSubmit={handleChangePassword}>
        <input
          type="password"
          name="oldPassword"
          placeholder="Mật khẩu hiện tại"
          value={pwForm.oldPassword}
          onChange={handlePwChange}
          required
          style={{ width: '100%', marginBottom: 10 }}
        />
        <input
          type="password"
          name="newPassword"
          placeholder="Mật khẩu mới"
          value={pwForm.newPassword}
          onChange={handlePwChange}
          required
          style={{ width: '100%', marginBottom: 10 }}
        />
        <button type="submit" style={{ width: '100%' }}>Đổi mật khẩu</button>
        {pwError && <div style={{ color: 'red', marginTop: 10 }}>{pwError}</div>}
        {pwSuccess && <div style={{ color: 'green', marginTop: 10 }}>{pwSuccess}</div>}
      </form>
    </div>
  );
}

export default Profile;