const { Notification } = require('../models');

// Lấy tất cả thông báo của user (mới nhất trước)
exports.getAll = async (req, res) => {
  try {
    const notifications = await Notification.findAll({
      where: { user_id: req.user.id },
      order: [['created_at', 'DESC']]
    });
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ error: 'Không thể tải thông báo.' });
  }
};

// Đánh dấu đã đọc 1 thông báo
exports.markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findOne({
      where: { id: req.params.id, user_id: req.user.id }
    });
    if (!notification) return res.status(404).json({ error: 'Không tìm thấy thông báo.' });
    notification.is_read = true;
    await notification.save();
    res.json({ message: 'Đã đánh dấu đã đọc.' });
  } catch (err) {
    res.status(500).json({ error: 'Không thể cập nhật thông báo.' });
  }
};

// Đánh dấu tất cả đã đọc
exports.markAllAsRead = async (req, res) => {
  try {
    await Notification.update(
      { is_read: true },
      { where: { user_id: req.user.id, is_read: false } }
    );
    res.json({ message: 'Đã đánh dấu tất cả đã đọc.' });
  } catch (err) {
    res.status(500).json({ error: 'Không thể cập nhật thông báo.' });
  }
};

// Xóa thông báo
exports.delete = async (req, res) => {
  try {
    const notification = await Notification.findOne({
      where: { id: req.params.id, user_id: req.user.id }
    });
    if (!notification) return res.status(404).json({ error: 'Không tìm thấy thông báo.' });
    await notification.destroy();
    res.json({ message: 'Đã xóa thông báo.' });
  } catch (err) {
    res.status(500).json({ error: 'Không thể xóa thông báo.' });
  }
};