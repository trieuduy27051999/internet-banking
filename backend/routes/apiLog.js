const express = require('express');
const router = express.Router();
const apiLogController = require('../controllers/apiLogController');
const { authenticateJWT, authorizeRoles } = require('../middleware/auth');

// Chỉ admin mới được xem và xóa log
router.get('/', authenticateJWT, authorizeRoles('admin'), apiLogController.getAll);
router.get('/:id', authenticateJWT, authorizeRoles('admin'), apiLogController.getById);
router.delete('/:id', authenticateJWT, authorizeRoles('admin'), apiLogController.delete);

module.exports = router;