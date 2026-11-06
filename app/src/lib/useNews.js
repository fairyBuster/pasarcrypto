// The landing page's education grid reads the published news feed the Django
// API exposes at /api/news/ (public, paginated).
import { useEffect, useState } from 'react';
import { api } from './api.js';

// the API serves images under /media/news/; older responses to missing files
// were cacheable for a year, so the URL carries a version tag that changes
// whenever the record does and keeps browsers off that stale entry
const withImageVersion = (row) => {
  if (!row || !row.image) return row;
  const version = encodeURIComponent(row.updated_at || row.id || '1');
  const glue = row.image.includes('?') ? '&' : '?';
  return { ...row, image: `${row.image}${glue}v=${version}` };
};

const read = (data) => {
  const rows = Array.isArray(data) ? data : data?.results || [];
  return rows.filter((row) => row.is_published !== false).map(withImageVersion);
};

// one request per page load feeds the featured card and the list below it
let cache = null;
let pending = null;

const load = () => {
  if (cache) return Promise.resolve(cache);
  if (!pending) {
    pending = api
      .news()
      .then((res) => {
        if (res.ok) cache = read(res.data);
        return cache;
      })
      .catch(() => null)
      .finally(() => {
        pending = null;
      });
  }
  return pending;
};

export function useNews() {
  const [rows, setRows] = useState(cache || []);

  useEffect(() => {
    let alive = true;
    load().then((next) => {
      if (alive && next) setRows(next);
    });
    return () => {
      alive = false;
    };
  }, []);

  return rows;
}

// detail rows are kept by id so re-opening an article costs nothing
const items = new Map();

export function useNewsItem(id) {
  const key = id ? String(id) : '';
  const [state, setState] = useState(() =>
    key && items.has(key)
      ? { item: items.get(key), status: 'ready' }
      : { item: null, status: key ? 'loading' : 'idle' }
  );

  useEffect(() => {
    const nextKey = id ? String(id) : '';
    if (!nextKey) {
      setState({ item: null, status: 'idle' });
      return undefined;
    }
    if (items.has(nextKey)) {
      setState({ item: items.get(nextKey), status: 'ready' });
      return undefined;
    }

    let alive = true;
    setState({ item: null, status: 'loading' });
    api
      .newsDetail(nextKey)
      .then((res) => {
        if (!alive) return;
        if (res.ok && res.data && res.data.id) {
          const item = withImageVersion(res.data);
          items.set(nextKey, item);
          setState({ item, status: 'ready' });
          return;
        }
        setState({ item: null, status: 'error' });
      })
      .catch(() => {
        if (alive) setState({ item: null, status: 'error' });
      });
    return () => {
      alive = false;
    };
  }, [id]);

  return state;
}
