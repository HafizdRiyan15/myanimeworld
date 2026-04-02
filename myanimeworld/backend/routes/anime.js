const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { anime, episodes, genres } = require('../data/mockData');
const { authenticate, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// GET /api/anime — browse with filters, search, pagination
router.get('/', (req, res) => {
  const { genre, year, status, sort = 'popularity', search, page = 1, limit = 12 } = req.query;
  let results = [...anime];

  if (genre) results = results.filter((a) => a.genres.includes(genre));
  if (year) results = results.filter((a) => a.year === parseInt(year));
  if (status) results = results.filter((a) => a.status === status);
  if (search) {
    const q = search.toLowerCase();
    results = results.filter(
      (a) => a.title.toLowerCase().includes(q) || a.genres.some((g) => g.toLowerCase().includes(q))
    );
  }

  // Sorting
  const sortMap = {
    popularity: (a, b) => a.popularity - b.popularity,
    rating: (a, b) => b.rating - a.rating,
    views: (a, b) => b.views - a.views,
    year: (a, b) => b.year - a.year,
    title: (a, b) => a.title.localeCompare(b.title),
  };
  if (sortMap[sort]) results.sort(sortMap[sort]);

  const total = results.length;
  const start = (parseInt(page) - 1) * parseInt(limit);
  const paginated = results.slice(start, start + parseInt(limit));

  res.json({ total, page: parseInt(page), limit: parseInt(limit), results: paginated });
});

// GET /api/anime/genres
router.get('/genres', (req, res) => res.json(genres));

// GET /api/anime/search/suggestions?q=
router.get('/search/suggestions', (req, res) => {
  const { q } = req.query;
  if (!q) return res.json([]);
  const suggestions = anime
    .filter((a) => a.title.toLowerCase().includes(q.toLowerCase()))
    .slice(0, 5)
    .map((a) => ({ id: a.id, title: a.title, coverImage: a.coverImage, slug: a.slug }));
  res.json(suggestions);
});

// GET /api/anime/:id
router.get('/:id', (req, res) => {
  const item = anime.find((a) => a.id === req.params.id || a.slug === req.params.id);
  if (!item) return res.status(404).json({ error: 'Anime not found' });

  const eps = episodes.filter((e) => item.episodes.includes(e.id));
  res.json({ ...item, episodeList: eps });
});

// POST /api/anime — admin only
router.post('/', authenticate, requireAdmin, (req, res) => {
  const { title, description, coverImage, genres: g, year, status } = req.body;
  if (!title) return res.status(400).json({ error: 'Title required' });

  const newAnime = {
    id: uuidv4(),
    title,
    slug: title.toLowerCase().replace(/\s+/g, '-'),
    description: description || '',
    coverImage: coverImage || '',
    bannerImage: '',
    trailer: '',
    genres: g || [],
    year: year || new Date().getFullYear(),
    status: status || 'ongoing',
    rating: 0,
    totalRatings: 0,
    views: 0,
    popularity: anime.length + 1,
    episodes: [],
    studio: '',
    director: '',
    tags: [],
  };
  anime.push(newAnime);
  res.status(201).json(newAnime);
});

// PUT /api/anime/:id — admin only
router.put('/:id', authenticate, requireAdmin, (req, res) => {
  const idx = anime.findIndex((a) => a.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Anime not found' });
  anime[idx] = { ...anime[idx], ...req.body, id: anime[idx].id };
  res.json(anime[idx]);
});

// DELETE /api/anime/:id — admin only
router.delete('/:id', authenticate, requireAdmin, (req, res) => {
  const idx = anime.findIndex((a) => a.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Anime not found' });
  anime.splice(idx, 1);
  res.json({ message: 'Deleted' });
});

module.exports = router;
