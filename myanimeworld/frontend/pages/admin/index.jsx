import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { getAdminStats, getAdminUsers, deleteUser } from '../../lib/api';
import { useAuth } from '../../hooks/useAuth';

export default function AdminDashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [tab, setTab] = useState('overview');

  useEffect(() => {
    if (!loading && (!user || user.role !== 'admin')) router.push('/');
  }, [user, loading]);

  useEffect(() => {
    if (user?.role !== 'admin') return;
    getAdminStats().then((r) => setStats(r.data));
    getAdminUsers().then((r) => setUsers(r.data));
  }, [user]);

  if (!user || user.role !== 'admin') return null;

  const handleDeleteUser = async (id) => {
    if (!confirm('Delete this user?')) return;
    await deleteUser(id);
    setUsers((prev) => prev.filter((u) => u.id !== id));
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <Link href="/admin/anime" className="bg-brand hover:bg-brand-dark text-white px-4 py-2 rounded-lg text-sm transition">
          Manage Anime
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex gap-6 border-b border-gray-800 mb-6">
        {['overview', 'users'].map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`pb-3 text-sm font-medium capitalize border-b-2 -mb-px transition ${
              tab === t ? 'border-brand text-brand' : 'border-transparent text-gray-400 hover:text-white'
            }`}>
            {t}
          </button>
        ))}
      </div>

      {tab === 'overview' && stats && (
        <div>
          {/* Stats grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Total Users', value: stats.totalUsers },
              { label: 'Premium Users', value: stats.premiumUsers },
              { label: 'Total Anime', value: stats.totalAnime },
              { label: 'Total Views', value: stats.totalViews?.toLocaleString() },
            ].map((s) => (
              <div key={s.label} className="bg-dark-card border border-gray-800 rounded-xl p-5">
                <p className="text-gray-400 text-sm">{s.label}</p>
                <p className="text-2xl font-bold text-white mt-1">{s.value}</p>
              </div>
            ))}
          </div>

          {/* Popular anime */}
          <h2 className="text-lg font-bold mb-4">Popular Anime</h2>
          <div className="bg-dark-card border border-gray-800 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="border-b border-gray-800">
                <tr className="text-gray-400">
                  <th className="text-left px-4 py-3">Title</th>
                  <th className="text-left px-4 py-3">Views</th>
                  <th className="text-left px-4 py-3">Rating</th>
                  <th className="text-left px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {stats.popularAnime?.map((a) => (
                  <tr key={a.id} className="border-b border-gray-800/50 hover:bg-dark-surface">
                    <td className="px-4 py-3 text-white">{a.title}</td>
                    <td className="px-4 py-3 text-gray-400">{a.views?.toLocaleString()}</td>
                    <td className="px-4 py-3 text-yellow-400">★ {a.rating}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${a.status === 'ongoing' ? 'bg-green-700 text-white' : 'bg-gray-700 text-gray-300'}`}>
                        {a.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'users' && (
        <div className="bg-dark-card border border-gray-800 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-800">
              <tr className="text-gray-400">
                <th className="text-left px-4 py-3">User</th>
                <th className="text-left px-4 py-3">Email</th>
                <th className="text-left px-4 py-3">Role</th>
                <th className="text-left px-4 py-3">Plan</th>
                <th className="text-left px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-gray-800/50 hover:bg-dark-surface">
                  <td className="px-4 py-3 flex items-center gap-2">
                    <img src={u.avatar} alt={u.name} className="w-7 h-7 rounded-full" />
                    <span className="text-white">{u.name}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-400">{u.email}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${u.role === 'admin' ? 'bg-brand/20 text-brand' : 'bg-gray-700 text-gray-300'}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs ${u.subscription === 'premium' ? 'text-brand' : 'text-gray-500'}`}>
                      {u.subscription}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => handleDeleteUser(u.id)}
                      className="text-red-400 hover:text-red-300 text-xs transition">
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
