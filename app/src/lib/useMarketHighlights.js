// "Sorotan Pasar" shows live crypto-category performance and the Django API has
// no market endpoint, so the tiles read the public CoinGecko categories feed
// through the same-origin proxy (see vite.config.js).
import { useEffect, useState } from 'react';

const ENDPOINT = '/cg/coins/categories';
// the edge CDN can answer /cg from its own copy, and a blocked or broken entry
// leaves every tile blank; the build also ships a trimmed snapshot so the tiles
// always have figures to draw
const SNAPSHOT = '/market-categories.json';

// the five tiles the frame lays out; the first id is the design's category and
// the next one is a live stand-in for categories CoinGecko leaves empty
const TILES = [
  { fallback: 'Layer 1', ids: ['layer-1'] },
  { fallback: 'SOL Eco', ids: ['solana-ecosystem', 'solana-meme-coins'] },
  { fallback: 'Meme', ids: ['meme-token'] },
  { fallback: 'DeFi', ids: ['decentralized-finance-defi'] },
  { fallback: 'AI', ids: ['artificial-intelligence'] },
];

// the tiles are narrow, so the long category names are shortened
const SHORT = {
  'layer-1': 'Layer 1',
  'solana-ecosystem': 'SOL Eco',
  'solana-meme-coins': 'SOL Meme',
  'meme-token': 'Meme',
  'decentralized-finance-defi': 'DeFi',
  'artificial-intelligence': 'AI',
};

const changeOf = (row) => {
  const value = Number(row?.market_cap_change_24h);
  return row?.market_cap_change_24h != null && Number.isFinite(value) ? value : null;
};

// the labels stay on screen even when the request fails; only the numbers blank
const read = (body) => {
  const rows = Array.isArray(body) ? body : [];
  const byId = new Map(rows.map((row) => [row.id, row]));
  return TILES.map((tile) => {
    const row = tile.ids
      .map((id) => byId.get(id))
      .find((item) => item && item.market_cap_change_24h != null && Number(item.market_cap) > 0);
    const id = row?.id || tile.ids[0];
    return {
      id,
      name: SHORT[id] || row?.name || tile.fallback,
      change: changeOf(row),
      cap: Number(row?.market_cap) || 0,
      icons: Array.isArray(row?.top_3_coins) ? row.top_3_coins.filter(Boolean) : [],
    };
  });
};

// one request per page load feeds every tile
let cache = null;
let pending = null;

// the CDN honours the upstream max-age, so a stale entry is asked around with a
// one-minute key; the browser cache is skipped so a reload really re-reads it
const fetchJson = async (url) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);
  try {
    const res = await fetch(url, { signal: controller.signal, cache: 'no-store' });
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
  if (cache) return Promise.resolve(cache);
  if (!pending) {
    pending = (async () => {
      const body =
        (await fetchJson(ENDPOINT)) ||
        (await fetchJson(`${ENDPOINT}?v=${Math.floor(Date.now() / 60000)}`)) ||
        (await fetchJson(SNAPSHOT));
      if (!body) return { status: 'error', rows: read(null) };
      cache = { status: 'ready', rows: read(body) };
      return cache;
    })().finally(() => {
      pending = null;
    });
  }
  return pending;
};

export function useMarketHighlights() {
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
