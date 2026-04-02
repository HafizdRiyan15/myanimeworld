import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { getPlans, createCheckout } from '../lib/api';
import { useAuth } from '../hooks/useAuth';

export default function Subscription() {
  const { user } = useAuth();
  const router = useRouter();
  const [plans, setPlans] = useState({});
  const [loading, setLoading] = useState('');

  useEffect(() => { getPlans().then((r) => setPlans(r.data)); }, []);

  const handleCheckout = async (plan) => {
    if (!user) return router.push('/login');
    setLoading(plan);
    try {
      const res = await createCheckout(plan);
      if (res.data.url) window.location.href = res.data.url;
      else alert(res.data.message || 'Checkout initiated (mock mode)');
    } catch (err) {
      alert(err.response?.data?.error || 'Checkout failed');
    } finally {
      setLoading('');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-16 text-center">
      <h1 className="text-3xl font-bold mb-2">Choose Your Plan</h1>
      <p className="text-gray-400 mb-10">Unlock premium content, HD/4K streaming, and ad-free experience.</p>

      {user?.subscription === 'premium' && (
        <div className="mb-8 p-4 bg-brand/10 border border-brand/30 rounded-xl text-brand">
          You're already on Premium. Enjoy!
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-6">
        {/* Free */}
        <div className="bg-dark-card border border-gray-700 rounded-2xl p-6">
          <h2 className="text-lg font-bold mb-1">Free</h2>
          <p className="text-3xl font-bold text-white mb-1">$0</p>
          <p className="text-gray-500 text-sm mb-5">Forever</p>
          <ul className="text-sm text-gray-400 space-y-2 mb-6 text-left">
            <li>✓ Access to free episodes</li>
            <li>✓ 480p streaming</li>
            <li>✗ Ads included</li>
            <li>✗ No HD/4K</li>
          </ul>
          <button disabled className="w-full border border-gray-600 text-gray-500 py-2.5 rounded-full text-sm cursor-default">
            Current Plan
          </button>
        </div>

        {/* Monthly */}
        <div className="bg-dark-card border-2 border-brand rounded-2xl p-6 relative">
          <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-brand text-white text-xs px-3 py-1 rounded-full">Popular</span>
          <h2 className="text-lg font-bold mb-1">Monthly</h2>
          <p className="text-3xl font-bold text-white mb-1">$9.99</p>
          <p className="text-gray-500 text-sm mb-5">per month</p>
          <ul className="text-sm text-gray-400 space-y-2 mb-6 text-left">
            <li>✓ All episodes unlocked</li>
            <li>✓ Up to 1080p streaming</li>
            <li>✓ Ad-free</li>
            <li>✓ Download for offline</li>
          </ul>
          <button onClick={() => handleCheckout('monthly')} disabled={loading === 'monthly' || user?.subscription === 'premium'}
            className="w-full bg-brand hover:bg-brand-dark text-white py-2.5 rounded-full text-sm font-medium transition disabled:opacity-60">
            {loading === 'monthly' ? 'Loading...' : 'Get Monthly'}
          </button>
        </div>

        {/* Yearly */}
        <div className="bg-dark-card border border-gray-700 rounded-2xl p-6">
          <h2 className="text-lg font-bold mb-1">Yearly</h2>
          <p className="text-3xl font-bold text-white mb-1">$79.99</p>
          <p className="text-gray-500 text-sm mb-5">per year — save 33%</p>
          <ul className="text-sm text-gray-400 space-y-2 mb-6 text-left">
            <li>✓ All episodes unlocked</li>
            <li>✓ Up to 4K streaming</li>
            <li>✓ Ad-free</li>
            <li>✓ Priority support</li>
          </ul>
          <button onClick={() => handleCheckout('yearly')} disabled={loading === 'yearly' || user?.subscription === 'premium'}
            className="w-full border border-brand text-brand hover:bg-brand hover:text-white py-2.5 rounded-full text-sm font-medium transition disabled:opacity-60">
            {loading === 'yearly' ? 'Loading...' : 'Get Yearly'}
          </button>
        </div>
      </div>
    </div>
  );
}
