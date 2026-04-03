import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { getAnime, getWatchlist, getAnimeById, searchSuggestions } from '../lib/api';
import { useAuth } from '../hooks/useAuth';

export default function Home() {
  const { user } = useAuth();
  const router = useRouter();
  const [topAnime, setTopAnime] = useState([]);
  const [newAnime, setNewAnime] = useState([]);
  const [recentAnime, setRecentAnime] = useState([]);
  const [heroIndex, setHeroIndex] = useState(0);
  const [fade, setFade] = useState(true);
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const timerRef = useRef(null);

  useEffect(() => {
    getAnime({ sort: 'rating', limit: 10 }).then((r) => setTopAnime(r.data.results));
    getAnime({ sort: 'year', limit: 12 }).then((r) => setNewAnime(r.data.results));
    if (user) {
      getWatchlist().then(async (r) => {
        const wl = r.data.watchlist?.slice(0, 6) || [];
        const items = await Promise.all(wl.map((id) => getAnimeById(id).then((r) => r.data).catch(() => null)));
        setRecentAnime(items.filter(Boolean));
      }).catch(() => {});
    }
  }, [user]);

  useEffect(() => {
    if (topAnime.length === 0) return;
    timerRef.current = setInterval(() => {
      setFade(false);
      setTimeout(() => { setHeroIndex((i) => (i + 1) % topAnime.length); setFade(true); }, 300);
    }, 5000);
    return () => clearInterval(timerRef.current);
  }, [topAnime]);

  useEffect(() => {
    if (query.length < 2) { setSuggestions([]); return; }
    const t = setTimeout(async () => {
      try { const res = await searchSuggestions(query); setSuggestions(res.data); } catch {}
    }, 300);
    return () => clearTimeout(t);
  }, [query]);

  const featured = topAnime[heroIndex];

  return (
    <div className="min-h-screen bg-dark">
      {/* ── HERO BANNER ─────────────────────────────────────────── */}
      {featured && (
        <div className="relative h-[420px] md:h-[560px] overflow-hidden">
          <div className={`absolute inset-0 transition-opacity duration-500 ${fade ? 'opacity-100' : 'opacity-0'}`}>
            <div className="absolute inset-0 bg-cover bg-center scale-105"
              style={{ backgroundImage: `url(${featured.coverImage})`, filter: 'blur(18px)' }} />
            <div className="absolute inset-0 bg-black/60" />
            {/* Cover right */}
            <img src={featured.coverImage} alt={featured.title}
              className="absolute right-0 top-0 h-full w-auto object-cover hidden md:block opacity-80" />
            <div className="absolute inset-0 bg-gradient-to-r from-dark via-dark/70 to-transparent" />
          </div>

          {/* Rank + Views */}
          <div className="absolute top-4 left-4 md:left-8 z-10 flex items-center gap-2">
            <span className="bg-brand text-white text-xs font-bold px-2.5 py-1 rounded-lg">#{heroIndex + 1}</span>
          </div>
          <div className="absolute top-4 right-4 z-10 bg-black/60 text-white text-xs px-2.5 py-1 rounded-lg flex items-center gap-1">
            👁 {(featured.views / 1000).toFixed(0)}K
          </div>

          {/* Content */}
          <div className={`absolute bottom-0 left-0 right-0 p-5 md:p-10 z-10 transition-opacity duration-500 ${fade ? 'opacity-100' : 'opacity-0'}`}>
            <div className="flex flex-wrap gap-2 mb-2">
              {featured.genres.slice(0, 3).map((g) => (
                <span key={g} className="text-xs bg-brand/70 text-white px-2.5 py-0.5 rounded-full">{g}</span>
              ))}
            </div>
            <h1 className="text-2xl md:text-4xl font-bold text-white mb-1 drop-shadow">{featured.title}</h1>
            <div className="flex items-center gap-3 mb-3">
              <span className="text-yellow-400 text-sm font-bold">★ {featured.rating}</span>
              <span className="text-gray-400 text-sm">{featured.year}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full ${featured.status === 'ongoing' ? 'bg-green-700 text-white' : 'bg-gray-700 text-gray-300'}`}>
                {featured.status}
              </span>
            </div>
            <p className="text-gray-300 text-sm max-w-lg mb-4 line-clamp-2 hidden md:block">{featured.description}</p>
            <div className="flex gap-3">
              <Link href={`/anime/${featured.slug}`}
                className="bg-brand hover:bg-brand-dark text-white px-5 py-2.5 rounded-full text-sm font-medium transition">
                ▶ Tonton Sekarang
              </Link>
              <Link href={`/anime/${featured.slug}`}
                className="border border-gray-500 hover:border-white text-white px-5 py-2.5 rounded-full text-sm transition">
                Info
              </Link>
            </div>
            {/* Dots */}
            <div className="flex gap-1.5 mt-4">
              {topAnime.slice(0, 10).map((_, i) => (
                <button key={i} onClick={() => { setFade(false); setTimeout(() => { setHeroIndex(i); setFade(true); }, 300); }}
                  className={`h-1.5 rounded-full transition-all ${i === heroIndex ? 'w-6 bg-brand' : 'w-2 bg-gray-600 hover:bg-gray-400'}`} />
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 pb-24 md:pb-10">

        {/* ── Search Bar ──────────────────────────────────────── */}
        <div className="relative mb-8">
          <div className="flex items-center bg-dark-card border border-gray-700 rounded-2xl px-4 py-3 gap-3 focus-within:border-brand transition">
            <span className="text-gray-500">🔍</span>
            <input type="text" value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && query.trim()) { router.push(`/browse?search=${query}`); setSuggestions([]); }}}
              placeholder="Cari anime..."
              className="bg-transparent text-white text-sm flex-1 focus:outline-none placeholder-gray-500" />
          </div>
          {suggestions.length > 0 && (
            <div className="absolute top-full mt-1 left-0 right-0 bg-dark-card border border-gray-700 rounded-xl overflow-hidden shadow-xl z-50">
              {suggestions.map((s) => (
                <Link key={s.id} href={`/anime/${s.slug}`}
                  className="flex items-center gap-3 px-4 py-2.5 hover:bg-dark-surface text-sm text-gray-200"
                  onClick={() => { setSuggestions([]); setQuery(''); }}>
                  <img src={s.coverImage} alt={s.title} className="w-8 h-10 object-cover rounded" />
                  {s.title}
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* ── Premium Banner ──────────────────────────────────── */}
        {user && user.subscription !== 'premium' && (
          <div className="mb-8 bg-gradient-to-r from-yellow-600/20 to-brand/20 border border-brand/30 rounded-2xl p-4 flex items-center gap-4">
            <span className="text-3xl">👑</span>
            <div className="flex-1">
              <p className="text-white font-semibold">Upgrade ke Premium</p>
              <p className="text-gray-400 text-sm">Nonton tanpa iklan, kualitas HD/4K</p>
            </div>
            <Link href="/subscription" className="bg-brand hover:bg-brand-dark text-white text-sm px-4 py-2 rounded-full transition whitespace-nowrap">
              Upgrade
            </Link>
          </div>
        )}

        {/* ── Recently Watched ────────────────────────────────── */}
        {user && recentAnime.length > 0 && (
          <section className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-white font-bold text-lg">
                <span className="text-brand">Terakhir</span> Ditonton
              </h2>
              <Link href="/watchlist" className="text-brand text-sm hover:underline">Lihat Lainnya →</Link>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide md:grid md:grid-cols-6 md:overflow-visible">
              {recentAnime.map((a) => (
                <Link key={a.id} href={`/anime/${a.slug}`} className="flex-shrink-0 w-28 md:w-auto group">
                  <div className="relative rounded-xl overflow-hidden aspect-[2/3] mb-1.5">
                    <img src={a.coverImage} alt={a.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-700">
                      <div className="h-full bg-brand w-1/3" />
                    </div>
                  </div>
                  <p className="text-white text-xs line-clamp-1 group-hover:text-brand transition">{a.title}</p>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* ── New Update ──────────────────────────────────────── */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-bold text-lg">
              <span className="text-brand">New</span> Update Anime
            </h2>
            <Link href="/browse?sort=year" className="text-brand text-sm hover:underline">Lihat Jadwal →</Link>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide md:grid md:grid-cols-6 md:overflow-visible">
            {newAnime.map((a) => (
              <Link key={a.id} href={`/anime/${a.slug}`} className="flex-shrink-0 w-28 md:w-auto group">
                <div className="relative rounded-xl overflow-hidden aspect-[2/3] mb-1.5">
                  <img src={a.coverImage} alt={a.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  <span className="absolute top-1.5 left-1.5 bg-brand text-white text-xs px-1.5 py-0.5 rounded-md font-bold">New</span>
                  <span className="absolute top-1.5 right-1.5 text-yellow-400 text-xs drop-shadow">★ {a.rating}</span>
                </div>
                <p className="text-white text-xs line-clamp-1 group-hover:text-brand transition">{a.title}</p>
                <p className="text-gray-500 text-xs">{a.year}</p>
              </Link>
            ))}
          </div>
        </section>

        {/* ── Top Rated ───────────────────────────────────────── */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-bold text-lg">
              <span className="text-brand">Top</span> Rated
            </h2>
            <Link href="/browse?sort=rating" className="text-brand text-sm hover:underline">Lihat Semua →</Link>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide md:grid md:grid-cols-5 md:overflow-visible">
            {topAnime.map((a, i) => (
              <Link key={a.id} href={`/anime/${a.slug}`} className="flex-shrink-0 w-28 md:w-auto group">
                <div className="relative rounded-xl overflow-hidden aspect-[2/3] mb-1.5">
                  <img src={a.coverImage} alt={a.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  <span className="absolute top-1.5 left-1.5 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded-md font-bold">#{i + 1}</span>
                </div>
                <p className="text-white text-xs line-clamp-1 group-hover:text-brand transition">{a.title}</p>
                <p className="text-yellow-400 text-xs">★ {a.rating}</p>
              </Link>
            ))}
          </div>
        </section>
      </div>

      {/* ── Bottom Nav (mobile only) ─────────────────────────── */}
      <div className="fixed bottom-0 left-0 right-0 bg-dark-card border-t border-gray-800 z-50 md:hidden">
        <div className="flex items-center justify-around py-3 px-2">
          {[
            { href: '/', icon: '🏠', label: 'Home' },
            { href: '/browse', icon: '🔍', label: 'Browse' },
            { href: '/watchlist', icon: '🕐', label: 'Watchlist' },
            { href: '/browse?sort=year', icon: '📺', label: 'Jadwal' },
            { href: user ? '/profile' : '/login', icon: user ? null : '👤', label: 'Profil', avatar: user?.avatar },
          ].map((item) => (
            <Link key={item.href} href={item.href}
              className="flex flex-col items-center gap-0.5 text-gray-500 hover:text-white transition">
              {item.avatar ? (
                <img src={item.avatar} alt="" className="w-6 h-6 rounded-full" />
              ) : (
                <span className="text-xl">{item.icon}</span>
              )}
              <span className="text-xs">{item.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
