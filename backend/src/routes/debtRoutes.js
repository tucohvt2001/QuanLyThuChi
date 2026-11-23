import express from 'express';
import {
  getDebts,
  getDebtById,
  createDebt,
  updateDebt,
  deleteDebt,
  addDebtPayment
} from '../controllers/debtController.js';

const router = express.Router();

router.get('/', getDebts);
router.get('/:id', getDebtById);
router.post('/', createDebt);
router.put('/:id', updateDebt);
router.delete('/:id', deleteDebt);
router.post('/:id/payments', addDebtPayment);

export default router;

