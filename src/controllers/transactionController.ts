import { Request, Response, NextFunction } from 'express';
import { getTransactions } from '../services/transactionService';
import { transactionFilterSchema } from '../schemas/transactionSchemas';

export const listTransactions = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const filters = transactionFilterSchema.parse(req.query);
        const bankId = Number(req.params.bankId);
        if (isNaN(bankId)) {
            return res.status(400).json({ error: 'Invalid bank ID format' });
        }
        const transactions = await getTransactions(bankId, filters);
        res.json(transactions);
    } catch (error) {
        next(error);
    }
};
