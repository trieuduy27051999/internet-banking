const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticateJWT, authorizeRoles } = require('../middleware/auth');

// Lấy danh sách user (chỉ admin)
router.get('/', authenticateJWT, authorizeRoles('admin'), userController.getAll);

// Lấy thông tin user theo id
router.get('/:id', authenticateJWT, userController.getById);

// Cập nhật thông tin user
router.put('/:id', authenticateJWT, userController.update);

// Đổi mật khẩu (chính chủ)
router.post('/:id/change-password', authenticateJWT, userController.changePassword);

// Khoá/mở user (chỉ admin)
router.patch('/:id/toggle-active', authenticateJWT, authorizeRoles('admin'), userController.toggleActive);

// Xoá user (chỉ admin)
router.delete('/:id', authenticateJWT, authorizeRoles('admin'), userController.delete);

module.exports = router;