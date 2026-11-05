// Lists t('...') keys used in src that neither dictionary carries yet.
//   node _tools/i18n-missing.mjs
import fs from 'node:fs';
import path from 'node:path';

const SRC = path.resolve('src');
const DICTS = { en: path.resolve(SRC, 'lib/i18n/en.js'), zh: path.resolve(SRC, 'lib/i18n/zh.js') };

const walk = (dir) =>
  fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return walk(full);
    return /\.(jsx?|mjs)$/.test(entry.name) ? [full] : [];
  });

const keys = new Set();
for (const file of walk(SRC)) {
  if (file.includes(`${path.sep}lib${path.sep}i18n${path.sep}`)) continue;
  const src = fs.readFileSync(file, 'utf8');
  for (const match of src.matchAll(/\bt\(\s*(?:'([^'\\]*(?:\\.[^'\\]*)*)'|"([^"\\]*(?:\\.[^"\\]*)*)")/g)) {
    const raw = (match[1] ?? match[2] ?? '').replace(/\\'/g, "'").replace(/\\"/g, '"');
    if (raw) keys.add(raw);
  }
}

const has = (text, key) => {
  if (/^[A-Za-z_$][\w$]*$/.test(key)) return new RegExp(`^\\s*${key}\\s*:`, 'm').test(text);
  const quoted = key.includes("'") ? `"${key}"` : `'${key}'`;
  return text.includes(quoted);
};

for (const [lang, file] of Object.entries(DICTS)) {
  const text = fs.readFileSync(file, 'utf8');
  const missing = [...keys].filter((key) => !has(text, key));
  console.log(`${lang}: ${missing.length} missing of ${keys.size}`);
  if (process.argv.includes('--list')) missing.forEach((key) => console.log(`  ${key}`));
}
