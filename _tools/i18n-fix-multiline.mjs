// JSX collapses newlines inside a text node, but the wrapper wrote them into a
// single-quoted string. Fold every multi-line t('...') back to one line.
//   node _tools/i18n-fix-multiline.mjs
import fs from 'node:fs';
import path from 'node:path';

const SRC = path.resolve('src');
const walk = (dir) =>
  fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return walk(full);
    return /\.jsx?$/.test(entry.name) ? [full] : [];
  });

let fixed = 0;
for (const file of walk(SRC)) {
  const src = fs.readFileSync(file, 'utf8');
  const out = src.replace(/\bt\(\s*'([^']*?)'\s*\)/gs, (match, text) => {
    if (!text.includes('\n')) return match;
    const flat = text.replace(/\s*\n\s*/g, ' ').trim();
    return `t('${flat}')`;
  });
  if (out !== src) {
    fs.writeFileSync(file, out);
    fixed += 1;
    console.log(`fix    ${path.relative(SRC, file)}`);
  }
}
console.log(`done   ${fixed} file(s)`);
