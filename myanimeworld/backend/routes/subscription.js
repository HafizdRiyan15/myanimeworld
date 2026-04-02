const express = require('express');
const { users } = require('../data/mockData');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// Stripe is optional — gracefully handle missing key
let stripe;
try {
  if (process.env.STRIPE_SECRET_KEY) {
    stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
  }
} catch {}

const PLANS = {
  monthly: { price: 999, label: 'Monthly Premium', interval: 'month' },
  yearly: { price: 7999, label: 'Yearly Premium', interval: 'year' },
};

// GET /api/subscription/plans
router.get('/plans', (req, res) => res.json(PLANS));

// POST /api/subscription/checkout — create Stripe checkout session
router.post('/checkout', authenticate, async (req, res) => {
  const { plan } = req.body;
  if (!PLANS[plan]) return res.status(400).json({ error: 'Invalid plan' });

  if (!stripe) {
    // Mock response when Stripe is not configured
    return res.json({
      mock: true,
      message: 'Stripe not configured. In production, this returns a checkout URL.',
      plan: PLANS[plan],
    });
  }

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: { name: PLANS[plan].label },
          unit_amount: PLANS[plan].price,
          recurring: { interval: PLANS[plan].interval },
        },
        quantity: 1,
      }],
      mode: 'subscription',
      success_url: `${process.env.FRONTEND_URL}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/subscription`,
      metadata: { userId: req.user.id },
    });
    res.json({ url: session.url });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/subscription/webhook — Stripe webhook
router.post('/webhook', express.raw({ type: 'application/json' }), (req, res) => {
  if (!stripe) return res.json({ received: true });

  const sig = req.headers['stripe-signature'];
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const user = users.find((u) => u.id === session.metadata.userId);
    if (user) user.subscription = 'premium';
  }

  res.json({ received: true });
});

// POST /api/subscription/cancel — mock cancel
router.post('/cancel', authenticate, (req, res) => {
  const user = users.find((u) => u.id === req.user.id);
  user.subscription = 'free';
  res.json({ message: 'Subscription cancelled', subscription: 'free' });
});

module.exports = router;
