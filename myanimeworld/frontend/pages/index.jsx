import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getAnime, getRecommendations } from '../lib/api';
import AnimeCard from '../components/AnimeCard';
import { useAuth } from '../hooks/useAuth';

export default function Home() {
  const { user } = useAuth();
  const [popular, setPopular] = useState([]);
  const [topRated, setTopRated] = useState([]);
  const [recs, setRecs] = useState([]);
  const [featured, setFeatured] = useState(null);

  useEffect(() => {
    getAnime({ sort: 'popularity', limit: 20 }).then((r) => {
      setPopular(r.data.results);
      setFeatured(r.data.results[0]);
    });
    getAnime({ sort: 'rating', limit: 20 }).then((r) => setTopRated(r.data.results));
    if (user) {
      getRecommendations().then((r) => setRecs(r.data)).catch(() => {});
    }
  }, [user]);

  return (
    <main>
      {/* Hero Banner */}
      {featured && (
        <div
          className="relative h-[500px] flex items-end"
          style={{ backgroundImage: `url(${featured.bannerImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-dark via-dark/60 to-transparent" />
          <div className="relative z-10 max-w-7xl mx-auto px-6 pb-12 w-full">
            <div className="flex flex-wrap gap-2 mb-3">
              {featured.genres.map((g) => (
                <span key={g} className="text-xs bg-brand/80 text-white px-3 py-1 rounded-full">{g}</span>
              ))}
            </div>
            <h1 className="text-4xl font-bold text-white mb-2">{featured.title}</h1>
            <p className="text-gray-300 max-w-xl text-sm mb-5 line-clamp-2">{featured.description}</p>
            <div className="flex gap-3">
              <Link href={`/anime/${featured.slug}`}
                className="bg-brand hover:bg-brand-dark text-white px-6 py-2.5 rounded-full font-medium transition">
                ▶ Watch Now
              </Link>
              <Link href={`/anime/${featured.slug}`}
                className="border border-gray-500 hover:border-white text-white px-6 py-2.5 rounded-full transition">
                More Info
              </Link>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-6 py-10 space-y-12">
        {/* Popular */}
        <section>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-bold text-white">Popular Now</h2>
            <Link href="/browse?sort=popularity" className="text-brand text-sm hover:underline">View all</Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
            {popular.map((a) => <AnimeCard key={a.id} anime={a} />)}
          </div>
        </section>

        {/* Top Rated */}
        <section>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-bold text-white">Top Rated</h2>
            <Link href="/browse?sort=rating" className="text-brand text-sm hover:underline">View all</Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {topRated.map((a) => <AnimeCard key={a.id} anime={a} />)}
          </div>
        </section>

        {/* Personalized Recommendations */}
        {user && recs.length > 0 && (
          <section>
            <h2 className="text-xl font-bold text-white mb-5">Recommended for You</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {recs.map((a) => <AnimeCard key={a.id} anime={a} />)}
            </div>
          </section>
        )}

        {/* CTA for non-premium */}
        {user && user.subscription !== 'premium' && (
          <section className="bg-gradient-to-r from-brand/20 to-dark-surface border border-brand/30 rounded-2xl p-8 text-center">
            <h2 className="text-2xl font-bold mb-2">Upgrade to Premium</h2>
            <p className="text-gray-400 mb-5">Ad-free streaming, HD/4K quality, and exclusive content.</p>
            <Link href="/subscription" className="bg-brand hover:bg-brand-dark text-white px-8 py-3 rounded-full font-medium transition">
              Get Premium
            </Link>
          </section>
        )}
      </div>
    </main>
  );
}
