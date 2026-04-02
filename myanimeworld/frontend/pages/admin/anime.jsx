import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { getAnime, createAnime, deleteAnime } from '../../lib/api';
import { useAuth } from '../../hooks/useAuth';

export default function AdminAnime() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [anime, setAnime] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', genres: '', year: '', status: 'ongoing' });
  const [msg, setMsg] = useState('');

  useEffect(() => {
    if (!loading && (!user || user.role !== 'admin')) router.push('/');
  }, [user, loading]);

  useEffect(() => {
    if (user?.role === 'admin') getAnime({ limit: 50 }).then((r) => setAnime(r.data.results));
  }, [user]);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const res = await createAnime({
        ...form,
        genres: form.genres.split(',').map((g) => g.trim()),
        year: parseInt(form.year),
      });
      setAnime((prev) => [res.data, ...prev]);
      setShowForm(false);
      setForm({ title: '', description: '', genres: '', year: '', status: 'ongoing' });
      setMsg('Anime created!');
    } catch (err) {
      setMsg(err.response?.data?.error || 'Error');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this anime?')) return;
    await deleteAnime(id);
    setAnime((prev) => prev.filter((a) => a.id !== id));
  };

  if (!user || user.role !== 'admin') return null;

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Manage Anime</h1>
        <button onClick={() => setShowForm(!showForm)}
          className="bg-brand hover:bg-brand-dark text-white px-4 py-2 rounded-lg text-sm transition">
          {showForm ? 'Cancel' : '+ Add Anime'}
        </button>
      </div>

      {msg && <p className="text-brand text-sm mb-4">{msg}</p>}

      {/* Create form */}
      {showForm && (
        <form onSubmit={handleCreate} className="bg-dark-card border border-gray-800 rounded-xl p-6 mb-6 grid grid-cols-2 gap-4">
          {[
            { key: 'title', label: 'Title', type: 'text' },
            { key: 'year', label: 'Year', type: 'number' },
            { key: 'genres', label: 'Genres (comma-separated)', type: 'text' },
          ].map(({ key, label, type }) => (
            <div key={key}>
              <label className="text-sm text-gray-400 block mb-1">{label}</label>
              <input type={type} value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                className="w-full bg-dark border border-gray-700 text-white px-3 py-2 rounded-lg text-sm focus:outline-none focus:border-brand" />
            </div>
          ))}
          <div>
            <label className="text-sm text-gray-400 block mb-1">Status</label>
            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}
              className="w-full bg-dark border border-gray-700 text-white px-3 py-2 rounded-lg text-sm focus:outline-none">
              <option value="ongoing">Ongoing</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          <div className="col-span-2">
            <label className="text-sm text-gray-400 block mb-1">Description</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full bg-dark border border-gray-700 text-white px-3 py-2 rounded-lg text-sm focus:outline-none focus:border-brand h-20 resize-none" />
          </div>
          <div className="col-span-2">
            <button type="submit" className="bg-brand hover:bg-brand-dark text-white px-6 py-2 rounded-lg text-sm transition">
              Create Anime
            </button>
          </div>
        </form>
      )}

      {/* Anime table */}
      <div className="bg-dark-card border border-gray-800 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b border-gray-800">
            <tr className="text-gray-400">
              <th className="text-left px-4 py-3">Title</th>
              <th className="text-left px-4 py-3">Year</th>
              <th className="text-left px-4 py-3">Status</th>
              <th className="text-left px-4 py-3">Rating</th>
              <th className="text-left px-4 py-3">Episodes</th>
              <th className="text-left px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {anime.map((a) => (
              <tr key={a.id} className="border-b border-gray-800/50 hover:bg-dark-surface">
                <td className="px-4 py-3 text-white font-medium">{a.title}</td>
                <td className="px-4 py-3 text-gray-400">{a.year}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${a.status === 'ongoing' ? 'bg-green-700 text-white' : 'bg-gray-700 text-gray-300'}`}>
                    {a.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-yellow-400">★ {a.rating}</td>
                <td className="px-4 py-3 text-gray-400">{a.episodes?.length || 0}</td>
                <td className="px-4 py-3 flex gap-3">
                  <button onClick={() => handleDelete(a.id)} className="text-red-400 hover:text-red-300 text-xs transition">
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
