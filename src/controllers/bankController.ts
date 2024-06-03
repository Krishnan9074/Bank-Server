import { Request, Response, NextFunction } from 'express';
import { getBanksAndBalances } from '../services/bankService';

export const listBanks = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user.id;  // Assuming user ID is set by authMiddleware
        const banks = await getBanksAndBalances(userId);
        res.json(banks);
    } catch (error) {
        next(error);
    }
};
