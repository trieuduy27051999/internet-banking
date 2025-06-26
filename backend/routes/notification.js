const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { authenticateJWT } = require('../middleware/auth');

// Lấy tất cả thông báo của user
router.get('/', authenticateJWT, notificationController.getAll);

// Đánh dấu đã đọc 1 thông báo
router.patch('/:id/read', authenticateJWT, notificationController.markAsRead);

// Đánh dấu tất cả đã đọc
router.patch('/read-all', authenticateJWT, notificationController.markAllAsRead);

// Xóa thông báo
router.delete('/:id', authenticateJWT, notificationController.delete);

module.exports = router;