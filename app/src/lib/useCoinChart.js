// Real CoinGecko price history for the detail chart. The product names are
// coin symbols, mapped to CoinGecko ids; unknown symbols keep the static chart.
import { useEffect, useState } from 'react';

// symbol -> CoinGecko coin id, one entry per coin the catalogue lists
const COIN_IDS = {
  USDT: 'tether',
  USDC: 'usd-coin',
  BTC: 'bitcoin',
  ETH: 'ethereum',
  BNB: 'binancecoin',
  SOL: 'solana',
  ADA: 'cardano',
  DOT: 'polkadot',
  AVAX: 'avalanche-2',
  ATOM: 'cosmos',
  DOGE: 'dogecoin',
  SHIB: 'shiba-inu',
  PEPE: 'pepe',
  FLOKI: 'floki',
  BONK: 'bonk',
  XRP: 'ripple',
  TRX: 'tron',
  LTC: 'litecoin',
  LINK: 'chainlink',
  SUI: 'sui',
  TON: 'the-open-network',
  APT: 'aptos',
  NEAR: 'near',
  INJ: 'injective-protocol',
  SEI: 'sei-network',
  TIA: 'celestia',
  POL: 'polygon-ecosystem-token',
  ARB: 'arbitrum',
  OP: 'optimism',
  UNI: 'uniswap',
};

// one entry per coin+range, so switching pills never refetches what it has seen
const cache = new Map();
const pending = new Map();

const read = (body) => {
  const rows = Array.isArray(body?.prices) ? body.prices : [];
  return rows
    .filter((row) => Array.isArray(row) && Number.isFinite(row[1]))
    .map(([time, value]) => ({ t: Number(time), v: Number(value) }));
};

export const coinIdFor = (name) => {
  const symbol = String(name || '')
    .trim()
    .toUpperCase()
    .split(/\s+/)[0];
  return COIN_IDS[symbol] || null;
};

export function useCoinChart(name, days) {
  const coinId = coinIdFor(name);
  const key = coinId ? `${coinId}:${days}` : '';
  const [state, setState] = useState(() => {
    if (!key) return { status: 'unsupported', points: [] };
    if (cache.has(key)) return cache.get(key);
    return { status: 'loading', points: [] };
  });

  useEffect(() => {
    if (!key || cache.has(key)) return undefined;
    if (pending.has(key)) {
      pending.get(key).then((next) => setState(next));
      return undefined;
    }
    const promise = fetch(`/cg/coins/${coinId}/market_chart?vs_currency=idr&days=${days}`)
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error(`HTTP ${res.status}`))))
      .then((body) => {
        const points = read(body);
        // a transient failure is not cached, so a later visit retries
        const next =
          points.length > 0 ? { status: 'ready', points } : { status: 'empty', points: [] };
        cache.set(key, next);
        return next;
      })
      .catch(() => ({ status: 'error', points: [] }))
      .finally(() => {
        pending.delete(key);
      });
    pending.set(key, promise);
    promise.then((next) => setState(next));
    return undefined;
  }, [key, coinId, days]);

  return state;
}
