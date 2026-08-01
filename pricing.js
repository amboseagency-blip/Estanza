export const CURRENCIES = {
  INR: { symbol: '₹' },
  USD: { symbol: '$' },
  GBP: { symbol: '£' },
  EUR: { symbol: '€' },
  AED: { symbol: 'AED ' },
};

export function formatPrice(amount, currency = 'INR') {
  const c = CURRENCIES[currency] || CURRENCIES.USD;
  return `${c.symbol}${Number(amount).toLocaleString()}`;
}

// Fixed regional pricing (NOT live currency conversion).
// Add more countries here as you get customers there.
export const REGIONAL_PRICING = {
  IN: { currency: 'INR', growth: 199, unlimited: 799 },
  US: { currency: 'USD', growth: 29, unlimited: 119 },
  GB: { currency: 'GBP', growth: 24, unlimited: 99 },
  AE: { currency: 'AED', growth: 109, unlimited: 449 },
  DEFAULT: { currency: 'USD', growth: 29, unlimited: 119 },
};

// Detects the visitor's country via a free IP geolocation API.
// Falls back to DEFAULT (USD) if detection fails for any reason.
export async function detectRegionPricing() {
  try {
    const res = await fetch('https://ipapi.co/json/');
    if (!res.ok) throw new Error('geo lookup failed');
    const data = await res.json();
    const code = data.country_code;
    return REGIONAL_PRICING[code] || REGIONAL_PRICING.DEFAULT;
  } catch {
    return REGIONAL_PRICING.DEFAULT;
  }
}
