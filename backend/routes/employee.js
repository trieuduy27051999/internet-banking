const express = require('express');
const { authenticateEmployee } = require('../middleware/auth');
const employeeController = require('../controllers/employeeController');

const router = express.Router();

router.get('/', authenticateEmployee, employeeController.getAll);
router.get('/:id', authenticateEmployee, employeeController.getById);
router.post('/', authenticateEmployee, employeeController.create);
router.put('/:id', authenticateEmployee, employeeController.update);
router.delete('/:id', authenticateEmployee, employeeController.delete);

module.exports = router;