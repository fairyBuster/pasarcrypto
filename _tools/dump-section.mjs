// Prints one section of an export, trimmed of styles, to see which containers
// should become links.
import fs from 'node:fs';

const [slug, id] = [process.argv[2] || 'home', process.argv[3] || 'section-market-highlights'];
const s = fs.readFileSync(`D:/Pscryp/_stage/${slug}/index.html`, 'utf8');
const start = s.indexOf(`id="${id}"`);
const chunk = s.slice(start - 60, start + 2200);
console.log(chunk.replace(/<style[\s\S]*?<\/style>/g, '').replace(/\n\s*\n/g, '\n'));
