import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { getWatchlist, getAnimeById } from '../lib/api';
import { useAuth } from '../hooks/useAuth';
import AnimeCard from '../components/AnimeCard';

export default function Watchlist() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [watchlistAnime, setWatchlistAnime] = useState([]);

  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [user, loading]);

  useEffect(() => {
    if (!user) return;
    getWatchlist().then(async (r) => {
      const all = [...new Set([...r.data.watchlist, ...r.data.favorites])];
      const items = await Promise.all(all.map((id) => getAnimeById(id).then((r) => r.data).catch(() => null)));
      setWatchlistAnime(items.filter(Boolean));
    });
  }, [user]);

  if (!user) return null;

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-bold mb-6">My Watchlist</h1>
      {watchlistAnime.length === 0 ? (
        <p className="text-gray-500 text-center py-16">Your watchlist is empty. Start adding anime!</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {watchlistAnime.map((a) => <AnimeCard key={a.id} anime={a} />)}
        </div>
      )}
    </div>
  );
}
