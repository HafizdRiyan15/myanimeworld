import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../hooks/useAuth';
import { getWatchlist, getAnimeById } from '../lib/api';
import AnimeCard from '../components/AnimeCard';

export default function Profile() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [watchlistAnime, setWatchlistAnime] = useState([]);
  const [favoritesAnime, setFavoritesAnime] = useState([]);
  const [tab, setTab] = useState('watchlist');

  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [user, loading]);

  useEffect(() => {
    if (!user) return;
    getWatchlist().then(async (r) => {
      const { watchlist, favorites } = r.data;
      const wl = await Promise.all(watchlist.map((id) => getAnimeById(id).then((r) => r.data).catch(() => null)));
      const fav = await Promise.all(favorites.map((id) => getAnimeById(id).then((r) => r.data).catch(() => null)));
      setWatchlistAnime(wl.filter(Boolean));
      setFavoritesAnime(fav.filter(Boolean));
    });
  }, [user]);

  if (!user) return null;

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      {/* Profile header */}
      <div className="flex items-center gap-5 mb-10">
        <img src={user.avatar} alt={user.name} className="w-20 h-20 rounded-full border-2 border-brand" />
        <div>
          <h1 className="text-2xl font-bold text-white">{user.name}</h1>
          <p className="text-gray-400 text-sm">{user.email}</p>
          <span className={`inline-block mt-1 text-xs px-3 py-0.5 rounded-full ${
            user.subscription === 'premium' ? 'bg-brand/20 text-brand border border-brand/30' : 'bg-gray-700 text-gray-300'
          }`}>
            {user.subscription === 'premium' ? '★ Premium' : 'Free'}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-6 border-b border-gray-800 mb-6">
        {['watchlist', 'favorites'].map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`pb-3 text-sm font-medium capitalize border-b-2 -mb-px transition ${
              tab === t ? 'border-brand text-brand' : 'border-transparent text-gray-400 hover:text-white'
            }`}>
            {t} ({t === 'watchlist' ? watchlistAnime.length : favoritesAnime.length})
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {(tab === 'watchlist' ? watchlistAnime : favoritesAnime).map((a) => (
          <AnimeCard key={a.id} anime={a} />
        ))}
      </div>

      {(tab === 'watchlist' ? watchlistAnime : favoritesAnime).length === 0 && (
        <p className="text-gray-500 text-center py-12">Nothing here yet.</p>
      )}
    </div>
  );
}
