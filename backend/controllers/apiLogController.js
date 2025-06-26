const { ApiLog } = require('../models');

exports.getAll = async (req, res) => {
  try {
    const logs = await ApiLog.findAll({ order: [['created_at', 'DESC']] });
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: 'Không thể tải danh sách log.' });
  }
};

exports.getById = async (req, res) => {
  try {
    const log = await ApiLog.findByPk(req.params.id);
    if (!log) return res.status(404).json({ error: 'Log không tồn tại.' });
    res.json(log);
  } catch (err) {
    res.status(500).json({ error: 'Không thể lấy log.' });
  }
};

exports.delete = async (req, res) => {
  try {
    const log = await ApiLog.findByPk(req.params.id);
    if (!log) return res.status(404).json({ error: 'Log không tồn tại.' });
    await log.destroy();
    res.json({ message: 'Đã xóa log.' });
  } catch (err) {
    res.status(500).json({ error: 'Không thể xóa log.' });
  }
};