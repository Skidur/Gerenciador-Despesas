const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');
const authenticateToken = require('../middleware/authenticateToken');

router.use(authenticateToken);
router.get('/', transactionController.getAllTransactions);
router.post('/', transactionController.addTransaction);
router.post('/installments', transactionController.addInstallmentTransaction);
router.post('/recurring-income', transactionController.addRecurringTransaction);
router.put('/:id', transactionController.updateTransaction);
router.delete('/:id', transactionController.deleteTransaction);
router.patch('/:id/pago', transactionController.markAsPaid);
router.patch('/:id/pendente', transactionController.markAsPending);
router.delete('/', transactionController.deleteAllTransactions);

module.exports = router;