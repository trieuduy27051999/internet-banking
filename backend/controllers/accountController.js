const { Account, User, Transaction } = require('../models');

// Lấy tất cả tài khoản của user (customer)
exports.getAllByUser = async (req, res) => {
  try {
    const accounts = await Account.findAll({ where: { user_id: req.params.userId } });
    res.json(accounts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Lấy tất cả tài khoản (kèm thông tin user)
exports.getAll = async (req, res) => {
  try {
    const accounts = await Account.findAll({ include: User });
    res.json(accounts);
  } catch (err) {
    console.error(err); // Thêm dòng này để log lỗi chi tiết
    res.status(500).json({ error: 'Không thể tải danh sách tài khoản.' });
  }
};

// Lấy chi tiết tài khoản (chỉ chủ tài khoản hoặc admin/employee)
exports.getById = async (req, res) => {
  try {
    const account = await Account.findByPk(req.params.id);
    if (!account) return res.status(404).json({ error: 'Account not found' });

    // Chỉ cho phép chủ tài khoản hoặc admin/employee xem
    if (
      req.user.role === 'customer' &&
      account.user_id !== req.user.id
    ) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    res.json(account);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Tạo tài khoản mới cho user (chỉ employee/admin)
exports.create = async (req, res) => {
  try {
    if (!['employee', 'admin'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    const { user_id, account_number, balance } = req.body;
    const user = await User.findByPk(user_id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const account = await Account.create({
      user_id,
      account_number,
      balance: balance ?? 0
    });
    res.status(201).json(account);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Khoá/mở tài khoản (chỉ employee/admin)
exports.toggleActive = async (req, res) => {
  try {
    if (!['employee', 'admin'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    const account = await Account.findByPk(req.params.id);
    if (!account) return res.status(404).json({ error: 'Account not found' });

    account.is_active = !account.is_active;
    await account.save();
    res.json({ message: `Account is now ${account.is_active ? 'active' : 'inactive'}` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Lấy số dư tài khoản (chỉ chủ tài khoản hoặc admin/employee)
exports.getBalance = async (req, res) => {
  try {
    const account = await Account.findByPk(req.params.id);
    if (!account) return res.status(404).json({ error: 'Account not found' });

    if (
      req.user.role === 'customer' &&
      account.user_id !== req.user.id
    ) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    res.json({ balance: account.balance });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Lấy lịch sử giao dịch của tài khoản
exports.getTransactions = async (req, res) => {
  try {
    const account = await Account.findByPk(req.params.id);
    if (!account) return res.status(404).json({ error: 'Account not found' });

    if (
      req.user.role === 'customer' &&
      account.user_id !== req.user.id
    ) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const transactions = await Transaction.findAll({
      where: {
        [Op.or]: [
          { from_account_id: account.id },
          { to_account_id: account.id }
        ]
      },
      order: [['created_at', 'DESC']]
    });

    res.json(transactions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};