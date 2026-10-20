// Shared browser/server validation. Dates use [arrival, departure) intervals.
const invalid=message=>Object.assign(new Error(message),{status:400});
export const clone = value => JSON.parse(JSON.stringify(value));
export function text(value, max=5000) {
  if(value==null)return null;
  if(typeof value!=='string'||value.length>max||/[<>\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(value))throw invalid('Tekst sadrži nedopuštene znakove ili je predugačak.');
  return value.trim()||null;
}
export function apartmentName(value){
 const name=text(value,100);
 if(!name)return name;
 const match=/^(?:apartman\s+|apartment\s+)?a\s*-?\s*(3|4|9|13|8|12)(?:\s*\(\s*2\s*\+\s*1\s*\))?$/i.exec(name);
 return match?'A-'+match[1]:name;
}
export function date(value) {
  if(typeof value!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(value))return false;
  const d=new Date(value+'T12:00:00Z');return !isNaN(d)&&d.toISOString().slice(0,10)===value;
}
export function addDays(value,n){const d=new Date(value+'T12:00:00Z');d.setUTCDate(d.getUTCDate()+n);return d.toISOString().slice(0,10)}
export function nights(a,b){return Math.round((new Date(b+'T12:00:00Z')-new Date(a+'T12:00:00Z'))/86400000)}
export function interval(a,b){return date(a)&&date(b)&&a<b&&nights(a,b)<=730}
export function overlaps(a,b){return a.arrival<b.departure&&b.arrival<a.departure}
export function capacity(a){return String(a.guests).split('+').reduce((n,v)=>n+Number(v.trim()),0)}
export function whatsappNumber(value){
 const raw=String(value||'').trim();
 if(!/^[+\d\s()-]+$/.test(raw))return null;
 const digits=raw.replace(/[\s()-]/g,'').replace(/^\+/,'').replace(/^00/,'');
 return /^[1-9]\d{6,14}$/.test(digits)?digits:null;
}
export function number(value,min,max){const n=Number(value);if(!Number.isFinite(n)||n<min||n>max)throw invalid('Broj je izvan dopuštenog raspona.');return n}
export function integer(value,min,max){const n=number(value,min,max);if(!Number.isInteger(n))throw invalid('Unesite cijeli broj.');return n}
export function email(value){return typeof value==='string'&&value.length<=254&&/^[^\s<>@]+@[^\s<>@]+\.[^\s<>@]+$/.test(value)}
const localized=value=>typeof value==='object'&&value!==null?Object.fromEntries(['hr','en','de'].map(l=>[l,text(value[l])||''])):text(value)||'';
function https(value){if(!value)return null;let u;try{u=new URL(value)}catch{throw invalid('Neispravna poveznica.')}if(u.protocol!=='https:'||u.username||u.password)throw invalid('Poveznica mora koristiti HTTPS.');return u.href}
function slug(value){if(typeof value!=='string'||! /^[a-z][a-z0-9-]{0,49}$/.test(value))throw invalid('Oznaka smije sadržavati mala slova, brojeve i crtice.');return value}
export function validateSeasons(rows=[]){if(!Array.isArray(rows)||rows.length>40)throw invalid('Neispravan cjenik.');const result=rows.map(s=>{if(!interval(s.from,s.to))throw invalid('Provjerite datume sezone.');return {from:s.from,to:s.to,nightly:number(s.nightly,1,10000),minNights:integer(s.minNights||1,1,365)}}).sort((a,b)=>a.from.localeCompare(b.from));for(let i=1;i<result.length;i++)if(result[i].from<result[i-1].to)throw invalid('Sezone se ne smiju preklapati.');return result}
export function validateContent(input,{allowDataImages=false}={}){
  if(!input||typeof input!=='object'||Array.isArray(input))throw invalid('Neispravan sadržaj.');
  const result={};for(const k of ['name','location','address','email','phone','whatsapp','viber','checkIn','checkOut','pets','smoking','quietHours'])result[k]=text(input[k],k==='address'?500:250);
  if(!result.name)throw invalid('Naziv objekta je obavezan.');if(result.email&&!email(result.email))throw invalid('Neispravna kontaktna email adresa.');
  for(const k of ['phone','whatsapp','viber'])if(result[k]&&!/^\+?[\d\s()-]{5,40}$/.test(result[k]))throw invalid('Provjerite telefonski broj.');
  if(result.whatsapp&&!whatsappNumber(result.whatsapp))throw invalid('WhatsApp broj unesite u međunarodnom obliku s pozivnim brojem države (npr. +385…), bez početne lokalne nule.');
  for(const k of ['mapsUrl','instagram','facebook'])result[k]=https(input[k]);
  result.mapEmbed=https(input.mapEmbed);if(result.mapEmbed){const u=new URL(result.mapEmbed);if(u.hostname!=='www.google.com'||!u.pathname.startsWith('/maps/embed'))throw invalid('Koristite Google Maps embed poveznicu.');}
  result.demo=input.demo!==false;result.aboutText=localized(input.aboutText);result.distances={};for(const k of ['beach','center','shop','restaurant','airport','parking'])result.distances[k]=text(input.distances?.[k],100);
  if(!Array.isArray(input.apartments)||!input.apartments.length||input.apartments.length>20)throw invalid('Dodajte između 1 i 20 apartmana.');
  result.apartments=input.apartments.map(a=>{const guests=text(a.guests,20);if(!/^\d{1,2}(\s*\+\s*\d{1,2})?$/.test(guests||''))throw invalid('Kapacitet unesite kao 2 ili 2 + 2.');const row={slug:slug(a.slug),name:apartmentName(a.name),guests,rooms:integer(a.rooms,0,20),baths:a.baths==null||a.baths===''?null:integer(a.baths,1,20),area:number(a.area,5,2000),floor:text(String(a.floor??''),40),image:slug(a.image),tag:localized(a.tag),type:a.type==='family'?'family':'couple',detailsConfirmed:a.detailsConfirmed===true,price:null,description:localized(a.description),seasons:validateSeasons(a.seasons)};row.amenities=Object.fromEntries(['terrace','balcony','terraceOrBalcony','parking','wifi','aircon','kitchen'].map(k=>{const v=a.amenities?.[k];if(v!=null&&typeof v!=='boolean')throw invalid('Sadržaj apartmana mora biti potvrđen s Da / Ne.');return [k,v??null]}));if(!row.name||capacity(row)<1||capacity(row)>40)throw invalid('Provjerite naziv i kapacitet apartmana.');return row});
  if(new Set(result.apartments.map(a=>a.slug)).size!==result.apartments.length)throw invalid('Oznake apartmana moraju biti jedinstvene.');
  if(!Array.isArray(input.photos)||!input.photos.length||input.photos.length>300)throw invalid('Provjerite popis fotografija.');
  const categories=new Set(['house','location',...result.apartments.map(a=>a.slug)]);
  result.photos=input.photos.map(p=>{let url=p.url||null;if(url){if(/^\/api\/photo\?id=[a-f0-9-]{36}\.(?:jpg|png|webp)$/.test(url)){}else if(allowDataImages&&/^data:image\/(?:jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(url)&&url.length<1200000){}else if(/^https:\/\/upload\.wikimedia\.org\/wikipedia\/commons\/(?:thumb\/)?[a-f0-9]\/[a-f0-9]{2}\/[^?#]+\.(?:jpg|jpeg|png|webp)$/i.test(url)){}else throw invalid('Fotografiju dodajte putem prijenosa datoteke ili koristite Wikimedia Commons.');}const file=text(p.file,120);if(file&&!/^[a-zA-Z0-9_.-]+\.(?:jpg|jpeg|png|webp)$/.test(file))throw invalid('Neispravna datoteka fotografije.');if(!url&&!file)throw invalid('Nedostaje fotografija.');if(!categories.has(p.category))throw invalid('Neispravna kategorija fotografije.');return {key:slug(p.key),file,url,alt:text(p.alt,300)||'',altEn:text(p.altEn,300)||'',altDe:text(p.altDe,300)||'',category:p.category,illustrative:typeof p.illustrative==='boolean'?p.illustrative:p.category!=='location'}});
  if(new Set(result.photos.map(p=>p.key)).size!==result.photos.length)throw invalid('Oznake fotografija moraju biti jedinstvene.');
  for(const a of result.apartments)if(!result.photos.some(p=>p.key===a.image))throw invalid('Odaberite postojeću naslovnu fotografiju za svaki apartman.');
  for(const [field,fallback] of [['heroImage','hero'],['introImage','beach'],['bannerImage','sunset']]){result[field]=slug(input[field]||fallback);if(!result.photos.some(p=>p.key===result[field]))throw invalid('Odaberite postojeće fotografije za naslovnicu.');}
  result.photoCredits=Array.isArray(input.photoCredits)?input.photoCredits.slice(0,100).map(c=>({file:text(c.file,120),title:text(c.title,250),author:text(c.author,200),source:https(c.source),license:text(c.license,100),licenseUrl:https(c.licenseUrl)})):[];
  result.reviews=[];result.faq=(input.faq||[]).slice(0,30).map(f=>({question:localized(f.question),answer:localized(f.answer)}));
  result.guide=(input.guide||[]).slice(0,30).map(g=>({title:localized(g.title),description:localized(g.description),category:slug(g.category),photo:slug(g.photo),url:https(g.url),mapUrl:https(g.mapUrl)}));
  return result;
}
export function validateBooking(value,apartments){if(!apartments.some(a=>a.slug===value.apartment)||!interval(value.arrival,value.departure))throw invalid('Provjerite apartman i datume zauzeća.');return {id:value.id||null,apartment:value.apartment,arrival:value.arrival,departure:value.departure,note:text(value.note,500)||''}}
export function validateInquiry(v,site,today){if(!v||v.consent!==true||v.website)throw invalid('Provjerite privolu i polja obrasca.');const name=text(v.name,120);if(!name||!email(v.email)||!interval(v.arrival,v.departure)||v.arrival<today)throw invalid('Provjerite ime, email i datume.');const a=site.apartments.find(a=>a.slug===v.apartment);if(v.apartment&&!a)throw invalid('Apartman ne postoji.');const adults=integer(v.adults,1,40),children=integer(v.children||0,0,40);if(a&&adults+children>capacity(a))throw invalid('Broj gostiju prelazi kapacitet apartmana.');if(!/^[a-f0-9-]{36}$/.test(v.id||''))throw invalid('Neispravna oznaka upita.');return {id:v.id,name,email:v.email.trim().toLowerCase(),phone:text(v.phone,50)||'',apartment:a?.slug||'',arrival:v.arrival,departure:v.departure,adults,children,message:text(v.message,5000)||'',language:['hr','en','de'].includes(v.language)?v.language:'hr',consent:true}}
export function quote(a,arrival,departure){if(!interval(arrival,departure))return null;let total=0,minNights=1;for(let d=arrival;d<departure;d=addDays(d,1)){const s=(a.seasons||[]).find(s=>s.from<=d&&d<s.to);if(!s)return null;total+=s.nightly;minNights=Math.max(minNights,s.minNights)}return {total:Math.round(total*100)/100,nights:nights(arrival,departure),minNights,meetsMinimum:nights(arrival,departure)>=minNights}}

export const INQUIRY_STATUSES={new:'Novi',offered:'Ponuda poslana',replied:'Odgovoreno',confirmed:'Potvrđeno',cancelled:'Otkazano',archived:'Arhivirano'};
export function validateInquiryUpdate(value){
 if(!value||! /^[a-f0-9-]{36}$/.test(value.id||'')||!Object.hasOwn(INQUIRY_STATUSES,value.status))throw invalid('Neispravan status ili oznaka upita.');
 return {id:value.id,status:value.status,internalNote:text(value.internalNote,5000)||'',workflowRevision:integer(value.workflowRevision,0,Number.MAX_SAFE_INTEGER-1)};
}
