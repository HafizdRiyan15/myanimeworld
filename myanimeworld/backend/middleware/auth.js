const jwt = require('jsonwebtoken');
const { users } = require('../data/mockData');

// Verify JWT token
const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev_secret');
    const user = users.find((u) => u.id === decoded.id);
    if (!user) return res.status(401).json({ error: 'User not found' });
    req.user = user;
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

// Require admin role
const requireAdmin = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

// Require premium subscription
const requirePremium = (req, res, next) => {
  if (req.user?.subscription !== 'premium') {
    return res.status(403).json({ error: 'Premium subscription required' });
  }
  next();
};

module.exports = { authenticate, requireAdmin, requirePremium };
