// Fetches the Home frame spec (arrived after the original 80) and registers it
// in frame-map.json so reconcile/gen treat it like any other screen.
import fs from 'node:fs';
import path from 'node:path';

const KEY = 'yj83yK7rlsIKgJXKQ3H4Uy';
const ROOT = 'D:/Pscryp';
const OUT = path.join(ROOT, '_tools/specs');
const cfg = JSON.parse(fs.readFileSync(process.env.USERPROFILE + '/.qoder/mcp.json', 'utf8'));
const TOKEN = cfg.mcpServers.figma.env.FIGMA_API_KEY;

const hex = (c) => {
  if (!c) return null;
  const to = (v) => Math.round(v * 255).toString(16).padStart(2, '0');
  return `#${to(c.r)}${to(c.g)}${to(c.b)}`.toUpperCase();
};
const words = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, ' ').split(' ').filter((w) => w.length > 2);

const extract = (node) => {
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
};

const slug = process.argv[2] || 'home';
const id = process.argv[3] || '8:1038';

const res = await fetch(`https://api.figma.com/v1/files/${KEY}/nodes?ids=${id}&depth=12`, {
  headers: { 'X-Figma-Token': TOKEN },
});
if (!res.ok) throw new Error(`${id}: ${res.status}`);
const data = await res.json();
const node = data.nodes[id].document;
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
  id,
  frameName: node.name,
  size: [Math.round(node.absoluteBoundingBox.width), Math.round(node.absoluteBoundingBox.height)],
  overlap,
  texts,
};
fs.writeFileSync(path.join(OUT, `${slug}.json`), JSON.stringify(spec, null, 1));

const mapPath = path.join(ROOT, '_tools/frame-map.json');
const map = JSON.parse(fs.readFileSync(mapPath, 'utf8'));
map[slug] = { ...(map[slug] || {}), id, name: node.name };
fs.writeFileSync(mapPath, JSON.stringify(map, null, 1));

console.log(JSON.stringify({ slug, id, name: node.name, size: spec.size, texts: texts.length, overlap }));
