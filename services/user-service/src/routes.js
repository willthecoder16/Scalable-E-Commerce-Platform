const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { pool } = require('./db');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

function signToken(user) {
  return jwt.sign(
    { sub: user.id, email: user.email },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

router.post('/register', async (req, res, next) => {
  try {
    const { email, password, firstName, lastName, phone } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'email and password are required' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const id = uuidv4();

    const { rows } = await pool.query(
      `INSERT INTO users (id, email, password_hash, first_name, last_name, phone)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, email, first_name, last_name, phone, created_at`,
      [id, email.toLowerCase(), passwordHash, firstName || null, lastName || null, phone || null]
    );

    const user = rows[0];
    const token = signToken(user);
    res.status(201).json({ user: formatUser(user), token });
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: 'Email already registered' });
    }
    next(err);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'email and password are required' });
    }

    const { rows } = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email.toLowerCase()]
    );

    if (rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = rows[0];
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    res.json({ user: formatUser(user), token: signToken(user) });
  } catch (err) {
    next(err);
  }
});

router.get('/profile/:id', async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      'SELECT id, email, first_name, last_name, phone, created_at, updated_at FROM users WHERE id = $1',
      [req.params.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ user: formatUser(rows[0]) });
  } catch (err) {
    next(err);
  }
});

router.put('/profile/:id', async (req, res, next) => {
  try {
    const { firstName, lastName, phone } = req.body;
    const { rows } = await pool.query(
      `UPDATE users SET
         first_name = COALESCE($2, first_name),
         last_name = COALESCE($3, last_name),
         phone = COALESCE($4, phone),
         updated_at = NOW()
       WHERE id = $1
       RETURNING id, email, first_name, last_name, phone, created_at, updated_at`,
      [req.params.id, firstName, lastName, phone]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ user: formatUser(rows[0]) });
  } catch (err) {
    next(err);
  }
});

router.post('/verify', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ valid: false, error: 'Missing token' });
  }
  try {
    const payload = jwt.verify(authHeader.slice(7), JWT_SECRET);
    res.json({ valid: true, userId: payload.sub, email: payload.email });
  } catch {
    res.status(401).json({ valid: false, error: 'Invalid token' });
  }
});

function formatUser(row) {
  return {
    id: row.id,
    email: row.email,
    firstName: row.first_name,
    lastName: row.last_name,
    phone: row.phone,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

module.exports = router;
