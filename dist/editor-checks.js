import {validateContent,date,validateSeasons} from './model.js';
// Check raw input: normalization deliberately supplies some translated fallbacks.
export function checkContent(site,{allowDataImages=false}={}){
 const rows=[],add=(severity,message,tab,field='',scope=null)=>rows.push({severity,message,tab,field,scope});
 const filled=value=>typeof value==='string'&&Boolean(value.trim());
 const photos=new Set((site.photos||[]).map(p=>p.key));
 if(!filled(site.name))add('error','Unesite naziv objekta.','settings','name');
 if(!site.email&&!site.phone)add('warning','Dodajte barem email ili telefon za kontakt gostiju.','settings','email');
 if(!site.address)add('warning','Adresa objekta nije unesena.','settings','address');
 for(const a of site.apartments||[]){
  const name=a.name||a.slug||'Apartman',scope=a.slug;
  if(!photos.has(a.image))add('error',name+': odaberite postojeću naslovnu fotografiju.','apartments','image',scope);
  try{validateSeasons(a.seasons)}catch(error){add('error',name+': '+error.message,'apartments','season-from-0',scope)}
  if(a.published===false)continue;
  for(const lang of ['hr','en','de','cs'])if(!filled(typeof a.description==='string'?(lang==='hr'?a.description:''):a.description?.[lang]))add('warning',name+': nedostaje opis na jeziku '+lang.toUpperCase()+'.','apartments','description_'+lang,scope);
  if(!a.seasons?.length)add('warning',name+': nema sezonskog cjenika; gost vidi cijenu na upit.','apartments','minNights',scope);
  const seasons=(a.seasons||[]).filter(s=>date(s.from)&&date(s.to)).sort((a,b)=>a.from.localeCompare(b.from));
  for(let i=1;i<seasons.length;i++)if(seasons[i-1].to<seasons[i].from)add('warning',name+': cijena nije unesena od '+seasons[i-1].to+' do '+seasons[i].from+' (datum odjave).','apartments','season-from-'+a.seasons.indexOf(seasons[i]),scope);
 }
 for(const [i,p] of (site.photos||[]).entries())if(!filled(p.alt))add('warning','Fotografija '+(i+1)+': nedostaje opis za pristupačnost.','photos','photo-alt-'+i,p.category);
 for(const kind of ['faq','guide'])for(const [i,row] of (site[kind]||[]).entries())for(const lang of ['hr','en','de','cs']){const fields=kind==='faq'?['question','answer']:['title','description'];if(fields.some(k=>!filled(row[k]?.[lang])))add('warning',(kind==='faq'?'Često pitanje ':'Preporuka vodiča ')+(i+1)+': nedostaje sadržaj na jeziku '+lang.toUpperCase()+'.','editorial',(kind==='faq'?'faq-q-':'guide-title-')+i+'-'+lang)}
 for(const lang of ['hr','en','de','cs'])if(!filled(site.seo?.description?.[lang]))add('warning','SEO: nije unesen zadani meta opis na jeziku '+lang.toUpperCase()+'. Koristit će se automatski opis.','seo','seo-default-'+lang);
 if(!site.seo?.siteUrl)add('warning','Provjerite glavnu produkcijsku domenu u SEO postavkama.','seo','seo-siteUrl');
 try{validateContent(site,{allowDataImages,allowEmptyCatalogue:true})}catch(error){if(!rows.some(r=>r.severity==='error'&&r.message.includes(error.message)))add('error',error.message,'settings')}
 return rows;
}
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function checksMarkup(rows){const errors=rows.filter(r=>r.severity==='error').length;return `<p><strong>${errors} pogrešaka · ${rows.length-errors} upozorenja</strong></p><p>Upozorenja ne sprječavaju objavu. Praznine u cjeniku mogu biti namjerne; provjerite ih prije objave.</p><ul class="editor-check-list">${rows.map((row,i)=>`<li data-severity="${row.severity}"><span><strong>${row.severity==='error'?'Pogreška':'Upozorenje'}</strong> — ${esc(row.message)}</span><button type="button" class="btn outline" data-content-issue="${i}">Uredi ↗</button></li>`).join('')||'<li>Provjere nisu pronašle poteškoće. Pregledajte izgled stranice prije objave.</li>'}</ul>`}
