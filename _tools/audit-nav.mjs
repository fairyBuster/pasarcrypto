// Lists <a>/<button> elements in the generated screens that still have no
// data-route / data-back, aggregated by label, so routing rules can be extended.
import fs from 'node:fs';
import path from 'node:path';

const ROOT = 'D:/Pscryp/app/src/screens';

const walk = (dir) =>
  fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? walk(path.join(dir, e.name)) : [path.join(dir, e.name)]
  );

const clean = (s) =>
  s
    .replace(/<[^>]*>/g, ' ')
    .replace(/&#123;|&#125;/g, '')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim();

const byLabel = new Map();
const byCls = new Map();
let wired = 0;
let total = 0;

for (const file of walk(ROOT)) {
  const base = path.basename(file);
  if (!base.endsWith('.jsx')) continue;
  const src = fs.readFileSync(file, 'utf8');
  const screen = base.replace('.jsx', '');
  wired += (src.match(/data-(route|back)=/g) || []).length;

  for (const m of src.matchAll(/<(a|button)\b([^>]*)>([\s\S]*?)<\/\1>/g)) {
    total++;
    const attrs = m[2];
    const cls = (attrs.match(/className="([^"]*)"/) || [, ''])[1];
    const label = clean(m[3]).slice(0, 48);
    if (/data-(route|back)=/.test(attrs)) continue;
    const key = label || `(no text) ${cls}`;
    if (!byLabel.has(key)) byLabel.set(key, { n: 0, screens: new Set(), cls });
    const rec = byLabel.get(key);
    rec.n++;
    rec.screens.add(screen);
    for (const c of cls.split(/\s+/).filter(Boolean)) {
      if (!byCls.has(c)) byCls.set(c, new Set());
      byCls.get(c).add(screen);
    }
  }
}

console.log(`anchors/buttons total: ${total} | wired: ${wired} | unwired: ${total - wired} | unique labels: ${byLabel.size}`);
console.log('\n--- unwired by label ---');
for (const [label, r] of [...byLabel.entries()].sort((a, b) => b[1].n - a[1].n)) {
  console.log(`${String(r.n).padStart(3)} | ${label} | .${r.cls.slice(0, 44)} | ${[...r.screens].slice(0, 3).join(',')}`);
}
console.log('\n--- classes on unwired elements ---');
console.log([...byCls.keys()].join(' '));
