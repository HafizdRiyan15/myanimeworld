import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { login } from '../lib/api';
import { useAuth } from '../hooks/useAuth';

export default function Login() {
  const router = useRouter();
  const { loginUser } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const res = await login(form);
      loginUser(res.data.token, res.data.user);
      router.push('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-dark-card border border-gray-800 rounded-2xl p-8">
        <h1 className="text-2xl font-bold text-white mb-1">Welcome back</h1>
        <p className="text-gray-400 text-sm mb-6">Sign in to your MyAnimeWorld account</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm text-gray-400 block mb-1">Email</label>
            <input type="email" required value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full bg-dark border border-gray-700 text-white px-4 py-2.5 rounded-lg focus:outline-none focus:border-brand text-sm" />
          </div>
          <div>
            <label className="text-sm text-gray-400 block mb-1">Password</label>
            <input type="password" required value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full bg-dark border border-gray-700 text-white px-4 py-2.5 rounded-lg focus:outline-none focus:border-brand text-sm" />
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <button type="submit" disabled={loading}
            className="w-full bg-brand hover:bg-brand-dark text-white py-2.5 rounded-lg font-medium transition disabled:opacity-60">
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-gray-400 text-sm mt-5">
          Don't have an account?{' '}
          <Link href="/register" className="text-brand hover:underline">Sign up</Link>
        </p>

        {/* Demo credentials */}
        <div className="mt-5 p-3 bg-dark border border-gray-700 rounded-lg text-xs text-gray-400">
          <p className="font-medium text-gray-300 mb-1">Demo accounts:</p>
          <p>Admin: alice@example.com / password123</p>
          <p>User: bob@example.com / password123</p>
        </div>
      </div>
    </div>
  );
}
