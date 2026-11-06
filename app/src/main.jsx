import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import App, { AppBoundary } from './App.jsx';
import { AuthProvider } from './lib/auth.jsx';
import { loadFrontendUrl } from './lib/referral.js';
import './styles/base.css';

// the invite host comes from a public settings call; warming it here means the
// referral rows already carry the reported domain by the time they open
loadFrontendUrl();

// A deploy replaces every hashed chunk, so a tab left open across it asks for a
// file that no longer exists the moment another screen is opened. Vite reports
// the failed dynamic import; one navigation to a fresh index picks up the new
// chunk names. The query string also sidesteps a CDN that cached the old HTML,
// and the timestamp keeps a genuinely broken chunk from reloading in a loop.
const RELOAD_KEY = 'pscryp.chunkReloadAt';
const RELOAD_GUARD_MS = 10000;
const reloadForFreshChunks = () => {
  let last = 0;
  try {
    last = Number(sessionStorage.getItem(RELOAD_KEY)) || 0;
  } catch {
    /* storage disabled */
  }
  if (Date.now() - last < RELOAD_GUARD_MS) return;
  try {
    sessionStorage.setItem(RELOAD_KEY, String(Date.now()));
  } catch {
    /* storage disabled */
  }
  const url = new URL(window.location.href);
  url.searchParams.set('fresh', String(Date.now()));
  window.location.replace(url.toString());
};
window.addEventListener('vite:preloadError', () => {
  // the reload picks up the new chunk names; the route boundary still catches
  // the failed import when the guard skips the reload, so a broken screen is
  // never left as an empty Suspense
  reloadForFreshChunks();
});

// the fresh= marker only exists to defeat a cached index; keep the address clean
const bootUrl = new URL(window.location.href);
if (bootUrl.searchParams.has('fresh')) {
  bootUrl.searchParams.delete('fresh');
  window.history.replaceState(null, '', `${bootUrl.pathname}${bootUrl.search}${bootUrl.hash}`);
}

// The app is hash-routed (/#/aset), so the server only ever sees "/" and every
// screen keeps working without a SPA rewrite. Absolute links that were already
// shared (/pasar, /landing/berita/86) are migrated in place before the router
// reads the URL, so old bookmarks still land on the right screen.
const { pathname, search, hash } = window.location;
if (!hash && pathname !== '/') {
  window.history.replaceState(null, '', `/#${pathname}${search}`);
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* shell-level guard: a crash below must still leave a reload path */}
    <AppBoundary>
      <HashRouter>
        <AuthProvider>
          <App />
        </AuthProvider>
      </HashRouter>
    </AppBoundary>
  </StrictMode>
);

// tells the watchdog in index.html that this build's entry actually loaded
window.__pscrypBoot = true;
