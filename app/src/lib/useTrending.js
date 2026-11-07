// "Trending" names the two coins the frame drew; CoinGecko supplies the logo
// and the live 24h move through the same-origin proxy (see vite.config.js).
import { useEffect, useState } from 'react';

const ENDPOINT = `${import.meta.env.VITE_CG_BASE || '/cg'}/coins/markets?vs_currency=usd&ids=bitcoin,ethereum&price_change_percentage=24h`;

// the widget keeps its two rows even when the feed is down; only the logo and
// the numbers blank
const FALLBACK = [
  { id: 'bitcoin', symbol: 'BTC', name: 'Bitcoin' },
  { id: 'ethereum', symbol: 'ETH', name: 'Ethereum' },
];

const read = (body) => {
  const rows = Array.isArray(body) ? body : [];
  const byId = new Map(rows.map((row) => [row.id, row]));
  return FALLBACK.map((row) => {
    const live = byId.get(row.id);
    const change = Number(live?.price_change_percentage_24h);
    return {
      id: row.id,
      symbol: live?.symbol ? live.symbol.toUpperCase() : row.symbol,
      name: live?.name || row.name,
      image: typeof live?.image === 'string' ? live.image : '',
      change: live?.price_change_percentage_24h != null && Number.isFinite(change) ? change : null,
    };
  });
};

// one request per page load feeds both rows
let cache = null;
let pending = null;

const load = () => {
  if (cache) return Promise.resolve(cache);
  if (!pending) {
    pending = fetch(ENDPOINT)
      .then((res) => (res.ok ? res.json() : null))
      .then((body) => {
        if (!Array.isArray(body)) return { status: 'error', rows: read(null) };
        cache = { status: 'ready', rows: read(body) };
        return cache;
      })
      .catch(() => ({ status: 'error', rows: read(null) }))
      .finally(() => {
        pending = null;
      });
  }
  return pending;
};

export function useTrending() {
  const [state, setState] = useState(cache || { status: 'loading', rows: read(null) });

  useEffect(() => {
    let alive = true;
    load().then((next) => {
      if (alive) setState(next);
    });
    return () => {
      alive = false;
    };
  }, []);

  return state;
}
