// Daily price history for one product's chart, straight from the backend:
//   GET /api/products/{id}/chart/?days=7     (bearer session)
// -> { product_id, symbol, days, source, usd_idr_rate,
//      series: [{ day, price_usd, price_idr }] }
// `series` carries days + 1 daily points with today included, so the last point
// is the current quote. The backend already resolves the coin and the quote
// currency, which is why the market screens no longer hit a price feed directly.
import { useEffect, useState } from 'react';
import { api } from './api.js';

// Folding every series into its own min/max made all the charts look alike: each
// coin filled the full height no matter how little it moved, and a pegged
// stablecoin was blown up into the same noise as bitcoin. Charting percent change
// against the window's first price keeps the shapes honest, and the shared 10%
// scale makes the cards comparable: a stablecoin draws a nearly flat line while a
// volatile coin fills the box. Only a coin moving past 10% stretches its own
// scale further, so nothing is clipped.
const CHANGE_FLOOR = 10; // percent
const MAX_POINTS = 120;

export const chartGeometry = (points, width, height) => {
  if (!Array.isArray(points) || points.length < 2) return null;
  const base = Number(points[0].v);
  if (!(base > 0)) return null;

  // the series arrive daily; evenly spaced samples keep the polyline readable
  const stride = Math.max(1, Math.ceil(points.length / MAX_POINTS));
  const sampled = points.filter((_, index) => index % stride === 0 || index === points.length - 1);
  if (sampled.length < 2) return null;

  const changes = sampled.map((point) => ((Number(point.v) - base) / base) * 100);
  const amplitude = Math.max(CHANGE_FLOOR, ...changes.map(Math.abs));
  const center = height / 2;
  const step = width / (changes.length - 1);
  const coords = changes.map((change, index) => ({
    x: +(index * step).toFixed(2),
    y: +(center - (change / amplitude) * (center - 4)).toFixed(2),
  }));
  const line = coords.map((coord) => `${coord.x},${coord.y}`).join(' ');
  // the fill hangs from the zero line, not from the bottom of the box
  const area = `0,${center} ${line} ${width},${center}`;
  const last = coords[coords.length - 1];
  const change = changes[changes.length - 1];
  return { line, area, last, change, up: change >= 0, center };
};

// one series per product per session; the backend reads today's quote, so five
// minutes is fresh enough and keeps a card that scrolls in and out from asking
// again
const CHART_TTL = 5 * 60 * 1000;
const CHART_RETRY_MS = 2000;
// after a failure the card waits before asking again instead of hammering the
// endpoint while the backend is down
const CHART_COOLDOWN_MS = 20000;
const CHART_TRIES = 3;

const chartCache = new Map(); // "id:days" -> { at, points }
const chartPending = new Map(); // "id:days" -> Promise

const fetchChart = async (id, days) => {
  const res = await api.productChart(id, days);
  const series = res.ok && Array.isArray(res.data?.series) ? res.data.series : [];
  const points = series
    .map((row) => ({ t: Date.parse(row?.day), v: Number(row?.price_idr) }))
    .filter((point) => Number.isFinite(point.v) && point.v > 0);
  return points.length > 1 ? points : null;
};

// the shared loader: a second card for the same product awaits the same request
export const loadProductChart = (id, days = 7) => {
  const key = `${id}:${days}`;
  const saved = chartCache.get(key);
  if (saved && Date.now() - saved.at < CHART_TTL) return Promise.resolve(saved.points);
  if (chartPending.has(key)) return chartPending.get(key);
  const task = fetchChart(id, days)
    .then((points) => {
      chartPending.delete(key);
      if (points) chartCache.set(key, { at: Date.now(), points });
      return points;
    })
    .catch(() => {
      chartPending.delete(key);
      return null;
    });
  chartPending.set(key, task);
  return task;
};

// { status, points } for one product; unsupported when there is no id yet
// a failed series is retried a few times while the card stays mounted, so the
// cards recover on their own instead of keeping the placeholder until reload
export function useProductChart(productId, days = 7) {
  const id = Number(productId) || 0;
  const key = id ? `${id}:${days}` : '';
  const [state, setState] = useState(() => {
    if (!id) return { status: 'unsupported', points: [] };
    const cached = chartCache.get(key);
    if (cached) return { status: 'ready', points: cached.points };
    return { status: 'loading', points: [] };
  });

  useEffect(() => {
    if (!id) return undefined;
    const cached = chartCache.get(key);
    if (cached) {
      setState({ status: 'ready', points: cached.points });
      return undefined;
    }
    let alive = true;
    let timer = null;
    let tries = 0;
    const run = () => {
      tries += 1;
      setState({ status: 'loading', points: [] });
      loadProductChart(id, days).then((points) => {
        if (!alive) return;
        if (points) {
          setState({ status: 'ready', points });
          return;
        }
        setState({ status: 'empty', points: [] });
        if (tries < CHART_TRIES) {
          timer = window.setTimeout(run, CHART_COOLDOWN_MS + CHART_RETRY_MS);
        }
      });
    };
    run();
    return () => {
      alive = false;
      if (timer) window.clearTimeout(timer);
    };
  }, [id, days, key]);

  return state;
}
