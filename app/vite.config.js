import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// extra hosts (tunnels / staging domains) can be added without touching this file:
// VITE_ALLOWED_HOSTS="foo.example.com,bar.example.com" npm run dev
const extraHosts = (process.env.VITE_ALLOWED_HOSTS || '')
  .split(',')
  .map((h) => h.trim())
  .filter(Boolean);

// Django stays bound to loopback; the dev server is the only thing the browser
// talks to, which removes CORS and makes the app work from any host or device.
const apiProxy = {
  '/api': {
    target: process.env.VITE_API_PROXY || 'http://127.0.0.1:8000',
    changeOrigin: true,
  },
  // uploads (news thumbnails, avatars) live on the Django host as well
  '/media': {
    target: process.env.VITE_API_PROXY || 'http://127.0.0.1:8000',
    changeOrigin: true,
  },
};

// the Fear & Greed index lives outside Django; proxying it keeps the browser on
// one origin and sidesteps the third-party CORS policy
const fngProxy = {
  '/fng': {
    target: process.env.VITE_FNG_PROXY || 'https://api.alternative.me',
    changeOrigin: true,
  },
};

const proxy = { ...apiProxy, ...fngProxy };

// CoinGecko feeds the "Sorotan Pasar" tiles; public, but still proxied so the
// browser keeps talking to a single origin
const cgProxy = {
  '/cg': {
    target: process.env.VITE_CG_PROXY || 'https://api.coingecko.com/api/v3',
    changeOrigin: true,
    // the prefix only exists to keep the browser on one origin
    rewrite: (path) => path.replace(/^\/cg/, ''),
  },
};

// the address form reads the free wilayah.id dataset (38 provinces down to
// villages); proxied for the same single-origin reason as the feeds above
const wilayahProxy = {
  '/wilayah': {
    target: process.env.VITE_WILAYAH_PROXY || 'https://wilayah.id/api',
    changeOrigin: true,
    rewrite: (path) => path.replace(/^\/wilayah/, ''),
  },
};

const allProxy = { ...proxy, ...cgProxy, ...wilayahProxy };

export default defineConfig(({ mode }) => ({
  plugins: [react()],
  // the Capacitor WebView loads the bundle from its local server, so the
  // android build keeps relative paths. The web build is served at the origin
  // root: a deep link such as /ref/CODE gets the shell at that path, and a
  // relative ref would resolve to /ref/assets/... (404) instead of /assets/...
  base: mode === 'android' ? './' : '/',
  server: {
    port: 5174,
    strictPort: true,
    host: true,
    // a leading dot also allows every subdomain of that domain
    allowedHosts: ['localhost', '127.0.0.1', '.scagerwebsite.uk', ...extraHosts],
    proxy: allProxy,
  },
  // same guard applies to `vite preview` behind the proxy
  preview: {
    host: true,
    allowedHosts: ['localhost', '127.0.0.1', '.scagerwebsite.uk', ...extraHosts],
    proxy: allProxy,
  },
}));
