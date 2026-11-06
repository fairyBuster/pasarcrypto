# pasarcrypto

PasarCryptoID — phone-shell prototype (React + Vite, Indonesian UI), backed by a Django/DRF API.

## Production (Docker Compose)

The image builds the SPA with Vite and serves the static bundle from nginx.
Nothing runs in development mode: no Vite dev server, no HMR, no source maps.

```sh
cp .env.example .env          # optional — the defaults already work
docker compose up -d --build
docker compose ps             # web must report (healthy)
docker compose logs -f web
```

The app is then on `http://<host>/` (port 80, override with `WEB_PORT`).
Rebuild after any source or `.env` change: `docker compose up -d --build`.

### Configuration

| Variable | Default | Notes |
| --- | --- | --- |
| `WEB_PORT` | `80` | Published host port. |
| `API_UPSTREAM` | `http://host.docker.internal:8000` | Django/DRF origin behind `/api` and `/media`. No trailing slash. |
| `VITE_API_BASE` | empty | Empty keeps the browser same-origin (nginx proxies). A full URL bypasses the proxy. |
| `VITE_API_SALT` | `KXXADFDFDF` | Must match the backend's response salt. |

`VITE_*` values are inlined by Vite at **build time** — they cannot be changed by
restarting the container.

### How requests are routed

| Path | Handled by |
| --- | --- |
| `/`, `/#/...` (every screen, e.g. `/#/aset`) | `index.html`, never cached |
| old absolute paths from `app/src/screen-map.js` (+ `/landing/berita/:id` and the legacy paths kept in `scripts/gen-nginx-routes.mjs`) | shell, then the client rewrites the URL to `/#/...` |
| anything else (`/.env`, `/wp-admin`, `/pasar/random`, `*.php`, …) | plain `404`, never the SPA shell |
| `/assets/*` | hashed chunks pinned 1 year; `public/` files cached 7 days |
| `/healthz` | container health probe |
| `/api/`, `/media/` | `API_UPSTREAM` (SSE un-buffered, 12 MB uploads) |
| `/media/news/*` (file missing upstream) | local `news-placeholder.svg`, `no-store` |
| `/cg/`, `/fng/`, `/wilayah/` | CoinGecko, alternative.me, wilayah.id |

Routing is hash-based (`HashRouter`), so a deep link only ever asks the server
for `/` and no SPA rewrite is required. Absolute links that were shared before
the switch (`/pasar`, `/landing/berita/86`) are migrated to `/#/...` in
`src/main.jsx` on load, so old bookmarks keep working. Renamed screens keep
their previous hash paths alive as well: `LEGACY_ROUTES` in `src/App.jsx`
forwards an old path to the new one (query string intact) instead of showing
the 404 frame.

The legacy path allowlist is generated from `screen-map.js` into
`app/nginx/app-routes.conf` by `npm run routes`, which `npm run build` (and the
Docker build) run automatically — a new screen therefore never needs a second
list edited by hand.

nginx also sets gzip, `X-Content-Type-Options`, `X-Frame-Options`,
`Referrer-Policy` and `Permissions-Policy`, and hides its version.
`Cross-Origin-Opener-Policy` is sent only over https, because browsers ignore
it on plain http and log a console error.

### CoinGecko feed (`/cg/`)

The keyless CoinGecko tier is rate limited per IP (roughly 15 calls/minute) and
rejects requests that do not send a descriptive `User-Agent` with
`403 {"error_message":"Please add a descriptive User-Agent..."}`; once the quota
is gone it answers `429`. Both used to reach the browser as red requests.

The proxy now:

- sends `User-Agent: PasarCrypto/1.0 (+https://pasarcryptoid.com)`,
- pins the cache key to `$uri$is_args$args` and ignores `Vary`, so a gzip
  request (the CDN's origin fetch) and a plain request share one entry instead
  of each hitting CoinGecko,
- caches `200` responses for 5 minutes per URL, with background refresh,
- serves stale data when a refresh fails (`403`, `429`, `5xx`),
- answers `200 []` plus `X-Cg-Fallback: 1` when there is nothing cached, so the
  screens fall back to their built-in figures instead of showing errors.

For a stable quota create a free demo key
(<https://www.coingecko.com/en/developers/dashboard>), put it in `.env` as
`COINGECKO_API_KEY=CG-...`, then `docker compose up -d`. While the variable is
empty the header is omitted and the keyless quota applies — with normal traffic
the 5-minute cache keeps it comfortable, but every deploy or cache flush starts
from zero, so the key is recommended for production.

### Backend reachability

The backend lives outside this compose file. Two things are required:

1. It must listen on an address the container can reach — `0.0.0.0:8000`, not
   `127.0.0.1:8000`.
2. The host firewall must allow the Docker bridge subnet, e.g.
   `sudo ufw allow from 172.16.0.0/12 to any port 8000 proto tcp`.

Cleaner production setup: put the backend in the same compose network and set
`API_UPSTREAM=http://backend:8000` (no firewall rule needed).

TLS is expected to terminate in front of this container (reverse proxy, load
balancer, or a TLS-terminating proxy service).

## Development

```sh
cd app
npm install
npm run dev
```

Build only: `npm run build` inside `app/`. Regenerate the nginx route allowlist
alone with `npm run routes`.
