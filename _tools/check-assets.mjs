// Verifies every /assets/img/... reference in generated sources exists on disk,
// and reports screens whose HTML produced no text content.
import fs from 'node:fs';
import path from 'node:path';

const APP = 'D:/Pscryp/app';
const SCR = path.join(APP, 'src/screens');
const COMP = path.join(APP, 'src/components');
const IMG = path.join(APP, 'public/assets/img');

const walk = (dir) =>
  fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? walk(path.join(dir, e.name)) : [path.join(dir, e.name)]
  );

// screens + shared components both reference the merged asset store
const files = [...walk(SCR), ...walk(COMP)];
const existing = new Set(fs.readdirSync(IMG));

let refs = 0;
const missing = new Map();
const screens = [];

for (const full of files) {
  const f = path.basename(full);
  if (!/\.(jsx|css)$/.test(f)) continue;
  const src = fs.readFileSync(full, 'utf8');
  for (const m of src.matchAll(/\/assets\/img\/([A-Za-z0-9._-]+)/g)) {
    refs++;
    if (!existing.has(m[1])) missing.set(m[1], (missing.get(m[1]) || 0) + 1);
  }
  if (f.endsWith('.jsx') && full.startsWith(SCR)) {
    const slug = f.replace(/\.jsx$/, '').replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
    const textNodes = (src.match(/>[^<>{}]*[A-Za-z]{3,}[^<>{}]*</g) || []).length;
    const imgTags = (src.match(/<img /g) || []).length;
    // screens that only wire a shared shell keep their copy in the component
    const shell = /components\/(BottomNav|NotificationPopup|ChannelSheet)/.test(src);
    screens.push({ slug, textNodes, imgTags, shell, bytes: src.length });
  }
}

console.log('asset refs:', refs, '| unique files on disk:', existing.size, '| missing refs:', missing.size);
if (missing.size) console.log([...missing.entries()].slice(0, 15));

screens.sort((a, b) => a.textNodes - b.textNodes);
console.log('\nscreens with fewest text nodes (possible broken conversion):');
console.log(
  screens
    .filter((s) => !s.shell)
    .slice(0, 8)
    .map((s) => `${s.slug}: ${s.textNodes} text / ${s.imgTags} img`)
    .join('\n')
);

const emptyImg = screens.filter((s) => !s.shell && s.imgTags === 0 && s.textNodes < 6);
if (emptyImg.length) console.log('\nsuspicious:', emptyImg.map((s) => s.slug).join(', '));
else console.log('suspicious: none');
