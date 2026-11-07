// Fear & Greed has no Django endpoint, so the screen reads the public
// alternative.me series through the dev/preview proxy (see vite.config.js):
// the browser still talks to a single origin, exactly like /api.
import { useEffect, useState } from 'react';

// one request covers the chart's 7D/30D/1Y pills and the three stat blocks;
// the Android bundle has no proxy, so VITE_FNG_BASE points it at the public feed
const ENDPOINT = `${import.meta.env.VITE_FNG_BASE || '/fng'}/?limit=366&format=json`;

// the API speaks the five English buckets; the UI prints them in Indonesian
const LABELS = {
  'Extreme Fear': 'Ketakutan Ekstrem',
  Fear: 'Ketakutan',
  Neutral: 'Netral',
  Greed: 'Keserakahan',
  'Extreme Greed': 'Keserakahan Ekstrem',
};

const COLORS = {
  'Extreme Fear': '#f2667a',
  Fear: '#f29a6a',
  Neutral: '#e9c46a',
  Greed: '#9bd36e',
  'Extreme Greed': '#3ecf8e',
};

export const fearGreedLabel = (row) => LABELS[row?.label] || 'Netral';
export const fearGreedColor = (row) => COLORS[row?.label] || '#e9c46a';

const read = (body) => {
  const rows = Array.isArray(body?.data)
    ? body.data.map((row) => ({
        value: Number(row.value) || 0,
        label: row.value_classification || 'Neutral',
        at: (Number(row.timestamp) || 0) * 1000,
      }))
    : [];
  if (rows.length < 2) return null;
  return {
    now: rows[0],
    yesterday: rows[1] || null,
    week: rows[7] || null,
    month: rows[30] || null,
    // oldest first, so the chart reads left to right
    series: rows.slice().reverse(),
  };
};

// one request per page load feeds both the home widget and the detail screen
let cache = null;
let pending = null;

const load = () => {
  if (cache) return Promise.resolve(cache);
  if (!pending) {
    pending = fetch(ENDPOINT)
      .then((res) => (res.ok ? res.json() : null))
      .then((body) => {
        const data = read(body);
        if (data) cache = { status: 'ready', data };
        return cache || { status: 'error', data: null };
      })
      .catch(() => ({ status: 'error', data: null }))
      .finally(() => {
        pending = null;
      });
  }
  return pending;
};

export function useFearGreed() {
  const [state, setState] = useState(cache || { status: 'loading', data: null });

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
