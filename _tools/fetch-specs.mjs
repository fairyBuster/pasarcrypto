// Fetches per-frame specs from Figma and validates each slug→frame mapping by text overlap.
import fs from 'node:fs';
import path from 'node:path';

const KEY = 'yj83yK7rlsIKgJXKQ3H4Uy';
const ROOT = 'D:/Pscryp';
const OUT = path.join(ROOT, '_tools/specs');
const cfg = JSON.parse(fs.readFileSync(process.env.USERPROFILE + '/.qoder/mcp.json', 'utf8'));
const TOKEN = cfg.mcpServers.figma.env.FIGMA_API_KEY;

// corrections found by content matching (see verify-map.mjs)
const FIX = {
  'menu-notif': '23:2',
  'notif-saldo-tdk-ckup': '8:1037',
  'notifikasi-brhasil-ubah-sandi': '8:1002',
  'notifikasi-keluar': '96:976',
  'notifikasi-berhasil-pembelian': '63:1090',
  pencarian: '63:719',
};

const map = JSON.parse(fs.readFileSync(path.join(ROOT, '_tools/frame-map.json'), 'utf8'));
for (const [slug, id] of Object.entries(FIX)) map[slug].id = id;

fs.mkdirSync(OUT, { recursive: true });

const hex = (c) => {
  if (!c) return null;
  const to = (v) => Math.round(v * 255).toString(16).padStart(2, '0');
  return `#${to(c.r)}${to(c.g)}${to(c.b)}`.toUpperCase();
};
const words = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, ' ').split(' ').filter((w) => w.length > 2);

async function fetchNode(id, attempt = 0) {
  const res = await fetch(`https://api.figma.com/v1/files/${KEY}/nodes?ids=${id}&depth=12`, {
    headers: { 'X-Figma-Token': TOKEN },
  });
  if (res.status === 429 && attempt < 4) {
    await new Promise((r) => setTimeout(r, 4000 * (attempt + 1)));
    return fetchNode(id, attempt + 1);
  }
  if (!res.ok) throw new Error(`${id}: ${res.status}`);
  return res.json();
}

function extract(node) {
  const texts = [];
  const walk = (n) => {
    if (n.type === 'TEXT' && n.characters) {
      const st = n.style || {};
      texts.push({
        text: n.characters.replace(/\s+/g, ' ').trim(),
        size: st.fontSize,
        weight: st.fontWeight,
        lineHeight: st.lineHeightPx ? Math.round(st.lineHeightPx * 10) / 10 : null,
        letterSpacing: st.letterSpacing || 0,
        color: hex((n.fills || []).find((f) => f.type === 'SOLID')?.color),
        box: n.absoluteBoundingBox
          ? [Math.round(n.absoluteBoundingBox.x), Math.round(n.absoluteBoundingBox.y), Math.round(n.absoluteBoundingBox.width), Math.round(n.absoluteBoundingBox.height)]
          : null,
        align: st.textAlignHorizontal,
      });
    }
    for (const c of n.children || []) walk(c);
  };
  walk(node);
  return texts;
}

const rows = [];
const entries = Object.entries(map);
for (let i = 0; i < entries.length; i += 4) {
  const batch = entries.slice(i, i + 4);
  const results = await Promise.all(
    batch.map(async ([slug, info]) => {
      const data = await fetchNode(info.id);
      const node = data.nodes[info.id].document;
      const texts = extract(node);
      const html = fs.readFileSync(`${ROOT}/_stage/${slug}/index.html`, 'utf8');
      const localText = html.replace(/<style[\s\S]*?<\/style>/gi, ' ').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
      const localWords = new Set(words(localText));
      const figWords = new Set(words(texts.map((t) => t.text).join(' ')));
      let hit = 0;
      for (const w of figWords) if (localWords.has(w)) hit++;
      const overlap = Math.round((hit / Math.max(figWords.size, 1)) * 100);

      const spec = {
        slug,
        id: info.id,
        frameName: node.name,
        size: [Math.round(node.absoluteBoundingBox.width), Math.round(node.absoluteBoundingBox.height)],
        overlap,
        texts,
      };
      fs.writeFileSync(path.join(OUT, `${slug}.json`), JSON.stringify(spec, null, 1));
      return spec;
    })
  );
  for (const s of results) rows.push({ slug: s.slug, name: s.frameName, id: s.id, size: s.size, texts: s.texts.length, overlap: s.overlap });
  process.stdout.write(`fetched ${Math.min(i + 4, entries.length)}/${entries.length}\r`);
}

console.log('\n');
const bad = rows.filter((r) => r.overlap < 70).sort((a, b) => a.overlap - b.overlap);
console.log('frames fetched:', rows.length);
console.log('low-overlap mappings:', bad.length);
for (const b of bad) console.log(`  ${b.slug.padEnd(30)} -> ${b.name.padEnd(30)} ${String(b.overlap).padStart(3)}%  [${b.id}]`);
console.log('\ntotal text nodes compared:', rows.reduce((a, b) => a + b.texts, 0));
