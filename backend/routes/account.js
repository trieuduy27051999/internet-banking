const express = require('express');
const router = express.Router();
const accountController = require('../controllers/accountController');
const transactionController = require('../controllers/transactionController');
const { authenticateJWT, authorizeRoles } = require('../middleware/auth');

// Lấy tất cả tài khoản của user (chính chủ, admin, employee)
router.get('/user/:userId', accountController.getAllByUser);

// Lấy chi tiết tài khoản
router.get('/:id', authenticateJWT, accountController.getById);

// Tạo tài khoản mới (chỉ employee/admin)
router.post('/', authenticateJWT, authorizeRoles('employee', 'admin'), accountController.create);

// Khoá/mở tài khoản (chỉ employee/admin)
router.patch('/:id/toggle-active', authenticateJWT, authorizeRoles('employee', 'admin'), accountController.toggleActive);

// Lấy số dư tài khoản
router.get('/:id/balance', authenticateJWT, accountController.getBalance);

// Lấy lịch sử giao dịch (có phân trang)
router.get('/:id/transactions', authenticateJWT, transactionController.getByAccount);

// Lấy tất cả tài khoản (chỉ admin/employee)
router.get(
  '/',
  authenticateJWT,
  authorizeRoles('employee', 'admin'),
  accountController.getAll
);

module.exports = router;