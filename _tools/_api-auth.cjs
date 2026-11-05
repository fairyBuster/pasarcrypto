const fs=require('fs');
const s=JSON.parse(fs.readFileSync('_tools/_api-schema.json','utf8'));
const deref=(x)=>{let d=x;let g=0;while(d&&d.$ref&&g++<8){d=s.components.schemas[d.$ref.split('/').pop()];}return d;};
const props=(sch)=>{sch=deref(sch);if(!sch)return null;if(sch.properties)return sch;if(sch.allOf){const p={};let req=[];for(const a of sch.allOf){const r=deref(a);if(r.properties)Object.assign(p,r.properties);if(r.required)req=req.concat(r.required);}return{properties:p,required:req};}return sch;};
for(const p of Object.keys(s.paths).filter(p=>p.startsWith('/api/auth')).sort()){
  const m=s.paths[p].post||s.paths[p].put||s.paths[p].patch||s.paths[p].get;
  console.log((Object.keys(s.paths[p])[0]||'').toUpperCase().padEnd(6),p,'|',(m&&m.summary)||'');
}
