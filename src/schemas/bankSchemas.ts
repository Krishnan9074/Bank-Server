import { z } from 'zod';

export const bankSchema = z.object({
    name: z.string().min(1),
    balance: z.number().positive()
});
