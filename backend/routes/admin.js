const express = require('express');
const { authenticateAdmin } = require('../middleware/auth');
const adminController = require('../controllers/adminController');

const router = express.Router();

router.get('/', authenticateAdmin, adminController.getAll);
router.get('/:id', authenticateAdmin, adminController.getById);
router.post('/', authenticateAdmin, adminController.create);
router.put('/:id', authenticateAdmin, adminController.update);
router.delete('/:id', authenticateAdmin, adminController.delete);

module.exports = router;