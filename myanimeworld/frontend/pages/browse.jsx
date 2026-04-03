import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { getAnime, getGenres } from '../lib/api';
import AnimeCard from '../components/AnimeCard';

const TABS = [
  { key: 'popularity', label: 'Popular' },
  { key: 'rating', label: 'Top Rated' },
  { key: 'year', label: 'Newest' },
  { key: 'title', label: 'A–Z' },
];

export default function Browse() {
  const router = useRouter();
  const { genre: qGenre, sort: qSort, search: qSearch, year: qYear } = router.query;

  const [anime, setAnime] = useState([]);
  const [genres, setGenres] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState('popularity');
  const [search, setSearch] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('');
  const [year, setYear] = useState('');
  const [loading, setLoading] = useState(false);
  const LIMIT = 20;

  // Sync from URL query
  useEffect(() => {
    if (qSort) setSort(qSort);
    if (qSearch) setSearch(qSearch);
    if (qGenre) setSelectedGenre(qGenre);
    if (qYear) setYear(qYear);
  }, [qSort, qSearch, qGenre, qYear]);

  useEffect(() => { getGenres().then((r) => setGenres(r.data)); }, []);

  useEffect(() => {
    setLoading(true);
    getAnime({ genre: selectedGenre, sort, search, year, page, limit: LIMIT })
      .then((r) => { setAnime(r.data.results); setTotal(r.data.total); })
      .finally(() => setLoading(false));
  }, [selectedGenre, sort, search, year, page]);

  const totalPages = Math.ceil(total / LIMIT);

  const handleTab = (key) => { setSort(key); setPage(1); };
  const handleGenre = (g) => { setSelectedGenre(g === selectedGenre ? '' : g); setPage(1); };

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Header + Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold">
          {selectedGenre ? `Genre: ${selectedGenre}` : 'Browse Anime'}
        </h1>
        <div className="flex gap-2">
          <input
            type="text" placeholder="Search anime..."
            value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="bg-dark-card border border-gray-700 text-white text-sm px-4 py-2 rounded-lg focus:outline-none focus:border-brand w-48"
          />
          <input
            type="number" placeholder="Year" value={year} min="1990" max="2025"
            onChange={(e) => { setYear(e.target.value); setPage(1); }}
            className="bg-dark-card border border-gray-700 text-white text-sm px-3 py-2 rounded-lg w-24 focus:outline-none"
          />
        </div>
      </div>

      {/* Sort Tabs */}
      <div className="flex gap-1 border-b border-gray-800 mb-6">
        {TABS.map((t) => (
          <button key={t.key} onClick={() => handleTab(t.key)}
            className={`px-5 py-2.5 text-sm font-medium border-b-2 -mb-px transition ${
              sort === t.key ? 'border-brand text-brand' : 'border-transparent text-gray-400 hover:text-white'
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Genre pills */}
      <div className="flex flex-wrap gap-2 mb-6">
        {genres.map((g) => (
          <button key={g} onClick={() => handleGenre(g)}
            className={`text-xs px-3 py-1.5 rounded-full border transition ${
              selectedGenre === g
                ? 'bg-brand border-brand text-white'
                : 'border-gray-700 text-gray-400 hover:border-brand hover:text-white'
            }`}>
            {g}
          </button>
        ))}
      </div>

      {/* Results count */}
      <p className="text-gray-500 text-sm mb-4">{total} anime ditemukan</p>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {Array.from({ length: LIMIT }).map((_, i) => (
            <div key={i} className="aspect-[2/3] bg-dark-card rounded-lg animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {anime.map((a) => <AnimeCard key={a.id} anime={a} />)}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-10">
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
            className="px-4 py-2 bg-dark-card border border-gray-700 rounded-lg text-sm disabled:opacity-40 hover:border-brand transition">
            ← Prev
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button key={p} onClick={() => setPage(p)}
              className={`px-4 py-2 rounded-lg text-sm border transition ${
                p === page ? 'bg-brand border-brand text-white' : 'bg-dark-card border-gray-700 hover:border-brand'
              }`}>
              {p}
            </button>
          ))}
          <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
            className="px-4 py-2 bg-dark-card border border-gray-700 rounded-lg text-sm disabled:opacity-40 hover:border-brand transition">
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
