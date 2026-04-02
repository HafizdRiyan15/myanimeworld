const express = require('express');
const { users, anime, episodes, reviews } = require('../data/mockData');
const { authenticate, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// All admin routes require authentication + admin role
router.use(authenticate, requireAdmin);

// GET /api/admin/stats — analytics dashboard
router.get('/stats', (req, res) => {
  const totalViews = episodes.reduce((sum, e) => sum + (e.views || 0), 0);
  const premiumUsers = users.filter((u) => u.subscription === 'premium').length;

  res.json({
    totalUsers: users.length,
    premiumUsers,
    freeUsers: users.length - premiumUsers,
    totalAnime: anime.length,
    totalEpisodes: episodes.length,
    totalReviews: reviews.length,
    totalViews,
    popularAnime: [...anime].sort((a, b) => b.views - a.views).slice(0, 5),
    recentUsers: [...users]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5)
      .map(({ password: _, ...u }) => u),
  });
});

// GET /api/admin/users
router.get('/users', (req, res) => {
  res.json(users.map(({ password: _, ...u }) => u));
});

// PUT /api/admin/users/:id/role
router.put('/users/:id/role', (req, res) => {
  const user = users.find((u) => u.id === req.params.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  user.role = req.body.role;
  const { password: _, ...safeUser } = user;
  res.json(safeUser);
});

// DELETE /api/admin/users/:id
router.delete('/users/:id', (req, res) => {
  const idx = users.findIndex((u) => u.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'User not found' });
  users.splice(idx, 1);
  res.json({ message: 'User deleted' });
});

// GET /api/admin/reviews — all reviews including unapproved
router.get('/reviews', (req, res) => res.json(reviews));

module.exports = router;
