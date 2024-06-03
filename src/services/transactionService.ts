import { Transaction } from '../models/transactionModel';

export const getTransactions = async (bankId: number, filters: any) => {
    // Apply filters to the query
    return await Transaction.findAll({
        where: { bankId, ...filters }
    });
};
