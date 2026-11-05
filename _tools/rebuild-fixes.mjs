// Rebuilds _tools/figma-fixes.json from the generated screens, which still
// carry the emitted "figma re-sync" overrides.
import fs from 'node:fs';
import path from 'node:path';

const ROOT = 'D:/Pscryp';
const SCR = path.join(ROOT, 'app/src/screens');

const walk = (dir) =>
  fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? walk(path.join(dir, e.name)) : [path.join(dir, e.name)]
  );

const out = {};
let total = 0;

for (const full of walk(SCR)) {
  if (!full.endsWith('.jsx')) continue;
  const src = fs.readFileSync(full, 'utf8');
  const slugM = src.match(/\.scr-([a-z0-9-]+)\s*\{/) || src.match(/scr-([a-z0-9-]+)"/);
  const slug = slugM ? slugM[1] : null;
  if (!slug) continue;

  const block = src.split('/* figma re-sync */')[1];
  if (!block) continue;

  const rules = [];
  for (const m of block.matchAll(new RegExp(`\\.scr-${slug}\\s+\\.([a-z0-9_-]+)\\.\\1\\s*\\{\\s*([a-z-]+):\\s*([^;}]+);?\\s*\\}`, 'g'))) {
    rules.push({ cls: m[1], prop: m[2], to: m[3].trim() });
  }
  if (rules.length) {
    out[slug] = rules;
    total += rules.length;
  }
}

fs.writeFileSync(path.join(ROOT, '_tools/figma-fixes.json'), JSON.stringify(out, null, 1));
console.log('screens with fixes:', Object.keys(out).length, '| rules:', total);
