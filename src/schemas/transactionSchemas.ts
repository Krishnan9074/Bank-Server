import { z } from 'zod';

export const transactionFilterSchema = z.object({
    type: z.enum(['Credit', 'Debit']).optional(),
    minAmount: z.number().optional(),
    maxAmount: z.number().optional(),
    duration: z.enum(['3months', '6months']).optional()
});
