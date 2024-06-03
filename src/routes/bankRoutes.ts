import { Router } from 'express';
import { listBanks } from '../controllers/bankController';

const router = Router();
router.get('/', listBanks);

export default router;
