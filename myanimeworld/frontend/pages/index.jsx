import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { getAnime, getRecommendations } from '../lib/api';
import AnimeCard from '../components/AnimeCard';
import { useAuth } from '../hooks/useAuth';

export default function Home() {
  const { user } = useAuth();
  const [popular, setPopular] = useState([]);
  const [topRated, setTopRated] = useState([]);
  const [recs, setRecs] = useState([]);
  const [heroList, setHeroList] = useState([]);
  const [heroIndex, setHeroIndex] = useState(0);
  const [fade, setFade] = useState(true);
  const timerRef = useRef(null);

  useEffect(() => {
    getAnime({ sort: 'popularity', limit: 20 }).then((r) => setPopular(r.data.results));
    getAnime({ sort: 'rating', limit: 20 }).then((r) => {
      setTopRated(r.data.results);
      setHeroList(r.data.results.slice(0, 10));
    });
    if (user) {
      getRecommendations().then((r) => setRecs(r.data)).catch(() => {});
    }
  }, [user]);

  // Auto-slide every 5 seconds
  useEffect(() => {
    if (heroList.length === 0) return;
    timerRef.current = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setHeroIndex((i) => (i + 1) % heroList.length);
        setFade(true);
      }, 400);
    }, 5000);
    return () => clearInterval(timerRef.current);
  }, [heroList]);

  const goToSlide = (i) => {
    setFade(false);
    setTimeout(() => { setHeroIndex(i); setFade(true); }, 400);
    clearInterval(timerRef.current);
  };

  const featured = heroList[heroIndex];

  return (
    <main>
      {/* Hero Banner Slideshow */}
      {featured && (
        <div className="relative h-[520px] flex items-end overflow-hidden">
          {/* Background image with fade transition */}
          <div
            className="absolute inset-0 bg-cover bg-center transition-opacity duration-500"
            style={{
              backgroundImage: `url(${featured.bannerImage || featured.coverImage})`,
              opacity: fade ? 1 : 0,
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-dark via-dark/60 to-transparent" />

          {/* Content */}
          <div className={`relative z-10 max-w-7xl mx-auto px-6 pb-10 w-full transition-opacity duration-500 ${fade ? 'opacity-100' : 'opacity-0'}`}>
            <div className="flex flex-wrap gap-2 mb-3">
              {featured.genres.map((g) => (
                <span key={g} className="text-xs bg-brand/80 text-white px-3 py-1 rounded-full">{g}</span>
              ))}
            </div>
            <h1 className="text-4xl font-bold text-white mb-2 drop-shadow-lg">{featured.title}</h1>
            <div className="flex items-center gap-3 mb-3">
              <span className="text-yellow-400 font-bold">★ {featured.rating}</span>
              <span className="text-gray-400 text-sm">{featured.year}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full ${featured.status === 'ongoing' ? 'bg-green-600 text-white' : 'bg-gray-600 text-gray-200'}`}>
                {featured.status}
              </span>
            </div>
            <p className="text-gray-300 max-w-xl text-sm mb-5 line-clamp-2">{featured.description}</p>
            <div className="flex gap-3 mb-6">
              <Link href={`/anime/${featured.slug}`}
                className="bg-brand hover:bg-brand-dark text-white px-6 py-2.5 rounded-full font-medium transition">
                ▶ Watch Now
              </Link>
              <Link href={`/anime/${featured.slug}`}
                className="border border-gray-500 hover:border-white text-white px-6 py-2.5 rounded-full transition">
                More Info
              </Link>
            </div>

            {/* Dot indicators */}
            <div className="flex gap-2">
              {heroList.map((_, i) => (
                <button key={i} onClick={() => goToSlide(i)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${i === heroIndex ? 'w-8 bg-brand' : 'w-3 bg-gray-500 hover:bg-gray-300'}`}
                />
              ))}
            </div>
          </div>

          {/* Prev/Next arrows */}
          <button onClick={() => goToSlide((heroIndex - 1 + heroList.length) % heroList.length)}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-black/40 hover:bg-black/70 text-white w-10 h-10 rounded-full flex items-center justify-center transition">
            ‹
          </button>
          <button onClick={() => goToSlide((heroIndex + 1) % heroList.length)}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-black/40 hover:bg-black/70 text-white w-10 h-10 rounded-full flex items-center justify-center transition">
            ›
          </button>
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
