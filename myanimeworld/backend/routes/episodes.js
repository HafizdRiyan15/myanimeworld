const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { episodes, anime } = require('../data/mockData');
const { authenticate, requireAdmin, requirePremium } = require('../middleware/auth');

const router = express.Router();

// GET /api/episodes/:id — get episode details + stream URL
router.get('/:id', authenticate, (req, res) => {
  const ep = episodes.find((e) => e.id === req.params.id);
  if (!ep) return res.status(404).json({ error: 'Episode not found' });

  // Free episodes accessible to all; premium episodes require subscription
  if (!ep.isFree && req.user.subscription !== 'premium') {
    return res.status(403).json({ error: 'Premium subscription required for this episode' });
  }

  // Increment view count
  ep.views = (ep.views || 0) + 1;
  res.json(ep);
});

// POST /api/episodes — admin: add episode to anime
router.post('/', authenticate, requireAdmin, (req, res) => {
  const { animeId, number, title, description, thumbnail, streamUrl, qualities, subtitles, airDate, isFree } = req.body;
  if (!animeId || !number || !title) return res.status(400).json({ error: 'animeId, number, title required' });

  const animeItem = anime.find((a) => a.id === animeId);
  if (!animeItem) return res.status(404).json({ error: 'Anime not found' });

  const newEp = {
    id: uuidv4(),
    animeId,
    number,
    title,
    description: description || '',
    thumbnail: thumbnail || '',
    duration: 0,
    streamUrl: streamUrl || '',
    qualities: qualities || {},
    subtitles: subtitles || [],
    airDate: airDate || new Date().toISOString().split('T')[0],
    views: 0,
    isFree: isFree ?? true,
  };
  episodes.push(newEp);
  animeItem.episodes.push(newEp.id);
  res.status(201).json(newEp);
});

// PUT /api/episodes/:id — admin
router.put('/:id', authenticate, requireAdmin, (req, res) => {
  const idx = episodes.findIndex((e) => e.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Episode not found' });
  episodes[idx] = { ...episodes[idx], ...req.body, id: episodes[idx].id };
  res.json(episodes[idx]);
});

// DELETE /api/episodes/:id — admin
router.delete('/:id', authenticate, requireAdmin, (req, res) => {
  const idx = episodes.findIndex((e) => e.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Episode not found' });
  const ep = episodes[idx];
  // Remove from anime's episode list
  const animeItem = anime.find((a) => a.id === ep.animeId);
  if (animeItem) animeItem.episodes = animeItem.episodes.filter((id) => id !== ep.id);
  episodes.splice(idx, 1);
  res.json({ message: 'Deleted' });
});

module.exports = router;
