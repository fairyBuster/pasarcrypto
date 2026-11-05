const fs=require('fs'),path=require('path');
const ROOT='app/src/screens';
const walk=d=>fs.readdirSync(d,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(d,e.name)):[path.join(d,e.name)]);
for(const f of walk(ROOT).filter(f=>f.endsWith('.jsx'))){
  const s=fs.readFileSync(f,'utf8');
  const fields=[];
  for(const m of s.matchAll(/<(input|textarea|select)\b([^>]*)>/g)){
    const attrs=m[2];
    const get=k=>((attrs.match(new RegExp(k+'="([^"]*)"'))||[])[1])||'';
    fields.push(`${m[1]}[${get('type')||'text'}] ph="${get('placeholder')}" name="${get('name')}" cls="${(get('className')||'').split(' ')[0]}"`);
  }
  if(fields.length) console.log(f.replace(/\\/g,'/').split('/screens/')[1], '->', fields.length, '\n   ' + fields.join('\n   '));
}
