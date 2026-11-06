// The Home "Sorotan Pasar" tiles read CoinGecko through the /cg proxy, but the
// CDN in front of the domain can answer that path from its own cache (or drop
// it entirely). A trimmed snapshot is therefore shipped with the bundle so the
// tiles always have figures to draw, refreshed here on every build when the
// upstream is reachable. A failed fetch keeps the committed file and the build
// continues.
import { writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ENDPOINT = 'https://api.coingecko.com/api/v3/coins/categories';
// the five tiles plus the stand-in the Solana slot falls back to
const IDS = [
  'layer-1',
  'solana-ecosystem',
  'solana-meme-coins',
  'meme-token',
  'decentralized-finance-defi',
  'artificial-intelligence',
];
const out = resolve(dirname(fileURLToPath(import.meta.url)), '../public/market-categories.json');

const controller = new AbortController();
const timer = setTimeout(() => controller.abort(), 15000);
try {
  const res = await fetch(ENDPOINT, {
    signal: controller.signal,
    headers: {
      // keyless CoinGecko rejects requests without a descriptive user agent
      'User-Agent': 'PasarCrypto/1.0 (+https://pasarcryptoid.com)',
      accept: 'application/json',
    },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const rows = await res.json();
  const byId = new Map((Array.isArray(rows) ? rows : []).map((row) => [row.id, row]));
  const picked = IDS.map((id) => byId.get(id))
    .filter((row) => row && row.market_cap_change_24h != null && Number(row.market_cap) > 0)
    .map((row) => ({
      id: row.id,
      name: row.name,
      market_cap: row.market_cap,
      market_cap_change_24h: row.market_cap_change_24h,
      top_3_coins: Array.isArray(row.top_3_coins) ? row.top_3_coins.slice(0, 3) : [],
    }));
  if (picked.length < 5) throw new Error(`only ${picked.length} usable categories`);
  writeFileSync(out, `${JSON.stringify(picked, null, 2)}\n`);
  console.log(`market snapshot: ${picked.length} categories -> public/market-categories.json`);
} catch (error) {
  console.warn(`market snapshot skipped (${error.message}); keeping the committed copy`);
} finally {
  clearTimeout(timer);
}
