import {applyPhotoLibrary,photoLibraryRevision} from '../dist/photo-library.js';
import {clone,validateContent} from '../dist/model.js';

export const destinationRevision='peljesac-2026-10';
export {photoLibraryRevision};
export const catalogueRevision='six-apartments-2026-10';
export const apartmentNamesRevision='short-apartment-names-2026-10';
export const amenitiesRevision='shared-amenities-2026-10';
export const specificationRevision='workbook-specification-2026-10';

export function correctedSpecification(previous,defaults){
 const data=clone(previous);
 for(const key of ['name','checkIn','checkOut','pets','categoryStars','touristTaxIncluded','arrivalDays','propertyFacts','nearby','aboutText'])data[key]=clone(defaults[key]);
 data.distances={...data.distances,...Object.fromEntries(Object.entries(defaults.distances).filter(([,value])=>value!=null))};
 data.apartments=data.apartments.map(a=>{
  const source=defaults.apartments.find(unit=>unit.slug===a.slug);if(!source)return a;
  return {...a,minNights:source.minNights,petFee:source.petFee,description:clone(source.description),amenities:clone(source.amenities),seasons:a.seasons?.length?a.seasons:clone(source.seasons)};
 });
 const keys=new Set(defaults.faq.map(f=>f.question.hr));
 data.faq=[...clone(defaults.faq),...(data.faq||[]).filter(f=>!keys.has(f.question.hr))];
 return validateContent(data);
}

export function correctedAmenities(previous){
 const data=clone(previous),slugs=new Set(['a-3','a-4','a-9','a-13','a-8','a-12']);
 data.apartments=data.apartments.map(a=>slugs.has(a.slug)?{...a,amenities:{...a.amenities,terraceOrBalcony:true,kitchen:true,wifi:true,parking:true}}:a);
 return validateContent(data);
}

export function correctedApartmentNames(previous){
 const clean=value=>typeof value==='string'?value.replace(/\bA-(8|12)\s*\(2\s*\+\s*1\)/g,'A-$1'):Array.isArray(value)?value.map(clean):value&&typeof value==='object'?Object.fromEntries(Object.entries(value).map(([key,item])=>[key,clean(item)])):value;
 return validateContent(clean(previous));
}
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
 if(snapshot.data().destinationRevision===destinationRevision&&snapshot.data().catalogueRevision===catalogueRevision&&snapshot.data().photoLibraryRevision===photoLibraryRevision&&snapshot.data().apartmentNamesRevision===apartmentNamesRevision&&snapshot.data().amenitiesRevision===amenitiesRevision&&snapshot.data().specificationRevision===specificationRevision)return snapshot.data();
 return db.runTransaction(async tx=>{
  const current=await tx.get(ref);
  if(!current.exists)return {revision:0,data:clone(defaults)};
  const previous=current.data();
  if(previous.destinationRevision===destinationRevision&&previous.catalogueRevision===catalogueRevision&&previous.photoLibraryRevision===photoLibraryRevision&&previous.apartmentNamesRevision===apartmentNamesRevision&&previous.amenitiesRevision===amenitiesRevision&&previous.specificationRevision===specificationRevision)return previous;
  let data=previous.destinationRevision===destinationRevision?previous.data:correctedDestination(previous.data,defaults);
  if(previous.catalogueRevision!==catalogueRevision){
   // Preserve the former catalogue privately; do not guess a mapping for historical stays.
   tx.set(db.collection('site').doc('catalogue-before-six-2026-10'),{apartments:previous.data.apartments,photos:previous.data.photos,createdAt:new Date().toISOString()});
   data=correctedCatalogue(data,defaults);
  }
  if(previous.photoLibraryRevision!==photoLibraryRevision)data=validateContent(applyPhotoLibrary(data));
  if(previous.apartmentNamesRevision!==apartmentNamesRevision)data=correctedApartmentNames(data);
  if(previous.amenitiesRevision!==amenitiesRevision)data=correctedAmenities(data);
  if(previous.specificationRevision!==specificationRevision)data=correctedSpecification(data,defaults);
  const next={...previous,data,photoLibraryRevision,apartmentNamesRevision,amenitiesRevision,specificationRevision,revision:(previous.revision||0)+1,destinationRevision,catalogueRevision,updatedAt:new Date().toISOString()};
  tx.set(ref,next);return next;
 });
}
