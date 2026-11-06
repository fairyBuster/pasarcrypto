// The ledger screens paint the rows they saw last while the API call refreshes
// them, so a history tab never starts on an empty frame. One blob per screen
// lives in localStorage and is replaced on every successful load; the blobs are
// dropped when the session ends, so a different account never inherits rows that
// belong to someone else.
const PREFIX = 'pscryp.history.';
const VERSION = 1;

// { rows, savedAt, ...extras } or null when this screen has nothing stored yet
export const readHistory = (screen) => {
  try {
    const raw = localStorage.getItem(PREFIX + screen);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || parsed.v !== VERSION || !Array.isArray(parsed.rows)) return null;
    return parsed;
  } catch {
    return null;
  }
};

export const writeHistory = (screen, payload) => {
  try {
    localStorage.setItem(PREFIX + screen, JSON.stringify({ v: VERSION, savedAt: Date.now(), ...payload }));
  } catch {
    // storage may be full or blocked — the screen still holds the rows in state
  }
};

export const clearHistoryCache = () => {
  try {
    const keys = [];
    for (let i = 0; i < localStorage.length; i += 1) {
      const key = localStorage.key(i);
      if (key && key.startsWith(PREFIX)) keys.push(key);
    }
    keys.forEach((key) => localStorage.removeItem(key));
  } catch {
    // nothing to clear when storage is unavailable
  }
};
