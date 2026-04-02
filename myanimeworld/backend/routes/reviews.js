const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { reviews, anime } = require('../data/mockData');
const { authenticate, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// GET /api/reviews?animeId=
router.get('/', (req, res) => {
  const { animeId } = req.query;
  let results = reviews.filter((r) => r.approved);
  if (animeId) results = results.filter((r) => r.animeId === animeId);
  res.json(results);
});

// POST /api/reviews
router.post('/', authenticate, (req, res) => {
  const { animeId, rating, comment } = req.body;
  if (!animeId || !rating) return res.status(400).json({ error: 'animeId and rating required' });
  if (rating < 1 || rating > 5) return res.status(400).json({ error: 'Rating must be 1–5' });

  // One review per user per anime
  const existing = reviews.find((r) => r.animeId === animeId && r.userId === req.user.id);
  if (existing) return res.status(409).json({ error: 'You already reviewed this anime' });

  const newReview = {
    id: uuidv4(),
    animeId,
    userId: req.user.id,
    rating,
    comment: comment || '',
    likes: 0,
    approved: true, // auto-approve; admin can moderate
    createdAt: new Date().toISOString(),
  };
  reviews.push(newReview);

  // Recalculate anime rating
  const animeItem = anime.find((a) => a.id === animeId);
  if (animeItem) {
    const animeReviews = reviews.filter((r) => r.animeId === animeId && r.approved);
    const avg = animeReviews.reduce((sum, r) => sum + r.rating, 0) / animeReviews.length;
    animeItem.rating = Math.round(avg * 10) / 10;
    animeItem.totalRatings = animeReviews.length;
  }

  res.status(201).json(newReview);
});

// DELETE /api/reviews/:id — admin moderation
router.delete('/:id', authenticate, requireAdmin, (req, res) => {
  const idx = reviews.findIndex((r) => r.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Review not found' });
  reviews.splice(idx, 1);
  res.json({ message: 'Review removed' });
});

// PUT /api/reviews/:id/approve — admin
router.put('/:id/approve', authenticate, requireAdmin, (req, res) => {
  const review = reviews.find((r) => r.id === req.params.id);
  if (!review) return res.status(404).json({ error: 'Review not found' });
  review.approved = true;
  res.json(review);
});

module.exports = router;
