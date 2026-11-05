// Builds slug → figma frame id map by fuzzy name matching, prints low-confidence pairs.
import fs from 'node:fs';

const KEY = 'yj83yK7rlsIKgJXKQ3H4Uy';
const cfg = JSON.parse(fs.readFileSync(process.env.USERPROFILE + '/.qoder/mcp.json', 'utf8'));
const TOKEN = cfg.mcpServers.figma.env.FIGMA_API_KEY;

const res = await fetch(`https://api.figma.com/v1/files/${KEY}?depth=2`, {
  headers: { 'X-Figma-Token': TOKEN },
});
const file = await res.json();
const frames = file.document.children[0].children
  .filter((n) => n.type === 'FRAME')
  .map((n) => ({ id: n.id, name: n.name, w: Math.round(n.absoluteBoundingBox.width), h: Math.round(n.absoluteBoundingBox.height) }));

const slugs = fs.readdirSync('D:/Pscryp/_stage').filter((d) => fs.existsSync(`D:/Pscryp/_stage/${d}/index.html`));

const tokens = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim().split(' ').filter(Boolean);
const norm = (s) => tokens(s).join('');

function score(slug, name) {
  const a = tokens(slug);
  const b = tokens(name);
  const setB = new Set(b);
  let hit = 0;
  for (const t of a) if (setB.has(t) || b.some((x) => x.startsWith(t) || t.startsWith(x))) hit++;
  const base = hit / Math.max(a.length, b.length);
  const bonus = norm(slug) === norm(name) ? 1 : norm(name).includes(norm(slug)) || norm(slug).includes(norm(name)) ? 0.45 : 0;
  return base + bonus;
}

const used = new Set();
const map = {};
const weak = [];

for (const slug of slugs) {
  const ranked = frames
    .map((f) => ({ ...f, s: score(slug, f.name) }))
    .sort((x, y) => y.s - x.s);
  const best = ranked[0];
  map[slug] = { id: best.id, name: best.name, size: [best.w, best.h], score: Math.round(best.s * 100) / 100 };
  used.add(best.id);
  if (best.s < 0.6) weak.push({ slug, best: `${best.name} (${best.s.toFixed(2)})`, alt: ranked[1] ? `${ranked[1].name} (${ranked[1].s.toFixed(2)})` : '-' });
}

fs.writeFileSync('D:/Pscryp/_tools/frame-map.json', JSON.stringify(map, null, 1));

console.log('mapped:', Object.keys(map).length, '| unique frames used:', used.size, '| frames total:', frames.length);
console.log('\nweak matches (need manual review):');
for (const w of weak) console.log(`  ${w.slug.padEnd(28)} -> ${w.best.padEnd(42)} | alt: ${w.alt}`);

const unusedFrames = frames.filter((f) => !used.has(f.id));
console.log('\nunmatched frames:', unusedFrames.map((f) => `${f.name} [${f.id}]`).join(', ') || 'none');
