// The landing ticker needs live IDR quotes and the Django API has no market
// endpoint, so it reads CoinGecko's markets feed through the same-origin proxy
// (see vite.config.js), just like "Sorotan Pasar".
import { useEffect, useState } from 'react';
import { idr } from './format.js';

const ENDPOINT =
  '/cg/coins/markets?vs_currency=idr&ids=bitcoin,ethereum,solana&price_change_percentage=24h';

// the frame's figures: shown until the feed answers and kept if it never does,
// so the strip is never empty
const FALLBACK = [
  { symbol: 'BTC', price: '1.082.450.000 IDR' },
  { symbol: 'ETH', price: '42.315.000 IDR' },
  { symbol: 'SOL', price: '2.410.500 IDR' },
];

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
    if (Number.isFinite(price) && price > 0) return { symbol, price: `${idr(price)} IDR` };
    return FALLBACK.find((item) => item.symbol === symbol);
  });
};

// one request per page load feeds the whole strip
let cache = null;
let pending = null;

const load = () => {
  if (cache) return Promise.resolve(cache);
  if (!pending) {
    pending = fetch(ENDPOINT)
      .then((res) => (res.ok ? res.json() : null))
      .then((body) => {
        cache = read(body);
        return cache;
      })
      .catch(() => FALLBACK)
      .finally(() => {
        pending = null;
      });
  }
  return pending;
};

export function useMarketTicker() {
  const [rows, setRows] = useState(cache || FALLBACK);

  useEffect(() => {
    let alive = true;
    load().then((next) => {
      if (alive) setRows(next);
    });
    return () => {
      alive = false;
    };
  }, []);

  return rows;
}
