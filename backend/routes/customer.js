const express = require('express');
const { authenticateCustomer } = require('../middleware/auth');
const customerController = require('../controllers/customerController');

const router = express.Router();

// Các route cho customer, có sử dụng middleware authenticateCustomer
router.get('/', authenticateCustomer, customerController.getAll);
router.get('/:id', authenticateCustomer, customerController.getById);
router.post('/', authenticateCustomer, customerController.create);
router.put('/:id', authenticateCustomer, customerController.update);
router.delete('/:id', authenticateCustomer, customerController.delete);

module.exports = router;
