const fs=require('fs');
const s=JSON.parse(fs.readFileSync('_tools/_api-schema.json','utf8'));
const deref=(x)=>{let d=x,g=0;while(d&&d.$ref&&g++<8)d=s.components.schemas[d.$ref.split('/').pop()];return d;};
function fields(op){
  const rb=op.requestBody&&op.requestBody.content;
  if(!rb)return null;
  const ct=Object.keys(rb)[0];
  let sch=deref(rb[ct].schema);
  let props={},req=[];
  const merge=(z)=>{z=deref(z);if(!z)return;if(z.properties){Object.assign(props,z.properties);}if(z.required)req=req.concat(z.required);(z.allOf||[]).forEach(merge);};
  merge(sch);
  return Object.entries(props).map(([k,v])=>{
    const d=deref(v)||{};
    let t=d.type||(d.oneOf?'oneOf':(d.anyOf?'anyOf':'?'));
    if(d.format)t+='/'+d.format;
    if(d.enum)t+='='+d.enum.join('|');
    if(d.type==='array'){const it=deref(d.items)||{};t='['+(it.type||'?')+']';}
    if(d.maxLength)t+=' max'+d.maxLength;
    return `${req.includes(k)?'*':' '}${k}: ${t}`;
  }).join('\n    ');
}
const want=process.argv.slice(2);
for(const p of want){
  const item=s.paths[p]; if(!item){console.log('## MISSING',p);continue;}
  for(const m of ['post','put','patch']){
    if(!item[m])continue;
    console.log('## '+m.toUpperCase()+' '+p+' — '+((item[m].summary)||''));
    console.log('    '+(fields(item[m])||'(no body)'));
    console.log('');
  }
}
