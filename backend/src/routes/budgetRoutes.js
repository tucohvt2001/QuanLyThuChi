import express from 'express';
import {
  getBudgets,
  setBudget,
  deleteBudget
} from '../controllers/budgetController.js';

const router = express.Router();

router.get('/', getBudgets);
router.post('/', setBudget);
router.delete('/:id', deleteBudget);

export default router;

