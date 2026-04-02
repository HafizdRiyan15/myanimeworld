const express = require('express');
const { anime, episodes, users } = require('../data/mockData');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

/**
 * Simple content-based recommendation engine:
 * 1. Get user's watch history → derive watched anime IDs
 * 2. Collect genres from watched anime
 * 3. Score unwatched anime by genre overlap + rating
 * 4. Return top N recommendations
 */
function getRecommendations(userId, limit = 6) {
  const user = users.find((u) => u.id === userId);
  if (!user) return [];

  // Map watched episodes → anime IDs
  const watchedEps = new Set(user.watchHistory);
  const watchedAnimeIds = new Set(
    episodes.filter((e) => watchedEps.has(e.id)).map((e) => e.animeId)
  );

  // Also include favorites
  user.favorites.forEach((id) => watchedAnimeIds.add(id));

  // Build genre preference map
  const genreScore = {};
  watchedAnimeIds.forEach((id) => {
    const a = anime.find((x) => x.id === id);
    if (a) a.genres.forEach((g) => { genreScore[g] = (genreScore[g] || 0) + 1; });
  });

  // Score unwatched anime
  const scored = anime
    .filter((a) => !watchedAnimeIds.has(a.id))
    .map((a) => {
      const genreMatch = a.genres.reduce((sum, g) => sum + (genreScore[g] || 0), 0);
      const score = genreMatch * 2 + a.rating;
      return { ...a, _score: score };
    })
    .sort((a, b) => b._score - a._score)
    .slice(0, limit);

  return scored;
}

// GET /api/recommendations — personalized (requires auth)
router.get('/', authenticate, (req, res) => {
  const recs = getRecommendations(req.user.id);
  res.json(recs);
});

// GET /api/recommendations/similar/:animeId — "you may also like"
router.get('/similar/:animeId', (req, res) => {
  const source = anime.find((a) => a.id === req.params.animeId);
  if (!source) return res.status(404).json({ error: 'Anime not found' });

  const similar = anime
    .filter((a) => a.id !== source.id)
    .map((a) => {
      const overlap = a.genres.filter((g) => source.genres.includes(g)).length;
      return { ...a, _score: overlap * 2 + a.rating };
    })
    .sort((a, b) => b._score - a._score)
    .slice(0, 6);

  res.json(similar);
});

module.exports = router;
