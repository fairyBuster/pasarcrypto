// Verifies slug → frame candidates by comparing the export's text against Figma text.
// Usage: node _tools/verify-map.mjs <slug> <id1> [id2] [id3]
import fs from 'node:fs';

const KEY = 'yj83yK7rlsIKgJXKQ3H4Uy';
const cfg = JSON.parse(fs.readFileSync(process.env.USERPROFILE + '/.qoder/mcp.json', 'utf8'));
const TOKEN = cfg.mcpServers.figma.env.FIGMA_API_KEY;

const words = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, ' ').split(' ').filter((w) => w.length > 2);

async function figmaTexts(id) {
  const res = await fetch(`https://api.figma.com/v1/files/${KEY}/nodes?ids=${id}&depth=12`, {
    headers: { 'X-Figma-Token': TOKEN },
  });
  const data = await res.json();
  const out = [];
  const walk = (n) => {
    if (n.type === 'TEXT' && n.characters) out.push(n.characters);
    for (const c of n.children || []) walk(c);
  };
  walk(data.nodes[id].document);
  return { name: data.nodes[id].document.name, texts: out };
}

const slugArg = process.argv[2];
const ids = process.argv.slice(3);
const html = fs.readFileSync(`D:/Pscryp/_stage/${slugArg}/index.html`, 'utf8');
const localText = html
  .replace(/<style[\s\S]*?<\/style>/gi, ' ')
  .replace(/<script[\s\S]*?<\/script>/gi, ' ')
  .replace(/<[^>]+>/g, ' ')
  .replace(/&[a-z]+;/gi, ' ')
  .replace(/\s+/g, ' ')
  .trim();
const localWords = new Set(words(localText));

console.log(`slug: ${slugArg}  (${localWords.size} unique words)`);
console.log(`export text: ${localText.slice(0, 140)}...\n`);

for (const id of ids) {
  const { name, texts } = await figmaTexts(id);
  const figWords = new Set(words(texts.join(' ')));
  let hit = 0;
  for (const w of figWords) if (localWords.has(w)) hit++;
  const pct = Math.round((hit / Math.max(figWords.size, 1)) * 100);
  console.log(`  ${id.padEnd(9)} ${name.padEnd(32)} overlap ${String(pct).padStart(3)}%  texts=${texts.length}`);
  console.log(`    ${texts.join(' | ').slice(0, 160)}`);
}
