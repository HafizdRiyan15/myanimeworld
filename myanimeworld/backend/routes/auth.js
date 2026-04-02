const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { users } = require('../data/mockData');
const { authenticate } = require('../middleware/auth');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret';

const signToken = (user) =>
  jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

// POST /api/auth/register
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password)
    return res.status(400).json({ error: 'All fields required' });

  if (users.find((u) => u.email === email))
    return res.status(409).json({ error: 'Email already registered' });

  const hashed = await bcrypt.hash(password, 10);
  const newUser = {
    id: uuidv4(),
    name,
    email,
    password: hashed,
    role: 'user',
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`,
    subscription: 'free',
    verified: false, // would send verification email in production
    watchHistory: [],
    favorites: [],
    watchlist: [],
    createdAt: new Date().toISOString(),
  };
  users.push(newUser);

  const token = signToken(newUser);
  const { password: _, ...safeUser } = newUser;
  res.status(201).json({ token, user: safeUser });
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = users.find((u) => u.email === email);
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

  const token = signToken(user);
  const { password: _, ...safeUser } = user;
  res.json({ token, user: safeUser });
});

// GET /api/auth/me
router.get('/me', authenticate, (req, res) => {
  const { password: _, ...safeUser } = req.user;
  res.json(safeUser);
});

// PUT /api/auth/profile
router.put('/profile', authenticate, async (req, res) => {
  const { name, avatar } = req.body;
  const user = users.find((u) => u.id === req.user.id);
  if (name) user.name = name;
  if (avatar) user.avatar = avatar;
  const { password: _, ...safeUser } = user;
  res.json(safeUser);
});

// POST /api/auth/change-password
router.post('/change-password', authenticate, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = users.find((u) => u.id === req.user.id);
  const valid = await bcrypt.compare(currentPassword, user.password);
  if (!valid) return res.status(400).json({ error: 'Current password incorrect' });
  user.password = await bcrypt.hash(newPassword, 10);
  res.json({ message: 'Password updated' });
});

module.exports = router;
