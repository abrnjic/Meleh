export const TRASH_LIFETIME=30*86400000;
const clone=v=>structuredClone(v);
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
export function activeTrash(rows=[],now=Date.now()){return rows.filter(r=>Number.isFinite(Date.parse(r.deletedAt))&&Date.parse(r.deletedAt)<=now&&Date.parse(r.deletedAt)+TRASH_LIFETIME>now)}
export function putInTrash(state,kind,index,scope=null,now=Date.now()){
 const collection={photo:'photos',apartment:'apartments',guide:'guide',faq:'faq',season:'seasons'}[kind];
 if(!collection)throw Error('Nepoznata vrsta sadržaja.');
 const parent=kind==='season'?state.data.apartments.find(a=>a.slug===scope):state.data,rows=parent?.[collection],item=rows?.[index];if(!item)throw Error('Sadržaj više nije dostupan.');
 const record={id:crypto.randomUUID(),kind,index,scope,deletedAt:new Date(now).toISOString(),item:clone(item)};
 record.label=kind==='photo'?item.alt||item.key:kind==='apartment'?item.name:kind==='guide'?item.title?.hr||'Preporuka':kind==='faq'?item.question?.hr||'Pitanje':`${scope}: ${item.from||'?'} – ${item.to||'?'}`;
 record.label=record.label.slice(0,200);
 if(kind==='apartment'){record.photos=state.data.photos.flatMap((photo,index)=>photo.category===item.slug?[{photo:clone(photo),index}]:[]);const keys=new Set(record.photos.map(r=>r.photo.key));if(['heroImage','introImage','bannerImage'].some(k=>keys.has(state.data[k]))||state.data.apartments.some(a=>a!==item&&keys.has(a.image))||state.data.guide.some(g=>keys.has(g.photo)))throw Error('Fotografija ovog apartmana koristi se na drugom mjestu. Najprije odaberite zamjensku fotografiju.');state.data.photos=state.data.photos.filter(p=>!keys.has(p.key));if(state.data.seo?.pages?.['/apartmani/'+item.slug]){record.seo=clone(state.data.seo.pages['/apartmani/'+item.slug]);delete state.data.seo.pages['/apartmani/'+item.slug]}}
 rows.splice(index,1);state.trash=[...activeTrash(state.trash,now),record];return record;
}
export function restoreFromTrash(state,id,now=Date.now()){
 const record=activeTrash(state.trash,now).find(r=>r.id===id);if(!record)throw Error('Sadržaj više nije dostupan za vraćanje.');
 const {kind,item,scope,index}=record;let rows;
 if(kind==='photo'){rows=state.data.photos;if(rows.some(p=>p.key===item.key))throw Error('Fotografija s istom oznakom već postoji.');if(!['house','location'].includes(item.category)&&!state.data.apartments.some(a=>a.slug===item.category))throw Error('Najprije vratite apartman kojem fotografija pripada.');if(rows.length>=300)throw Error('Dosegnut je broj fotografija.');}
 else if(kind==='apartment'){rows=state.data.apartments;if(rows.some(a=>a.slug===item.slug))throw Error('Apartman s istom URL oznakom već postoji.');if(rows.length>=20)throw Error('Dosegnut je broj apartmana.');if(state.data.photos.length+(record.photos?.length||0)>300)throw Error('Dosegnut je broj fotografija.');if(record.photos?.some(r=>state.data.photos.some(p=>p.key===r.photo.key)))throw Error('Fotografija ovog apartmana već postoji u galeriji. Najprije riješite jednaku oznaku fotografije.');}
 else if(kind==='season'){rows=state.data.apartments.find(a=>a.slug===scope)?.seasons;if(!rows)throw Error('Najprije vratite apartman kojem sezona pripada.');if(rows.length>=40)throw Error('Dosegnut je broj sezona.');}
 else {rows=state.data[kind==='faq'?'faq':'guide'];if(rows.length>=30)throw Error('Dosegnut je broj stavki.');}
 rows.splice(Math.min(index,rows.length),0,clone(item));
 if(kind==='apartment'){for(const row of record.photos||[])state.data.photos.splice(Math.min(row.index,state.data.photos.length),0,clone(row.photo));state.data.photos.forEach(p=>{if(record.photoCategories?.includes(p.key)&&p.category==='house')p.category=item.slug});if(record.seo){state.data.seo||={};state.data.seo.pages||={};state.data.seo.pages['/apartmani/'+item.slug]=clone(record.seo)}}
 state.trash=activeTrash(state.trash,now).filter(r=>r.id!==id);return record;
}
const labels={name:'Naziv',location:'Lokacija',address:'Adresa',phone:'Telefon',email:'E-mail',whatsapp:'WhatsApp',viber:'Viber',mapsUrl:'Karta',mapEmbed:'Ugrađena karta',checkIn:'Prijava',checkOut:'Odjava',pets:'Kućni ljubimci',smoking:'Pušenje',aboutText:'Priča objekta',distances:'Udaljenosti',distanceLinks:'Poveznice udaljenosti',branding:'Identitet i tema',seo:'SEO postavke',propertyFacts:'Podaci objekta',nearby:'Sadržaji u blizini',heroImage:'Glavna fotografija',introImage:'Fotografija priče',bannerImage:'Široka fotografija',faq:'Česta pitanja',guide:'Vodič'};
const apartmentLabels={name:'Naziv',published:'Vidljivost',guests:'Kapacitet',area:'Površina',rooms:'Sobe',baths:'Kupaonice',floor:'Kat',image:'Naslovna fotografija',amenities:'Opremljenost',description:'Opis',minNights:'Minimalni boravak',petFee:'Cijena ljubimca',seasons:'Cjenik'};
export function summarizeChanges(before,after){
 const changes=[],add=(section,label,old,value)=>changes.push({section,label,before:clone(old??null),after:clone(value??null)});
 for(const [key,label] of Object.entries(labels))if(!same(before?.[key],after?.[key]))add('Stranica',label,before?.[key],after?.[key]);
 for(const [collection,keyField,section]of [['apartments','slug','Apartmani'],['photos','key','Fotografije']]){
  const old=before?.[collection]||[],next=after?.[collection]||[];
  for(const row of old)if(!next.some(p=>p[keyField]===row[keyField]))add(section,'Uklonjeno: '+(row.name||row.alt||row[keyField]),row,null);
  for(const row of next){const original=old.find(p=>p[keyField]===row[keyField]);if(!original){add(section,'Dodano: '+(row.name||row.alt||row[keyField]),null,row);continue}if(collection==='apartments'){for(const key of new Set([...Object.keys(row),...Object.keys(original)]))if(!same(original[key],row[key]))add(section,`${row.name} · ${apartmentLabels[key]||key}`,original[key],row[key])}else if(!same(original,row))add(section,row.alt||row.key,original,row)}
  const common=old.filter(p=>next.some(n=>n[keyField]===p[keyField])).map(p=>p[keyField]),ordered=next.filter(p=>common.includes(p[keyField])).map(p=>p[keyField]);if(!same(common,ordered))add(section,'Redoslijed',common,ordered);
 }
 const handled=new Set([...Object.keys(labels),'apartments','photos']);for(const key of new Set([...Object.keys(before||{}),...Object.keys(after||{})]))if(!handled.has(key)&&!same(before?.[key],after?.[key]))add('Ostalo',key,before?.[key],after?.[key]);return changes;
}
