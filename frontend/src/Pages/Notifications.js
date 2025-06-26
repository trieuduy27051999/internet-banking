import React, { useEffect, useState } from 'react';
import axios from '../api/axios';

function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get('/notifications');
      setNotifications(res.data);
    } catch {
      setError('Không thể tải danh sách thông báo.');
    }
    setLoading(false);
  };

  const handleMarkRead = async (id) => {
    try {
      await axios.patch(`/notifications/${id}/read`);
      setSuccess('Đã đánh dấu đã đọc.');
      fetchNotifications();
    } catch {
      setError('Không thể đánh dấu đã đọc.');
    }
  };

  return (
    <div style={{ maxWidth: 700, margin: 'auto', marginTop: 40 }}>
      <h2>Thông báo</h2>
      {error && <div style={{ color: 'red', marginBottom: 10 }}>{error}</div>}
      {success && <div style={{ color: 'green', marginBottom: 10 }}>{success}</div>}
      {loading ? (
        <div>Đang tải...</div>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {notifications.length === 0 && <li>Không có thông báo nào.</li>}
          {notifications.map(noti => (
            <li
              key={noti.id}
              style={{
                background: noti.is_read ? '#f5f5f5' : '#e6f7ff',
                padding: 12,
                marginBottom: 10,
                borderRadius: 6,
                border: '1px solid #ddd'
              }}
            >
              <b>{noti.title || 'Thông báo'}</b>: {noti.content || noti.message}
              <span style={{ color: '#888', marginLeft: 10 }}>
                {noti.created_at ? new Date(noti.created_at).toLocaleString() : ''}
              </span>
              {!noti.is_read && (
                <button
                  style={{ marginLeft: 20 }}
                  onClick={() => handleMarkRead(noti.id)}
                >
                  Đánh dấu đã đọc
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default Notifications;