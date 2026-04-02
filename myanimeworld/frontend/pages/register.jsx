import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { register } from '../lib/api';
import { useAuth } from '../hooks/useAuth';

export default function Register() {
  const router = useRouter();
  const { loginUser } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const res = await register(form);
      loginUser(res.data.token, res.data.user);
      router.push('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-dark-card border border-gray-800 rounded-2xl p-8">
        <h1 className="text-2xl font-bold text-white mb-1">Create account</h1>
        <p className="text-gray-400 text-sm mb-6">Join MyAnimeWorld for free</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {['name', 'email', 'password'].map((field) => (
            <div key={field}>
              <label className="text-sm text-gray-400 block mb-1 capitalize">{field}</label>
              <input
                type={field === 'password' ? 'password' : field === 'email' ? 'email' : 'text'}
                required value={form[field]}
                onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                className="w-full bg-dark border border-gray-700 text-white px-4 py-2.5 rounded-lg focus:outline-none focus:border-brand text-sm"
              />
            </div>
          ))}

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <button type="submit" disabled={loading}
            className="w-full bg-brand hover:bg-brand-dark text-white py-2.5 rounded-lg font-medium transition disabled:opacity-60">
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-gray-400 text-sm mt-5">
          Already have an account?{' '}
          <Link href="/login" className="text-brand hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
