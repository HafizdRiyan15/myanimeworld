import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '../hooks/useAuth';
import { searchSuggestions } from '../lib/api';

export default function Navbar() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const searchRef = useRef(null);

  // Debounced search suggestions
  useEffect(() => {
    if (query.length < 2) { setSuggestions([]); return; }
    const t = setTimeout(async () => {
      try {
        const res = await searchSuggestions(query);
        setSuggestions(res.data);
      } catch {}
    }, 300);
    return () => clearTimeout(t);
  }, [query]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) router.push(`/browse?search=${encodeURIComponent(query)}`);
    setSuggestions([]);
  };

  return (
    <nav className="bg-dark-card border-b border-gray-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-16">
        {/* Logo */}
        <Link href="/" className="text-brand font-bold text-xl tracking-tight">
          MyAnimeWorld
        </Link>

        {/* Nav links */}
        <div className="hidden md:flex items-center gap-6 text-sm text-gray-300">
          <Link href="/browse" className="hover:text-white transition">Browse</Link>
          {/* Genre dropdown */}
          <div className="relative group">
            <button className="hover:text-white transition flex items-center gap-1">
              Genre <span className="text-xs">▾</span>
            </button>
            <div className="absolute top-full left-0 mt-2 w-48 bg-dark-card border border-gray-700 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 p-2">
              {['Action','Adventure','Comedy','Drama','Fantasy','Horror','Magic','Mecha','Mystery','Romance','Sci-Fi','School','Slice of Life','Sports','Supernatural','Thriller','Cyberpunk'].map((g) => (
                <Link key={g} href={`/browse?genre=${g}`}
                  className="block px-3 py-1.5 text-sm text-gray-300 hover:text-white hover:bg-dark-surface rounded-lg transition">
                  {g}
                </Link>
              ))}
            </div>
          </div>
          {user?.role === 'admin' && (
            <Link href="/admin" className="text-brand hover:text-brand-dark transition">Admin</Link>
          )}
        </div>

        {/* Search */}
        <div className="relative hidden md:block" ref={searchRef}>
          <form onSubmit={handleSearch}>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search anime..."
              className="bg-dark text-white text-sm px-4 py-2 rounded-full border border-gray-700 focus:outline-none focus:border-brand w-56"
            />
          </form>
          {suggestions.length > 0 && (
            <div className="absolute top-full mt-1 w-full bg-dark-card border border-gray-700 rounded-lg overflow-hidden shadow-xl">
              {suggestions.map((s) => (
                <Link
                  key={s.id}
                  href={`/anime/${s.slug}`}
                  className="flex items-center gap-3 px-3 py-2 hover:bg-dark-surface text-sm text-gray-200"
                  onClick={() => { setSuggestions([]); setQuery(''); }}
                >
                  <img src={s.coverImage} alt={s.title} className="w-8 h-10 object-cover rounded" />
                  {s.title}
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* User menu */}
        <div className="flex items-center gap-3">
          {user ? (
            <div className="relative">
              <button onClick={() => setMenuOpen(!menuOpen)} className="flex items-center gap-2">
                <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full border border-brand" />
                <span className="text-sm text-gray-300 hidden md:block">{user.name}</span>
              </button>
              {menuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-dark-card border border-gray-700 rounded-lg shadow-xl text-sm">
                  <Link href="/profile" className="block px-4 py-2 hover:bg-dark-surface text-gray-200">Profile</Link>
                  <Link href="/watchlist" className="block px-4 py-2 hover:bg-dark-surface text-gray-200">Watchlist</Link>
                  <Link href="/subscription" className="block px-4 py-2 hover:bg-dark-surface text-gray-200">Subscription</Link>
                  <hr className="border-gray-700 my-1" />
                  <button onClick={() => { logout(); setMenuOpen(false); router.push('/'); }}
                    className="w-full text-left px-4 py-2 hover:bg-dark-surface text-red-400">
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex gap-2">
              <Link href="/login" className="text-sm text-gray-300 hover:text-white px-3 py-1">Login</Link>
              <Link href="/register" className="text-sm bg-brand hover:bg-brand-dark text-white px-4 py-1.5 rounded-full transition">
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
