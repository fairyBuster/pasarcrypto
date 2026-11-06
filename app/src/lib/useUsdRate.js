// The API quotes the secondary currency against the main one:
//   GET /api/auth/settings/currency/?code=USD
//   { "rate_to_main": "18181.818182" }   ->   1 USD = Rp18.181,818182
// The endpoint answers without a session, so send() is used and a stale token
// cannot turn the quote into a 401. The last quote survives a reload and is
// refreshed once it is older than ten minutes.
import { useEffect, useState } from 'react';
import { api } from './api.js';

const CACHE_KEY = 'pscryp.rate.USD';
const RATE_TTL = 10 * 60 * 1000;

const readCache = () => {
  try {
    const saved = JSON.parse(localStorage.getItem(CACHE_KEY) || 'null');
    return { rate: Number(saved?.rate) || 0, at: Number(saved?.at) || 0 };
  } catch {
    // a corrupt or blocked storage only costs the instant paint
    return { rate: 0, at: 0 };
  }
};

const stored = readCache();
let rateValue = stored.rate;
let rateAt = stored.at;
let pending = null;

export const loadUsdRate = () => {
  if (rateValue > 0 && Date.now() - rateAt < RATE_TTL) return Promise.resolve(rateValue);
  if (pending) return pending;
  pending = api
    .currencySettings('USD')
    .then((res) => {
      const rate = Number(res.ok ? res.data?.rate_to_main : 0);
      if (rate > 0) {
        rateValue = rate;
        rateAt = Date.now();
        try {
          localStorage.setItem(CACHE_KEY, JSON.stringify({ rate, at: rateAt }));
        } catch {
          // keep the in-memory quote when storage refuses the write
        }
      }
      return rateValue;
    })
    .catch(() => rateValue)
    .finally(() => {
      pending = null;
    });
  return pending;
};

// IDR per USD, 0 until the first quote arrives
export function useUsdRate() {
  const [rate, setRate] = useState(rateValue);
  useEffect(() => {
    let alive = true;
    loadUsdRate().then((value) => {
      if (alive && value > 0) setRate(value);
    });
    return () => {
      alive = false;
    };
  }, []);
  return rate;
}
