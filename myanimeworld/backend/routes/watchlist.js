const express = require('express');
const { users, episodes } = require('../data/mockData');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// GET /api/watchlist — get user's watchlist & favorites
router.get('/', authenticate, (req, res) => {
  const user = users.find((u) => u.id === req.user.id);
  res.json({
    watchlist: user.watchlist,
    favorites: user.favorites,
    watchHistory: user.watchHistory,
  });
});

// POST /api/watchlist/add
router.post('/add', authenticate, (req, res) => {
  const { animeId } = req.body;
  const user = users.find((u) => u.id === req.user.id);
  if (!user.watchlist.includes(animeId)) user.watchlist.push(animeId);
  res.json({ watchlist: user.watchlist });
});

// DELETE /api/watchlist/remove
router.delete('/remove', authenticate, (req, res) => {
  const { animeId } = req.body;
  const user = users.find((u) => u.id === req.user.id);
  user.watchlist = user.watchlist.filter((id) => id !== animeId);
  res.json({ watchlist: user.watchlist });
});

// POST /api/watchlist/favorite
router.post('/favorite', authenticate, (req, res) => {
  const { animeId } = req.body;
  const user = users.find((u) => u.id === req.user.id);
  if (!user.favorites.includes(animeId)) user.favorites.push(animeId);
  res.json({ favorites: user.favorites });
});

// DELETE /api/watchlist/favorite
router.delete('/favorite', authenticate, (req, res) => {
  const { animeId } = req.body;
  const user = users.find((u) => u.id === req.user.id);
  user.favorites = user.favorites.filter((id) => id !== animeId);
  res.json({ favorites: user.favorites });
});

// POST /api/watchlist/progress — track watched episode
router.post('/progress', authenticate, (req, res) => {
  const { episodeId } = req.body;
  const user = users.find((u) => u.id === req.user.id);
  if (!user.watchHistory.includes(episodeId)) user.watchHistory.push(episodeId);
  res.json({ watchHistory: user.watchHistory });
});

module.exports = router;
