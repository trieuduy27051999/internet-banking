const express = require('express');
const externalController = require('../controllers/externalController');
const { authenticateJWT, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

// Lấy danh sách ngân hàng đối tác (chỉ user đã đăng nhập)
router.get('/', authenticateJWT, externalController.getAll);
router.get('/:id', authenticateJWT, externalController.getById);

// Thêm, sửa, xóa (chỉ admin)
router.post('/', authenticateJWT, authorizeRoles('admin'), externalController.create);
router.put('/:id', authenticateJWT, authorizeRoles('admin'), externalController.update);
router.delete('/:id', authenticateJWT, authorizeRoles('admin'), externalController.delete);

module.exports = router;