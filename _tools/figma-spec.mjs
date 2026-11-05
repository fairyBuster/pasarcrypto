// Dumps text/style specs straight from the Figma file so the React build can be
// compared against the source of truth. Usage: node _tools/figma-spec.mjs <nodeId> [nodeId...]
import fs from 'node:fs';

const KEY = 'yj83yK7rlsIKgJXKQ3H4Uy';
const cfg = JSON.parse(fs.readFileSync(process.env.USERPROFILE + '/.qoder/mcp.json', 'utf8'));
const TOKEN = cfg.mcpServers.figma.env.FIGMA_API_KEY;

const hex = (c) => {
  if (!c) return null;
  const to = (v) => Math.round(v * 255).toString(16).padStart(2, '0');
  return `#${to(c.r)}${to(c.g)}${to(c.b)}`.toUpperCase();
};

async function get(url) {
  const res = await fetch(url, { headers: { 'X-Figma-Token': TOKEN } });
  if (!res.ok) throw new Error(`${res.status} ${await res.text()}`);
  return res.json();
}

const ids = process.argv.slice(2);
const out = {};

for (const id of ids) {
  const data = await get(`https://api.figma.com/v1/files/${KEY}/nodes?ids=${id}&depth=12`);
  const node = data.nodes[id].document;
  const texts = [];
  const images = [];

  const walk = (n) => {
    if (n.type === 'TEXT' && n.characters) {
      const st = n.style || {};
      texts.push({
        text: n.characters.replace(/\s+/g, ' ').trim().slice(0, 48),
        size: st.fontSize,
        weight: st.fontWeight,
        lineHeight: st.lineHeightPx ? Math.round(st.lineHeightPx * 10) / 10 : null,
        color: hex((n.fills || []).find((f) => f.type === 'SOLID')?.color),
        box: n.absoluteBoundingBox
          ? [Math.round(n.absoluteBoundingBox.x), Math.round(n.absoluteBoundingBox.y), Math.round(n.absoluteBoundingBox.width)]
          : null,
      });
    }
    if ((n.fills || []).some((f) => f.type === 'IMAGE')) images.push(n.name);
    for (const c of n.children || []) walk(c);
  };
  walk(node);

  out[id] = {
    name: node.name,
    frame: [Math.round(node.absoluteBoundingBox.width), Math.round(node.absoluteBoundingBox.height)],
    textCount: texts.length,
    texts: texts.slice(0, 40),
    imageNodeCount: images.length,
  };
}

console.log(JSON.stringify(out, null, 1));
