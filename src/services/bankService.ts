import { Bank } from '../models/bankModel';

export const getBanksAndBalances = async (userId: number) => {
    return await Bank.findAll({ where: { userId } });
};
