// Lists the interactive elements of a single screen with their labels, so the
// route rules can be filled in for screens that arrived later.
import fs from 'node:fs';

const slug = process.argv[2] || 'home';
const s = fs.readFileSync(`D:/Pscryp/_stage/${slug}/index.html`, 'utf8');
const body = s.slice(s.indexOf('<body')).replace(/<style[\s\S]*?<\/style>/g, '');
const plain = (x) => x.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();

const sections = [...body.matchAll(/<section[^>]*id="([^"]+)"[^>]*>/g)].map((m) => m[1]);
console.log('sections:', sections.join(' '));

for (const m of body.matchAll(/<(a|button)\b([^>]*)>([\s\S]*?)<\/\1>/g)) {
  const attrs = m[2];
  const cls = (attrs.match(/class="([^"]*)"/) || [])[1] || '';
  const aria = (attrs.match(/aria-label="([^"]*)"/) || [])[1] || '';
  const alt = (attrs.match(/alt="([^"]*)"/) || [])[1] || '';
  const label = plain(m[3]).slice(0, 40);
  console.log(`${m[1].padEnd(6)} | ${cls.padEnd(34)} | ${label || aria || alt}`);
}
