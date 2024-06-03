'use strict';
module.exports = (sequelize, DataTypes) => {
  const Transaction = sequelize.define('Transaction', {
    bankId: DataTypes.INTEGER,
    type: {
      type: DataTypes.STRING,
      validate: {
        isIn: [['credit', 'debit']]
      }
    },
    amount: DataTypes.FLOAT,
    date: DataTypes.DATE
  }, {});
  Transaction.associate = function(models) {
    Transaction.belongsTo(models.Bank, { foreignKey: 'bankId' });
  };
  return Transaction;
};
