// The notification list is derived from the ledger: deposits, withdrawals and
// manual credits are the three events the frame draws. Which rows the user has
// already opened is kept in localStorage, so the red dots survive a reload.
import { useCallback, useEffect, useRef, useState } from 'react';
import { api } from './api.js';

const READ_KEY = 'pscryp.notif.read';
const SOURCES = ['DEPOSIT', 'WITHDRAW', 'CREDIT'];
const LIMIT = 30;

const storedReadIds = () => {
  try {
    const parsed = JSON.parse(localStorage.getItem(READ_KEY) || '[]');
    return new Set(Array.isArray(parsed) ? parsed.map(String) : []);
  } catch {
    return new Set();
  }
};

// the endpoint paginates; the latest page of each type is enough for a feed
const rowsOf = (res) => {
  if (!res.ok) return [];
  if (Array.isArray(res.data?.results)) return res.data.results;
  return Array.isArray(res.data) ? res.data : [];
};

export function useNotifications() {
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState('loading');
  const [read, setRead] = useState(storedReadIds);
  // every click on a row also navigates away, so the set is mirrored in a ref
  const readRef = useRef(read);

  useEffect(() => {
    let alive = true;

    Promise.all(SOURCES.map((type) => api.transactions({ type })))
      .then((responses) => {
        if (!alive) return;
        // every source failing means the feed itself is broken; a single empty
        // type is normal
        if (!responses.some((res) => res.ok)) {
          setStatus('error');
          return;
        }
        const merged = responses
          .flatMap(rowsOf)
          .sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)))
          .slice(0, LIMIT);
        setItems(merged);
        setStatus('ready');
      })
      .catch(() => {
        if (alive) setStatus('error');
      });

    return () => {
      alive = false;
    };
  }, []);

  const markRead = useCallback((id) => {
    const key = String(id);
    const current = readRef.current;
    if (current.has(key)) return;
    const next = new Set(current).add(key);
    readRef.current = next;
    // the row's route change unmounts the list in the same click, so a state
    // updater queued behind it would never reach localStorage
    localStorage.setItem(READ_KEY, JSON.stringify([...next].slice(-300)));
    setRead(next);
  }, []);

  const isUnread = (id) => !read.has(String(id));
  const unreadCount = items.filter((row) => !read.has(String(row.id))).length;

  return { items, status, unreadCount, isUnread, markRead };
}
