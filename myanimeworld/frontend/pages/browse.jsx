import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { getAnime, getGenres } from '../lib/api';
import AnimeCard from '../components/AnimeCard';

export default function Browse() {
  const router = useRouter();
  const { genre, sort: initSort = 'popularity', search: initSearch = '', year: initYear = '' } = router.query;

  const [anime, setAnime] = useState([]);
  const [genres, setGenres] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState(initSort);
  const [search, setSearch] = useState(initSearch);
  const [selectedGenre, setSelectedGenre] = useState(genre || '');
  const [year, setYear] = useState(initYear);
  const [loading, setLoading] = useState(false);
  const LIMIT = 20;

  useEffect(() => { getGenres().then((r) => setGenres(r.data)); }, []);

  useEffect(() => {
    setLoading(true);
    getAnime({ genre: selectedGenre, sort, search, year, page, limit: LIMIT })
      .then((r) => { setAnime(r.data.results); setTotal(r.data.total); })
      .finally(() => setLoading(false));
  }, [selectedGenre, sort, search, year, page]);

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <h1 className="text-2xl font-bold mb-6">Browse Anime</h1>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-8">
        <input
          type="text"
          placeholder="Search..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="bg-dark-card border border-gray-700 text-white text-sm px-4 py-2 rounded-lg focus:outline-none focus:border-brand"
        />

        <select value={selectedGenre} onChange={(e) => { setSelectedGenre(e.target.value); setPage(1); }}
          className="bg-dark-card border border-gray-700 text-white text-sm px-4 py-2 rounded-lg focus:outline-none">
          <option value="">All Genres</option>
          {genres.map((g) => <option key={g} value={g}>{g}</option>)}
        </select>

        <select value={sort} onChange={(e) => { setSort(e.target.value); setPage(1); }}
          className="bg-dark-card border border-gray-700 text-white text-sm px-4 py-2 rounded-lg focus:outline-none">
          <option value="popularity">Most Popular</option>
          <option value="rating">Top Rated</option>
          <option value="views">Most Watched</option>
          <option value="year">Newest</option>
          <option value="title">A–Z</option>
        </select>

        <input type="number" placeholder="Year" value={year} min="1990" max="2025"
          onChange={(e) => { setYear(e.target.value); setPage(1); }}
          className="bg-dark-card border border-gray-700 text-white text-sm px-4 py-2 rounded-lg w-24 focus:outline-none" />
      </div>

      {/* Results */}
      <p className="text-gray-400 text-sm mb-4">{total} results</p>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {Array.from({ length: LIMIT }).map((_, i) => (
            <div key={i} className="aspect-[2/3] bg-dark-card rounded-lg animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
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
