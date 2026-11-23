import express from 'express';
import {
  getTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  exportTransactionsCSV
} from '../controllers/transactionController.js';

const router = express.Router();

router.get('/', getTransactions);
router.get('/export/csv', exportTransactionsCSV);
router.post('/', createTransaction);
router.put('/:id', updateTransaction);
router.delete('/:id', deleteTransaction);

export default router;

