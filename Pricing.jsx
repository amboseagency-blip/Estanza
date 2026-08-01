import React, { useEffect, useState } from 'react';
import { Check } from 'lucide-react';
import { detectRegionPricing, formatPrice } from './pricing';
import { useAuth } from './AuthContext';

// STEP: replace with your real Paddle Price IDs (same 4 you used in n8n)
const PRICE_IDS = {
  growth: {
    monthly: 'pri_REPLACE_GROWTH_MONTHLY',
    annual: 'pri_REPLACE_GROWTH_ANNUAL',
  },
  unlimited: {
    monthly: 'pri_REPLACE_UNLIMITED_MONTHLY',
    annual: 'pri_REPLACE_UNLIMITED_ANNUAL',
  },
};

// STEP: replace with your Paddle client-side token (Developer Tools > Authentication)
const PADDLE_CLIENT_TOKEN = 'REPLACE_WITH_PADDLE_CLIENT_TOKEN';

// Set to 'production' once you move off Paddle sandbox testing.
const PADDLE_ENV = 'sandbox';

function loadPaddleScript() {
  return new Promise((resolve, reject) => {
    if (window.Paddle) {
      resolve(window.Paddle);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://cdn.paddle.com/paddle/v2/paddle.js';
    script.onload = () => resolve(window.Paddle);
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

export default function Pricing() {
  const [billing, setBilling] = useState('monthly');
  const [region, setRegion] = useState(null);
  const [paddleReady, setPaddleReady] = useState(false);
  const { session, profile } = useAuth();

  useEffect(() => {
    detectRegionPricing().then(setRegion);
  }, []);

  useEffect(() => {
    loadPaddleScript()
      .then((Paddle) => {
        Paddle.Environment.set(PADDLE_ENV);
        Paddle.Initialize({ token: PADDLE_CLIENT_TOKEN });
        setPaddleReady(true);
      })
      .catch(() => setPaddleReady(false));
  }, []);

  function openCheckout(planKey) {
    if (!session) {
      window.location.href = '/auth';
      return;
    }
    if (!paddleReady || !window.Paddle) {
      alert('Checkout is still loading — please try again in a moment.');
      return;
    }
    const priceId = PRICE_IDS[planKey][billing];
    window.Paddle.Checkout.open({
      items: [{ priceId: priceId, quantity: 1 }],
      customer: session.user.email ? { email: session.user.email } : undefined,
      customData: { broker_id: profile ? profile.id : null },
    });
  }

  const factor = billing === 'annual' ? 0.8 : 1;
  const growth = region ? Math.round(region.growth * factor) : null;
  const unlimited = region ? Math.round(region.unlimited * factor) : null;

  const plans = [
    {
      key: 'free',
      name: 'Free',
      price: 0,
      desc: '1 property',
      features: ['1 active listing', 'Estanza branding on link', 'WhatsApp CTA'],
    },
    {
      key: 'growth',
      name: 'Growth',
      price: growth,
      desc: 'Up to 50 properties',
      features: ['50 active listings', 'Remove branding', 'Priority support'],
      highlight: true,
    },
    {
      key: 'unlimited',
      name: 'Unlimited',
      price: unlimited,
      desc: 'Unlimited properties',
      features: ['Unlimited listings', 'Team seats', 'Priority support'],
    },
  ];

  const currentPlan = profile && profile.plan ? profile.plan : 'free';

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <h2 className="font-display text-3xl text-center mb-2">Simple pricing</h2>
      <p className="text-sm text-center mb-6" style={{ color: 'var(--text-muted)' }}>
        {region ? `Prices shown in ${region.currency}` : 'Detecting your region…'}
      </p>

      <div className="flex justify-center mb-8">
        <div className="rounded-full p-1 border flex" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
          {['monthly', 'annual'].map((b) => (
            <button
              key={b}
              onClick={() => setBilling(b)}
              className="rounded-full px-4 py-1.5 text-sm"
              style={{
                background: billing === b ? 'var(--text)' : 'transparent',
                color: billing === b ? 'var(--bg)' : 'var(--text)',
              }}
            >
              {b === 'monthly' ? 'Monthly' : 'Annual · save 20%'}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))' }}>
        {plans.map((p) => (
          <div
            key={p.name}
            className="rounded-2xl p-5 border"
            style={{ background: 'var(--surface)', borderColor: p.highlight ? 'var(--silver2)' : 'var(--border)' }}
          >
            <p className="font-semibold mb-1">{p.name}</p>
            <p className="text-xs mb-3.5" style={{ color: 'var(--text-muted)' }}>{p.desc}</p>
            <p className="text-3xl font-bold mb-4">
              {p.price === 0 ? 'Free' : region ? formatPrice(p.price, region.currency) : '—'}
              {p.price > 0 && <span className="text-sm font-normal" style={{ color: 'var(--text-muted)' }}>/mo</span>}
            </p>
            {p.features.map((f) => (
              <div key={f} className="flex items-center gap-2 mb-2 text-sm">
                <Check size={13} style={{ color: 'var(--silver2)' }} /> {f}
              </div>
            ))}

            <div className="mt-4">
              {p.key === 'free' ? (
                currentPlan === 'free' && session ? (
                  <div className="text-center text-xs py-2.5 rounded-lg border" style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
                    Current plan
                  </div>
                ) : !session ? (
                  <a
                    href="/auth"
                    className="block text-center text-sm font-semibold py-2.5 rounded-lg"
                    style={{ background: 'linear-gradient(135deg,#e8eaed,#b8bcc2)', color: '#0a0a0c' }}
                  >
                    Get started free
                  </a>
                ) : null
              ) : currentPlan === p.key ? (
                <div className="text-center text-xs py-2.5 rounded-lg border" style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
                  Current plan
                </div>
              ) : (
                <button
                  onClick={() => openCheckout(p.key)}
                  className="w-full text-sm font-semibold py-2.5 rounded-lg"
                  style={{ background: 'linear-gradient(135deg,#e8eaed,#b8bcc2)', color: '#0a0a0c' }}
                >
                  {session ? 'Upgrade' : 'Sign in to upgrade'}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
