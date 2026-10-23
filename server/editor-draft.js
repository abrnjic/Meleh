import {activeTrash} from '../dist/editor-state.js';
const fail=message=>Object.assign(new Error(message),{status:400});
// Drafts may contain incomplete dates or blank numeric fields. Publication still
// uses full validateContent; this private document is never exposed publicly.
export function validateEditorDraft(data){
 if(!data||typeof data!=='object'||Array.isArray(data))throw fail('Neispravan nacrt.');
 for(const [key,max]of [['apartments',20],['photos',300],['guide',30],['faq',30]])if(!Array.isArray(data[key])||data[key].length>max||data[key].some(r=>!r||typeof r!=='object'||Array.isArray(r)))throw fail('Neispravne stavke nacrta.');
 for(const a of data.apartments)if(typeof a.slug!=='string'||typeof a.name!=='string'||!a.description||typeof a.description!=='object'||!a.amenities||typeof a.amenities!=='object'||!Array.isArray(a.seasons)||a.seasons.length>40||a.seasons.some(r=>!r||typeof r!=='object'))throw fail('Neispravan apartman nacrta.');
 for(const p of data.photos)if(typeof p.key!=='string'||typeof p.category!=='string')throw fail('Neispravna fotografija nacrta.');
 for(const f of data.faq)if(!f.question||typeof f.question!=='object'||!f.answer||typeof f.answer!=='object')throw fail('Neispravno pitanje nacrta.');
 for(const g of data.guide)if(!g.title||typeof g.title!=='object'||!g.description||typeof g.description!=='object')throw fail('Neispravna preporuka nacrta.');
 if(typeof data.name!=='string'&&data.name!==null)throw fail('Neispravan naziv nacrta.');
 const json=JSON.stringify(data);if(Buffer.byteLength(json)>650000)throw fail('Nacrt je prevelik. Izvezite kopiju i smanjite broj stavki.');
 return JSON.parse(json);
}
export function validateEditorTrash(rows=[],now=Date.now()){
 if(!Array.isArray(rows)||rows.length>300)throw fail('Koš je prevelik.');
 for(const r of rows)if(!r||!/^[-a-f0-9]{36}$/.test(r.id||'')||!['photo','apartment','guide','faq','season'].includes(r.kind)||!r.item||typeof r.item!=='object'||!Number.isInteger(r.index)||r.index<0||typeof r.label!=='string'||r.label.length>1000||!Number.isFinite(Date.parse(r.deletedAt)))throw fail('Neispravna stavka koša.');
 const result=activeTrash(rows.map(r=>({...r,deletedAt:new Date(Math.min(now,Date.parse(r.deletedAt))).toISOString()})),now);if(Buffer.byteLength(JSON.stringify(result))>180000)throw fail('Koš je prevelik. Izvezite sigurnosnu kopiju prije novih uklanjanja.');return JSON.parse(JSON.stringify(result));
}
