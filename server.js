const express = require('express');
const bodyParser = require('body-parser');
const { Pool } = require('pg');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const app = express();
const pool = new Pool({
  user: 'youruser',
  host: 'localhost',
  database: 'yourdatabase',
  password: 'yourpassword',
  port: 5432,
});

app.use(bodyParser.json());

const authenticateToken = (req, res, next) => {
  const token = req.headers['authorization'];
  if (!token) return res.sendStatus(401);
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

app.get('/banks', authenticateToken, async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM banks WHERE user_id = $1', [req.user.id]);
    res.json({ banks: rows });
  } catch (err) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/banks/:bankId/transactions', authenticateToken, async (req, res) => {
  const { bankId } = req.params;
  const { type, minAmount, maxAmount, duration } = req.query;

  let query = 'SELECT * FROM transactions WHERE bank_id = $1';
  let queryParams = [bankId];

  if (type) {
    query += ' AND type = $2';
    queryParams.push(type);
  }

  if (minAmount) {
    query += ` AND amount >= $${queryParams.length + 1}`;
    queryParams.push(minAmount);
  }

  if (maxAmount) {
    query += ` AND amount <= $${queryParams.length + 1}`;
    queryParams.push(maxAmount);
  }

  if (duration) {
    const durationMap = {
      '3months': 3,
      '6months': 6
    };
    if (durationMap[duration]) {
      query += ` AND date >= NOW() - INTERVAL '${durationMap[duration]} months'`;
    } else {
      return res.status(400).json({ error: 'Invalid duration' });
    }
  }

  try {
    const { rows } = await pool.query(query, queryParams);
    res.json({ transactions: rows });
  } catch (err) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Add other necessary routes, authentication, user registration, etc.

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
