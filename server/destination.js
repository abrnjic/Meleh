import {clone,validateContent} from '../dist/model.js';

export const destinationRevision='peljesac-2026-10';
export const catalogueRevision='six-apartments-2026-10';
const legacy=value=>/crikven|kvarner|ljubavna cestica/i.test(JSON.stringify(value));

// Apply the confirmed destination once, preserving accommodation and calendar data.
export function correctedDestination(previous,defaults){
 const data=clone(previous);
 for(const key of ['address','location','phone','mapsUrl','mapEmbed'])data[key]=defaults[key];
 if(!Object.values(data.aboutText||{}).some(Boolean)||legacy(data.aboutText))data.aboutText=clone(defaults.aboutText);
 data.photos=data.photos.map(photo=>legacy(photo)?clone(defaults.photos.find(p=>p.key===photo.key)||photo):photo);
 data.photoCredits=[...(data.photoCredits||[]).filter(c=>!legacy(c)),...clone(defaults.photoCredits)].filter((c,i,rows)=>rows.findIndex(r=>r.file===c.file)===i);
 const customGuide=(data.guide||[]).filter(g=>!legacy(g));
 data.guide=[...clone(defaults.guide),...customGuide].filter((g,i,rows)=>rows.findIndex(r=>JSON.stringify(r.title)===JSON.stringify(g.title))===i);
 data.distances={...data.distances};
 for(const key of ['beach','center','shop','restaurant','airport','parking'])data.distances[key]=defaults.distances[key];
 data.faq=(data.faq||[]).map(f=>/Je li osiguran parking\?/.test(f.question?.hr||'')?clone(defaults.faq.find(f=>f.question.hr==='Je li osiguran parking?')):f);
 return validateContent(data);
}

export function correctedCatalogue(previous,defaults){
 const data=clone(previous),slugs=new Set(defaults.apartments.map(a=>a.slug));
 data.apartments=clone(defaults.apartments);
 const covers=defaults.photos.filter(p=>slugs.has(p.category));
 const coverKeys=new Set(covers.map(p=>p.key));
 data.photos=[...data.photos.filter(p=>!coverKeys.has(p.key)&&!( ['room','bedroom','house'].includes(p.key)&&!p.url)).map(p=>({...p,category:['location','house',...slugs].includes(p.category)?p.category:'house'})),...clone(covers)];
 for(const key of ['heroImage','introImage','bannerImage'])if(!data.photos.some(p=>p.key===data[key]))data[key]=defaults[key];
 return validateContent(data);
}

export async function readSiteData(db,defaults){
 const ref=db.collection('site').doc('public'),snapshot=await ref.get();
 if(!snapshot.exists)return {revision:0,data:clone(defaults)};
 if(snapshot.data().destinationRevision===destinationRevision&&snapshot.data().catalogueRevision===catalogueRevision)return snapshot.data();
 return db.runTransaction(async tx=>{
  const current=await tx.get(ref);
  if(!current.exists)return {revision:0,data:clone(defaults)};
  const previous=current.data();
  if(previous.destinationRevision===destinationRevision&&previous.catalogueRevision===catalogueRevision)return previous;
  let data=previous.destinationRevision===destinationRevision?previous.data:correctedDestination(previous.data,defaults);
  if(previous.catalogueRevision!==catalogueRevision){
   // Preserve the former catalogue privately; do not guess a mapping for historical stays.
   tx.set(db.collection('site').doc('catalogue-before-six-2026-10'),{apartments:previous.data.apartments,photos:previous.data.photos,createdAt:new Date().toISOString()});
   data=correctedCatalogue(data,defaults);
  }
  const next={...previous,data,revision:(previous.revision||0)+1,destinationRevision,catalogueRevision,updatedAt:new Date().toISOString()};
  tx.set(ref,next);return next;
 });
}
