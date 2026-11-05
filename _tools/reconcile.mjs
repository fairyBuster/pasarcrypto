// Compares generated screen CSS against the Figma text specs and emits override CSS.
import fs from 'node:fs';
import path from 'node:path';

const ROOT = 'D:/Pscryp';
const SCR = path.join(ROOT, 'app/src/screens');
const SPECS = path.join(ROOT, '_tools/specs');
const OUT = path.join(ROOT, '_tools/figma-fixes.json');

const pascal = (slug) => slug.split('-').map((s) => s[0].toUpperCase() + s.slice(1)).join('');
const squash = (s) => s.replace(/\s+/g, ' ').trim().toLowerCase();

const hexOf = (v) => {
  if (!v) return null;
  const s = v.trim().toLowerCase();
  const m6 = s.match(/^#([0-9a-f]{6})$/);
  if (m6) return '#' + m6[1].toUpperCase();
  const m3 = s.match(/^#([0-9a-f]{3})$/);
  if (m3) return '#' + m3[1].split('').map((c) => c + c).join('').toUpperCase();
  const rgb = s.match(/^rgba?\(\s*(\d+)[\s,]+(\d+)[\s,]+(\d+)/);
  if (rgb) return '#' + [1, 2, 3].map((i) => Number(rgb[i]).toString(16).padStart(2, '0')).join('').toUpperCase();
  return null;
};

// class → declarations from a generated stylesheet
function parseCss(css) {
  const map = new Map();
  const re = /([^{}]+)\{([^{}]*)\}/g;
  let m;
  while ((m = re.exec(css))) {
    const sel = m[1].trim();
    if (!sel.includes('.')) continue;
    const decls = {};
    for (const part of m[2].split(';')) {
      const i = part.indexOf(':');
      if (i < 0) continue;
      decls[part.slice(0, i).trim()] = part.slice(i + 1).trim();
    }
    for (const one of sel.split(',')) {
      const cls = one.match(/\.([A-Za-z0-9_-]+)(?![\s\S]*\.)/);
      if (!cls) continue;
      const prev = map.get(cls[1]) || {};
      map.set(cls[1], { ...prev, ...decls });
    }
  }
  return map;
}

const TEXT_TAGS = 'h1|h2|h3|h4|h5|p|span|a|button|div|li|strong|small|label';
const stats = { screens: 0, matched: 0, unmatchedDom: 0, fixes: 0, conflicts: 0 };
const byProp = { size: 0, weight: 0, color: 0, lineHeight: 0 };
const json = {};
const out = [];
const skipped = [];

// screens live in feature folders and carry their CSS inline
const walk = (dir) =>
  fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? walk(path.join(dir, e.name)) : [path.join(dir, e.name)]
  );
const jsxByComp = new Map();
for (const full of walk(SCR)) {
  if (full.endsWith('.jsx')) jsxByComp.set(path.basename(full, '.jsx'), full);
}

for (const file of fs.readdirSync(SPECS)) {
  const spec = JSON.parse(fs.readFileSync(path.join(SPECS, file), 'utf8'));
  const { slug } = spec;
  const jsxPath = jsxByComp.get(pascal(slug));
  if (!jsxPath) continue;

  const jsx = fs.readFileSync(jsxPath, 'utf8');
  const cssM = jsx.match(/const css = `([\s\S]*?)`;/);
  if (!cssM) continue; // component-rendered screens keep their CSS in components/
  // recompute from the export rules, not from the overrides emitted last run
  const cssMap = parseCss(cssM[1].split('/* figma re-sync */')[0]);

  // direct-text elements: <tag ... className="x y">Text</tag>
  const re = new RegExp(`<(${TEXT_TAGS})\\b[^>]*className="([^"]*)"[^>]*>([^<]{2,}?)</\\1>`, 'g');
  const domTexts = [];
  let m;
  while ((m = re.exec(jsx))) {
    const text = squash(m[3].replace(/&amp;/g, '&').replace(/&nbsp;/g, ' ').replace(/&#123;/g, '{'));
    if (!text || text.length < 2) continue;
    domTexts.push({ cls: m[2].split(/\s+/)[0], text, tag: m[1] });
  }

  const figmaByText = new Map();
  for (const t of spec.texts) {
    const key = squash(t.text);
    if (!figmaByText.has(key)) figmaByText.set(key, t);
  }

  const perClass = new Map();
  for (const d of domTexts) {
    const fig = figmaByText.get(d.text);
    if (!fig) { stats.unmatchedDom++; continue; }
    stats.matched++;
    const decl = cssMap.get(d.cls) || {};

    const cssSize = parseFloat(decl['font-size'] || '');
    const figSize = fig.size;
    if (!Number.isNaN(cssSize) && figSize && Math.abs(cssSize - figSize) > 0.6) {
      perClass.set(d.cls + '|size', { cls: d.cls, prop: 'font-size', from: cssSize, to: `${figSize}px` });
    }

    const cssWeight = parseInt(decl['font-weight'] || '', 10);
    if (!Number.isNaN(cssWeight) && fig.weight && cssWeight !== fig.weight) {
      perClass.set(d.cls + '|weight', { cls: d.cls, prop: 'font-weight', from: cssWeight, to: fig.weight });
    }

    // line-height: compare resolved px
    const lhRaw = decl['line-height'];
    if (lhRaw && fig.lineHeight) {
      let px = null;
      if (/px$/.test(lhRaw)) px = parseFloat(lhRaw);
      else if (/^[\d.]+$/.test(lhRaw)) px = parseFloat(lhRaw) * (Number.isNaN(cssSize) ? figSize : cssSize);
      if (px && Math.abs(px - fig.lineHeight) > 1.2) {
        perClass.set(d.cls + '|lineHeight', { cls: d.cls, prop: 'line-height', from: Math.round(px), to: `${Math.round(fig.lineHeight)}px` });
      }
    }

    const cssColor = hexOf(decl['color']);
    if (cssColor && fig.color && cssColor !== fig.color) {
      const key = d.cls + '|color';
      if (perClass.has(key) && perClass.get(key).to !== fig.color) {
        perClass.delete(key);
        stats.conflicts++;
      } else {
        perClass.set(key, { cls: d.cls, prop: 'color', from: cssColor, to: fig.color });
      }
    }
  }

  const rules = [...perClass.values()];
  stats.screens++;
  if (!rules.length) continue;
  stats.fixes += rules.length;
  for (const r of rules) {
    if (r.prop === 'font-size') byProp.size++;
    if (r.prop === 'font-weight') byProp.weight++;
    if (r.prop === 'color') byProp.color++;
    if (r.prop === 'line-height') byProp.lineHeight++;
  }
  if (rules.length) json[slug] = rules.map(({ cls, prop, to }) => ({ cls, prop, to }));
  out.push(`${slug}: ${rules.length}`);
}

fs.writeFileSync(OUT, JSON.stringify(json, null, 1));

console.log('screens compared:', stats.screens);
console.log('text nodes matched:', stats.matched, '| unmatched (dom text not in figma):', stats.unmatchedDom);
console.log('fixes:', stats.fixes, '| color conflicts skipped:', stats.conflicts);
console.log('by property:', JSON.stringify(byProp));
console.log('written:', OUT);
if (skipped.length) console.log('skipped:', skipped.slice(0, 10));
