'use strict';
module.exports = (sequelize, DataTypes) => {
  const Bank = sequelize.define('Bank', {
    name: DataTypes.STRING,
    userId: DataTypes.INTEGER,
    balance: DataTypes.FLOAT
  }, {});
  Bank.associate = function(models) {
    Bank.belongsTo(models.User, { foreignKey: 'userId' });
    Bank.hasMany(models.Transaction, { foreignKey: 'bankId' });
  };
  return Bank;
};
