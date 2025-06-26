const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');
const { authenticateJWT } = require('../middleware/auth');

// Lấy lịch sử giao dịch của user hiện tại
router.get('/accounts/:id/transactions', authenticateJWT, transactionController.getByAccount);

module.exports = router;