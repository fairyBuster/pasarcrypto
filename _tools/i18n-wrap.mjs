// Wraps JSX text nodes and a few translatable attributes in t('...') and adds
// the i18n import. Mechanical pass for the generated screens; the build is the
// safety net, and anything the regex skips is fixed by hand.
//
//   node _tools/i18n-wrap.mjs src/screens/profile/Akun.jsx [...]
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve('src');

const quote = (text) => {
  if (!text.includes("'")) return `'${text}'`;
  if (!text.includes('"')) return `"${text}"`;
  return `'${text.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;
};

const importPath = (file) => {
  const rel = path
    .relative(path.dirname(file), path.join(ROOT, 'lib/i18n.js'))
    .split(path.sep)
    .join('/');
  return rel.startsWith('.') ? rel : `./${rel}`;
};

const wrapText = (src) => {
  let count = 0;
  const out = src.replace(/>(\s*)([^<>{}]+?)(\s*)</g, (match, lead, raw, trail) => {
    const text = raw.trim();
    if (!text || !/[A-Za-z]/.test(text)) return match;
    if (/^&[a-zA-Z]+;$/.test(text)) return match;
    if (/[=;(){}\[\]|]/.test(text)) return match;
    count += 1;
    return `>${lead}{t(${quote(text)})}${trail}<`;
  });
  return [out, count];
};

const wrapAttrs = (src) => {
  let count = 0;
  const out = src.replace(/\b(placeholder|title|aria-label)="([^"]+)"/g, (match, name, value) => {
    const text = value.trim();
    if (!text || !/[A-Za-z]/.test(text)) return match;
    count += 1;
    return `${name}={t(${quote(text)})}`;
  });
  return [out, count];
};

const addImport = (src, file) => {
  const line = `import { t } from '${importPath(file)}';`;
  const lines = src.split('\n');
  let last = -1;
  for (let i = 0; i < lines.length; i += 1) {
    if (/^import .*;$/.test(lines[i].trim())) last = i;
    else if (last >= 0 && lines[i].trim() && !/^import /.test(lines[i].trim())) break;
  }
  lines.splice(last + 1, 0, line);
  return lines.join('\n');
};

let touched = 0;
for (const arg of process.argv.slice(2)) {
  const file = path.resolve(arg);
  const src = fs.readFileSync(file, 'utf8');
  if (src.includes("lib/i18n.js")) {
    console.log(`skip   ${arg} (already wired)`);
    continue;
  }
  if (/\b(?:const|let|var)\s+t\b/.test(src)) {
    console.log(`skip   ${arg} (has its own "t")`);
    continue;
  }
  const [withText, textCount] = wrapText(src);
  const [withAttrs, attrCount] = wrapAttrs(withText);
  const total = textCount + attrCount;
  if (!total) {
    console.log(`skip   ${arg} (no translatable text)`);
    continue;
  }
  fs.writeFileSync(file, addImport(withAttrs, file));
  touched += 1;
  console.log(`wrap   ${arg} (${textCount} text, ${attrCount} attrs)`);
}
console.log(`done   ${touched} file(s)`);
