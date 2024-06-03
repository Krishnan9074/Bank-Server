const { sequelize, User, Bank, Transaction } = require('./models');
const bcrypt = require('bcrypt');

const seedDatabase = async () => {
  await sequelize.sync({ force: true }); // This will drop and recreate all tables

  // Create sample users with hashed passwords
  const users = await User.bulkCreate([
    {
      username: 'ramsharma',
      password: await bcrypt.hash('ram123', 10),
    },
    {
      username: 'krishnanv',
      password: await bcrypt.hash('krish123', 10),
    },
  ]);

  // Create sample banks
  const banks = await Bank.bulkCreate([
    { userId: users[0].id, name: 'State Bank Of India', balance: 100000.00 },
    { userId: users[0].id, name: 'Axis bank', balance: 200000.00 },
    { userId: users[1].id, name: 'HDFC bank', balance: 300000.00 },
  ]);

  // Create sample transactions
  await Transaction.bulkCreate([
    { bankId: banks[0].id, type: 'credit', amount: 500.00, date: new Date() },
    { bankId: banks[0].id, type: 'debit', amount: 1000.00, date: new Date() },
    { bankId: banks[1].id, type: 'credit', amount: 2500.00, date: new Date() },
    { bankId: banks[1].id, type: 'debit', amount: 5000.00, date: new Date() },
    { bankId: banks[2].id, type: 'credit', amount: 700.00, date: new Date() },
    { bankId: banks[2].id, type: 'debit', amount: 3500.00, date: new Date() },
  ]);

  console.log('Sample data inserted successfully.');
  process.exit();
};

seedDatabase().catch(error => {
  console.error('Error inserting sample data:', error);
  process.exit(1);
});
