// The landing ticker needs live IDR quotes and the Django API has no market
// endpoint, so it reads CoinGecko's markets feed through the same-origin proxy
// (see vite.config.js), just like "Sorotan Pasar".
import { useEffect, useState } from 'react';
import { idr } from './format.js';

const ENDPOINT =
  `${import.meta.env.VITE_CG_BASE || '/cg'}/coins/markets?vs_currency=idr&ids=bitcoin,ethereum,solana&price_change_percentage=24h`;

// the frame's figures used to sit here as a hardcoded fallback; a quote is now
// real or an em dash, because a stale rupiah amount reads as a live price
const PLACEHOLDER = '—';
const REFRESH_MS = 60000;

const COINS = [
  ['BTC', 'bitcoin'],
  ['ETH', 'ethereum'],
  ['SOL', 'solana'],
];

const read = (body) => {
  const rows = Array.isArray(body) ? body : [];
  const byId = new Map(rows.map((row) => [row.id, row]));
  return COINS.map(([symbol, id]) => {
    const price = Number(byId.get(id)?.current_price);
    return { symbol, price: Number.isFinite(price) && price > 0 ? `${idr(price)} IDR` : PLACEHOLDER };
  });
};

// the last real answer is reused when a refresh fails; the strip never invents
// a quote, it only repeats one that really came from the feed
let cache = null;
let pending = null;

const fetchRows = async () => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);
  try {
    const res = await fetch(ENDPOINT, { signal: controller.signal, cache: 'no-store' });
    if (!res.ok) return null;
    const body = await res.json();
    return Array.isArray(body) && body.length ? body : null;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
};

const load = () => {
  if (!pending) {
    pending = fetchRows()
      .then((body) => {
        if (!body) return cache || read(null);
        cache = read(body);
        return cache;
      })
      .catch(() => cache || read(null))
      .finally(() => {
        pending = null;
      });
  }
  return pending;
};

export function useMarketTicker() {
  const [rows, setRows] = useState(cache || read(null));

  useEffect(() => {
    let alive = true;
    const tick = () => {
      // a background tab does not poll the feed every minute
      if (document.visibilityState === 'hidden') return;
      load().then((next) => {
        if (alive) setRows(next);
      });
    };
    const onVisible = () => {
      if (document.visibilityState === 'visible') tick();
    };
    tick();
    const id = window.setInterval(tick, REFRESH_MS);
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      alive = false;
      window.clearInterval(id);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, []);

  return rows;
}
