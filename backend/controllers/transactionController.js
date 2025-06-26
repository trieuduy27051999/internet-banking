const { Transaction, Account, OtpCode, User } = require('../models');
const { Op } = require('sequelize');
const crypto = require('crypto');
const { sendMail, sendOtpMail } = require('../utils/mailer');

// Bước 1: Nhận yêu cầu chuyển tiền, tạo OTP và lưu transaction ở trạng thái pending
exports.initiateTransfer = async (req, res) => {
  try {
    const { from_account_id, to_account_number, amount, description } = req.body;
    const userId = req.user.id;

    const fromAccount = await Account.findOne({ where: { id: from_account_id, user_id: userId } });
    if (!fromAccount) {
      console.log('Tài khoản nguồn không hợp lệ');
      return res.status(400).json({ error: 'Tài khoản nguồn không hợp lệ.' });
    }

    if (parseFloat(fromAccount.balance) < parseFloat(amount)) {
      console.log('Số dư không đủ');
      return res.status(400).json({ error: 'Số dư không đủ.' });
    }

    const toAccount = await Account.findOne({ where: { account_number: to_account_number } });
    if (!toAccount) {
      console.log('Tài khoản nhận không tồn tại');
      return res.status(400).json({ error: 'Tài khoản nhận không tồn tại.' });
    }

    // Kiểm tra transaction pending
    const existing = await Transaction.findOne({
      where: {
        from_account_id,
        to_account_id: toAccount.id,
        amount,
        status: 'pending'
      }
    });
    if (existing) {
      // Gửi lại OTP cho transaction này
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      await OtpCode.create({
        user_id: userId,
        code: otp,
        type: 'transfer',
        reference_id: existing ? existing.id : transaction.id,
        expires_at: new Date(Date.now() + 5 * 60 * 1000)
      });
      // Gửi OTP qua email
      await sendOtpMail(req.user.email, otp);
      // Xóa hoặc comment dòng này:
      // console.log(`OTP chuyển tiền: ${otp}`);
      return res.json({ message: 'Đã gửi lại OTP cho giao dịch đang chờ xác nhận.' });
    }

    // Nếu chưa có transaction pending, tạo mới
    const transaction = await Transaction.create({
      from_account_id,
      to_account_id: toAccount.id,
      transaction_type: 'transfer_internal',
      amount,
      content: description,
      status: 'pending'
    });
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    await OtpCode.create({
      user_id: userId,
      code: otp,
      type: 'transfer',
      reference_id: transaction.id,
      expires_at: new Date(Date.now() + 5 * 60 * 1000)
    });
    // Gửi OTP qua email
    await sendOtpMail(req.user.email, otp);
    // Xóa hoặc comment dòng này:
    // console.log(`OTP chuyển tiền: ${otp}`);
    res.json({ message: 'Đã gửi OTP về email/SMS. Vui lòng xác nhận.' });
  } catch (err) {
    console.error('Lỗi khi thực hiện chuyển tiền:', err);
    res.status(500).json({ error: 'Không thể thực hiện chuyển tiền.' });
  }
};

exports.getHistory = async (req, res) => {
  try {
    // Lấy tất cả account của user hiện tại
    const accounts = await Account.findAll({ where: { user_id: req.user.id } });
    const accountIds = accounts.map(acc => acc.id);

    if (!accountIds || accountIds.length === 0) {
      return res.json([]);
    }

    // Lấy tất cả transaction liên quan đến các account này
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

    // Kiểm tra quyền truy cập account
    const account = await Account.findOne({ where: { id: accountId, user_id: req.user.id } });
    if (!account) return res.status(403).json({ error: 'Không có quyền truy cập tài khoản này.' });

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
    console.error('Lỗi khi lấy lịch sử giao dịch theo account:', err);
    res.status(500).json({ error: 'Không thể tải lịch sử giao dịch.' });
  }
};

exports.verifyOtp = async (req, res) => {
  try {
    const { from_account_id, to_account_number, amount, otp } = req.body;
    const userId = req.user.id;

    // Tìm tài khoản nhận
    const toAccount = await Account.findOne({ where: { account_number: to_account_number } });
    if (!toAccount) return res.status(400).json({ error: 'Tài khoản nhận không tồn tại.' });

    // Tìm transaction pending
    const transaction = await Transaction.findOne({
      where: {
        from_account_id,
        to_account_id: toAccount.id,
        amount,
        status: 'pending'
      }
    });
    if (!transaction) return res.status(400).json({ error: 'Giao dịch không tồn tại hoặc đã xử lý.' });

    // Kiểm tra OTP
    const otpRecord = await OtpCode.findOne({
      where: {
        user_id: userId,
        code: otp,
        type: 'transfer',
        reference_id: transaction.id,
        expires_at: { [Op.gt]: new Date() },
        is_used: false
      }
    });
    if (!otpRecord) return res.status(400).json({ error: 'OTP không đúng hoặc đã hết hạn.' });

    // Đánh dấu OTP đã dùng
    otpRecord.is_used = true;
    await otpRecord.save();

    // Trừ tiền và cộng tiền (bắt đầu transaction DB)
    const t = await Transaction.sequelize.transaction();
    try {
      // Trừ tiền người gửi (kiểm tra số dư trước)
      const fromAccount = await Account.findOne({ where: { id: from_account_id }, transaction: t });
      if (parseFloat(fromAccount.balance) < parseFloat(amount)) {
        throw new Error('Số dư không đủ.');
      }
      await Account.decrement('balance', { by: parseFloat(amount), where: { id: from_account_id }, transaction: t });

      // Cộng tiền người nhận
      await Account.increment('balance', { by: parseFloat(amount), where: { id: toAccount.id }, transaction: t });

      // Cập nhật transaction thành completed
      transaction.status = 'completed';
      transaction.completed_at = new Date();
      await transaction.save({ transaction: t });

      await t.commit();

      // Gửi email thông báo giao dịch thành công
      await sendMail(
        req.user.email, // hoặc email người nhận
        'Giao dịch thành công',
        `<p>Bạn vừa chuyển khoản thành công số tiền ${amount} đến tài khoản ${toAccount.account_number}.</p>`
      );

      res.json({ message: 'Chuyển tiền thành công!' });
    } catch (err) {
      await t.rollback();
      console.error('Lỗi khi xác nhận OTP:', err);
      res.status(500).json({ error: err.message || 'Không thể xác nhận chuyển tiền.' });
    }
  } catch (err) {
    console.error('Lỗi khi xác nhận OTP:', err);
    res.status(500).json({ error: 'Không thể xác nhận chuyển tiền.' });
  }
};