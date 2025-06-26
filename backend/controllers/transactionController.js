const { Transaction, Account } = require('../models');
const { Op } = require('sequelize');

exports.getHistory = async (req, res) => {
  try {
    const accounts = await Account.findAll({ where: { user_id: req.user.id } });
    const accountIds = accounts.map(acc => acc.id);

    console.log('User:', req.user.id);
    console.log('Accounts:', accounts);
    console.log('Account IDs:', accountIds);

    if (!accountIds || accountIds.length === 0) {
      return res.json([]);
    }

    const transactions = await Transaction.findAll({
      where: {
        [Op.or]: [
          { from_account_id: { [Op.in]: accountIds } },
          { to_account_id: { [Op.in]: accountIds } }
        ],
        status: 'completed'
      },
      order: [['created_at', 'DESC']]
    });

    res.json(transactions);
  } catch (err) {
    console.error('Lỗi khi lấy lịch sử giao dịch:', err);
    res.status(500).json({ error: 'Không thể tải lịch sử giao dịch.' });
  }
};

exports.getByAccount = async (req, res) => {
  try {
    const accountId = parseInt(req.params.id, 10);
    if (isNaN(accountId)) return res.status(400).json({ error: 'ID không hợp lệ' });

    // Kiểm tra quyền truy cập account (nếu cần)
    // const account = await Account.findOne({ where: { id: accountId, user_id: req.user.id } });
    // if (!account) return res.status(403).json({ error: 'Không có quyền truy cập tài khoản này.' });

    const { limit = 50, page = 1 } = req.query;
    const offset = (page - 1) * limit;

    const transactions = await Transaction.findAll({
      where: {
        [Op.or]: [
          { from_account_id: accountId },
          { to_account_id: accountId }
        ],
        status: 'completed'
      },
      order: [['created_at', 'DESC']],
      limit: parseInt(limit, 10),
      offset: parseInt(offset, 10)
    });

    res.json(transactions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Không thể tải lịch sử giao dịch.' });
  }
};