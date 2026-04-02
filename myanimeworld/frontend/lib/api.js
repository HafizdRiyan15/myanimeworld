import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const api = axios.create({ baseURL: API_URL });

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('maw_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const register = (data) => api.post('/auth/register', data);
export const login = (data) => api.post('/auth/login', data);
export const getMe = () => api.get('/auth/me');
export const updateProfile = (data) => api.put('/auth/profile', data);

// ─── Anime ────────────────────────────────────────────────────────────────────
export const getAnime = (params) => api.get('/anime', { params });
export const getAnimeById = (id) => api.get(`/anime/${id}`);
export const searchSuggestions = (q) => api.get('/anime/search/suggestions', { params: { q } });
export const getGenres = () => api.get('/anime/genres');
export const createAnime = (data) => api.post('/anime', data);
export const updateAnime = (id, data) => api.put(`/anime/${id}`, data);
export const deleteAnime = (id) => api.delete(`/anime/${id}`);

// ─── Episodes ─────────────────────────────────────────────────────────────────
export const getEpisode = (id) => api.get(`/episodes/${id}`);
export const createEpisode = (data) => api.post('/episodes', data);

// ─── Reviews ─────────────────────────────────────────────────────────────────
export const getReviews = (animeId) => api.get('/reviews', { params: { animeId } });
export const postReview = (data) => api.post('/reviews', data);

// ─── Watchlist ────────────────────────────────────────────────────────────────
export const getWatchlist = () => api.get('/watchlist');
export const addToWatchlist = (animeId) => api.post('/watchlist/add', { animeId });
export const removeFromWatchlist = (animeId) => api.delete('/watchlist/remove', { data: { animeId } });
export const addFavorite = (animeId) => api.post('/watchlist/favorite', { animeId });
export const removeFavorite = (animeId) => api.delete('/watchlist/favorite', { data: { animeId } });
export const trackProgress = (episodeId) => api.post('/watchlist/progress', { episodeId });

// ─── Recommendations ─────────────────────────────────────────────────────────
export const getRecommendations = () => api.get('/recommendations');
export const getSimilar = (animeId) => api.get(`/recommendations/similar/${animeId}`);

// ─── Subscription ─────────────────────────────────────────────────────────────
export const getPlans = () => api.get('/subscription/plans');
export const createCheckout = (plan) => api.post('/subscription/checkout', { plan });

// ─── Admin ────────────────────────────────────────────────────────────────────
export const getAdminStats = () => api.get('/admin/stats');
export const getAdminUsers = () => api.get('/admin/users');
export const deleteUser = (id) => api.delete(`/admin/users/${id}`);

export default api;
