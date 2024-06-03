const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const { sequelize, User, Bank, Transaction } = require('./models');
const { z } = require('zod');
const { Op } = require('sequelize');
const bcrypt = require('bcrypt');
const crypto = require('crypto'); // Ensure crypto is imported

const app = express();
const port = 3000;
const JWT_SECRET = crypto.randomBytes(32).toString('hex'); // Generate a secret key

app.use(bodyParser.json());

// Middleware to authenticate JWT
const authenticateJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (authHeader) {
    const token = authHeader.split(' ')[1];

    jwt.verify(token, JWT_SECRET, (err, user) => {
      if (err) {
        return res.sendStatus(403);
      }

      req.user = user;
      next();
    });
  } else {
    res.sendStatus(401);
  }
};

// Root route
app.get('/', (req, res) => {
  const message = "Welcome to the bank server";
  console.log(message);
  res.send(message);
});

// Validation schemas using Zod
const userIdSchema = z.object({
  userId: z.string().regex(/^\d+$/, "User ID must be a number")
});

const bankIdSchema = z.object({
  bankId: z.string().regex(/^\d+$/, "Bank ID must be a number")
});

const transactionQuerySchema = z.object({
  type: z.enum(['credit', 'debit']).optional(),
  minAmount: z.string().regex(/^\d+(\.\d{1,2})?$/, "Minimum amount must be a valid number").optional(),
  maxAmount: z.string().regex(/^\d+(\.\d{1,2})?$/, "Maximum amount must be a valid number").optional(),
  duration: z.string().regex(/^\d+$/, "Duration must be a number").optional(),
});

// Authentication route
app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ where: { username } });

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '1h' });

    res.json({ token });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get list of banks for a user
app.get('/banks/:userId', authenticateJWT, async (req, res) => {
  try {
    const { userId } = userIdSchema.parse(req.params);
    const banks = await Bank.findAll({ where: { userId } });
    if (banks.length === 0) {
      return res.status(404).json({ message: 'No banks found for this user' });
    }
    res.json(banks);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get transactions for a bank
app.get('/transactions/:bankId', authenticateJWT, async (req, res) => {
  try {
    const { bankId } = bankIdSchema.parse(req.params);
    const query = transactionQuerySchema.parse(req.query);

    const where = { bankId };
    if (query.type) where.type = query.type;
    if (query.minAmount) where.amount = { [Op.gte]: parseFloat(query.minAmount) };
    if (query.maxAmount) where.amount = { ...where.amount, [Op.lte]: parseFloat(query.maxAmount) };
    if (query.duration) where.date = { [Op.gte]: new Date(new Date() - parseInt(query.duration) * 24 * 60 * 60 * 1000) };

    const transactions = await Transaction.findAll({ where });
    if (transactions.length === 0) {
      return res.status(404).json({ message: 'No transactions found for this bank' });
    }
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Transaction logic
const performTransaction = async (senderId, receiverId, amount) => {
  const sender = await User.findByPk(senderId);
  const receiver = await User.findByPk(receiverId);

  if (!sender || !receiver) {
    throw new Error('Sender or receiver not found');
  }

  if (sender.balance < amount) {
    throw new Error('Insufficient balance');
  }

  sender.balance -= amount;
  receiver.balance += amount;

  await sender.save();
  await receiver.save();

  await Transaction.create({ bankId: sender.bankId, type: 'debit', amount, date: new Date() });
  await Transaction.create({ bankId: receiver.bankId, type: 'credit', amount, date: new Date() });

  return true;
};

// Handle transaction between users
app.post('/transactions/send', authenticateJWT, async (req, res) => {
  try {
    const { senderId, receiverId, amount } = req.body;

    if (senderId === receiverId) {
      return res.status(400).json({ message: 'Sender and receiver cannot be the same' });
    }

    const transactionResult = await performTransaction(senderId, receiverId, amount);
    if (transactionResult) {
      res.json({ message: 'Transaction successful' });
    } else {
      res.status(400).json({ message: 'Transaction failed' });
    }
  } catch (error) {
    console.error('Error during transaction:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Start the server
app.listen(port, async () => {
  try {
    await sequelize.authenticate();
    console.log('Connection to the database has been established successfully.');
    console.log(`Server is running on port ${port}`);
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
});
