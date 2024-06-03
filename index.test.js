jest.mock('./models', () => ({
    sequelize: {
      sync: jest.fn(),
      authenticate: jest.fn(),
    },
    User: jest.fn(),
    Bank: jest.fn(),
    Transaction: jest.fn(),
  }));
  

const request = require('supertest');
const express = require('express');
const bodyParser = require('body-parser');
const { sequelize, User, Bank, Transaction } = require('./models');
const { z } = require('zod');
const app = express();

app.use(bodyParser.json());

// Same routes as in index.js
app.get('/', (req, res) => {
  const message = "Welcome to the bank server";
  console.log(message);
  res.send(message);
});

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

app.get('/banks/:userId', async (req, res) => {
  try {
    const { userId } = userIdSchema.parse(req.params);
    const banks = await Bank.findAll({ where: { userId } });
    if (banks.length === 0) {
      return res.status(404).json({ message: 'No banks found for this user' });
    }
    res.json(banks);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.errors });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/transactions/:bankId', async (req, res) => {
  try {
    const { bankId } = bankIdSchema.parse(req.params);
    const query = transactionQuerySchema.parse(req.query);

    const where = { bankId };
    if (query.type) where.type = query.type;
    if (query.minAmount) where.amount = { [sequelize.Op.gte]: parseFloat(query.minAmount) };
    if (query.maxAmount) where.amount = { ...where.amount, [sequelize.Op.lte]: parseFloat(query.maxAmount) };
    if (query.duration) where.date = { [sequelize.Op.gte]: new Date(new Date() - parseInt(query.duration) * 24 * 60 * 60 * 1000) };

    const transactions = await Transaction.findAll({ where });
    if (transactions.length === 0) {
      return res.status(404).json({ message: 'No transactions found for this bank' });
    }
    res.json(transactions);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.errors });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Tests
describe('Bank Server API', () => {
  it('should return welcome message on /', async () => {
    const res = await request(app).get('/');
    expect(res.statusCode).toEqual(200);
    expect(res.text).toBe("Welcome to the bank server");
  });

  it('should return banks for a valid user ID', async () => {
    const userId = 1; // Make sure this user ID exists in your test database
    const res = await request(app).get(`/banks/${userId}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toBeInstanceOf(Array);
  });

  it('should return 404 for a user ID with no banks', async () => {
    const userId = 9999; // Make sure this user ID does not exist
    const res = await request(app).get(`/banks/${userId}`);
    expect(res.statusCode).toEqual(404);
    expect(res.body.message).toBe('No banks found for this user');
  });

  it('should return transactions for a valid bank ID', async () => {
    const bankId = 1; // Make sure this bank ID exists in your test database
    const res = await request(app).get(`/transactions/${bankId}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toBeInstanceOf(Array);
  });

  it('should return 404 for a bank ID with no transactions', async () => {
    const bankId = 9999; // Make sure this bank ID does not exist
    const res = await request(app).get(`/transactions/${bankId}`);
    expect(res.statusCode).toEqual(404);
    expect(res.body.message).toBe('No transactions found for this bank');
  });

  it('should validate transaction query parameters', async () => {
    const bankId = 1; // Make sure this bank ID exists in your test database
    const res = await request(app).get(`/transactions/${bankId}?type=invalid`);
    expect(res.statusCode).toEqual(400);
    expect(res.body.errors).toBeInstanceOf(Array);
  });
});
