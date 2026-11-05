const fs=require('fs');
const s=JSON.parse(fs.readFileSync('_tools/_api-schema.json','utf8'));
console.log('title:', s.info && s.info.title, '| version:', s.info && s.info.version);
const paths=Object.keys(s.paths||{});
console.log('paths:', paths.length);
const rows=[];
for(const p of paths) for(const m of Object.keys(s.paths[p])) {
  const op=s.paths[p][m];
  if(['get','post','put','patch','delete'].indexOf(m)<0) continue;
  const tags=(op.tags||[]).join(',');
  rows.push([m.toUpperCase(),p,tags,(op.summary||'').slice(0,60)]);
}
for(const r of rows) console.log(r[0].padEnd(6), r[1].padEnd(52), ('['+r[2]+']').padEnd(18), r[3]);
