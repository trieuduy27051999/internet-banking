const { User, Account } = require('../models');
const bcrypt = require('bcrypt');

// Lấy danh sách tất cả user (chỉ admin)
exports.getAll = async (req, res) => {
  try {
    const users = await User.findAll();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Không thể tải danh sách người dùng.' });
  }
};

// Lấy thông tin user theo id (admin/employee hoặc chính chủ)
exports.getById = async (req, res) => {
  try {
    if (
      req.user.role === 'customer' &&
      req.user.id !== parseInt(req.params.id)
    ) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    const user = await User.findByPk(req.params.id, { attributes: { exclude: ['password_hash'] } });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Cập nhật thông tin user (chính chủ hoặc admin)
exports.update = async (req, res) => {
  try {
    if (
      req.user.role === 'customer' &&
      req.user.id !== parseInt(req.params.id)
    ) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    const { full_name, phone, email } = req.body;
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    user.full_name = full_name ?? user.full_name;
    user.phone = phone ?? user.phone;
    user.email = email ?? user.email;
    await user.save();

    res.json({ message: 'User updated', user: { ...user.toJSON(), password_hash: undefined } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Đổi mật khẩu (chính chủ)
exports.changePassword = async (req, res) => {
  try {
    if (req.user.id !== parseInt(req.params.id)) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    const { oldPassword, newPassword } = req.body;
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const match = await bcrypt.compare(oldPassword, user.password_hash);
    if (!match) return res.status(400).json({ error: 'Old password incorrect' });

    user.password_hash = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ message: 'Password changed successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Khoá hoặc mở khoá tài khoản user (chỉ admin)
exports.toggleActive = async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    user.is_active = !user.is_active;
    await user.save();

    res.json({ message: `User is now ${user.is_active ? 'active' : 'inactive'}` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Xoá user (chỉ admin)
exports.delete = async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    await user.destroy();
    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Lấy danh sách tài khoản của user (admin/employee hoặc chính chủ)
exports.getAccounts = async (req, res) => {
  try {
    if (
      req.user.role === 'customer' &&
      req.user.id !== parseInt(req.params.id)
    ) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    const accounts = await Account.findAll({ where: { user_id: req.params.id } });
    res.json(accounts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};