import { Router } from 'express';
import { listTransactions } from '../controllers/transactionController';

const router = Router({ mergeParams: true });
router.get('/', listTransactions);

export default router;
