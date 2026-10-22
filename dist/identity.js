// Public identity is data. No arbitrary CSS, HTML, scripts or external logo URLs.
export const IDENTITY_DEFAULTS=Object.freeze({logoUrl:'/assets/adria-maja-symbol.svg',faviconUrl:'/assets/favicon.svg',logoMode:'symbol',subtitle:'APARTMANI · PELJEŠAC',accent:'#066b9b',surface:'#dcedf9',ink:'#173f59',font:'classic',theme:'classic'});
export const IDENTITY_PRESETS=Object.freeze({adria:{name:'Adria Maja Apartmani',branding:{...IDENTITY_DEFAULTS}},meleh:{name:'Meleh Apartmani',branding:{...IDENTITY_DEFAULTS,logoUrl:'/assets/meleh-symbol.svg',faviconUrl:'/assets/meleh-symbol.svg',subtitle:'APARTMANI',accent:'#086b96',surface:'#e5f3fb'}}});
const invalid=message=>Object.assign(new Error(message),{status:400});
export function contrast(a,b){const luminance=hex=>{const rgb=hex.slice(1).match(/../g).map(v=>parseInt(v,16)/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4);return .2126*rgb[0]+.7152*rgb[1]+.0722*rgb[2]};const x=luminance(a),y=luminance(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05)}
export function validateIdentity(value){
 if(value!=null&&(typeof value!=='object'||Array.isArray(value)))throw invalid('Neispravan identitet stranice.');
 const b={...IDENTITY_DEFAULTS,...value};
 for(const k of ['accent','surface','ink']){if(typeof b[k]!=='string'||!/^#[a-f0-9]{6}$/i.test(b[k]))throw invalid('Boje unesite u obliku #006b9b.');b[k]=b[k].toLowerCase()}
 if(contrast(b.accent,'#ffffff')<4.5||contrast(b.ink,'#ffffff')<4.5||contrast(b.ink,b.surface)<4.5||contrast(b.surface,'#ffffff')>1.6)throw invalid('Odaberite tamniji tekst i naglasak te svijetlu pozadinu radi čitljivosti.');
 for(const k of ['logoUrl','faviconUrl'])if(typeof b[k]!=='string'||(b[k]&&!/^\/assets\/[a-zA-Z0-9_.-]+\.(?:svg|png|jpg|jpeg|webp)$/.test(b[k])&&!/^\/api\/photo\?id=[a-f0-9-]{36}\.(?:png|jpg|webp)$/.test(b[k])))throw invalid('Logo i ikonu dodajte prijenosom JPG, PNG ili WebP datoteke.');
 if(typeof b.subtitle!=='string'||b.subtitle.length>100||/[<>\u0000-\u001f]/.test(b.subtitle))throw invalid('Podnaslov logotipa smije imati najviše 100 znakova.');
 if(!['symbol','full'].includes(b.logoMode)||!['classic','modern'].includes(b.font)||!['classic','adria'].includes(b.theme))throw invalid('Provjerite vrstu logotipa, font i temu.');
 return Object.fromEntries(Object.keys(IDENTITY_DEFAULTS).map(k=>[k,k==='subtitle'?b[k].trim():b[k]]));
}
export function applyIdentity(site,{name,branding}){
 const next=JSON.parse(JSON.stringify(site));const previous=site.name;next.name=name.trim();next.branding=validateIdentity(branding);
 if(next.name&&previous!==next.name){
  const aliases=[previous];if(previous==='Adria Maja Apartmani')aliases.push('Adria Maja Apartments','Apartmány Adria Maja','Adria Maja');if(previous==='Meleh Apartmani')aliases.push('Meleh Apartments','Meleh');
  const rename=v=>typeof v==='string'?aliases.reduce((text,old)=>text.split(old).join(next.name),v):Array.isArray(v)?v.map(rename):v&&typeof v==='object'?Object.fromEntries(Object.entries(v).map(([k,x])=>[k,rename(x)])):v;
  next.aboutText=rename(next.aboutText);next.seo={...next.seo,titleSuffix:next.name,description:rename(next.seo?.description),pages:rename(next.seo?.pages||{})};
 }
 return next;
}
export function identityStyle(branding){const b=validateIdentity(branding);return `--accent:${b.accent};--ink:${b.ink};--cream:${b.surface};--sand:${b.surface};--muted:${b.ink};--serif:${b.font==='modern'?"'DM Sans',Arial,sans-serif":"'Playfair Display',Georgia,serif"}`}
export function identityMarkup(site,esc){const b=validateIdentity(site.branding),word=site.name.replace(/\s+Apartmani$/i,'');return `<a class="brand brand-adria${b.logoMode==='full'&&b.logoUrl?' brand-full':''}" href="/" aria-label="${esc(site.name)}">${b.logoUrl?`<img class="brand-symbol" src="${esc(b.logoUrl)}" alt="${b.logoMode==='full'?esc(site.name):''}" width="48" height="48">`:''}${b.logoMode==='full'&&b.logoUrl?'':`<span class="brand-name">${esc(word)}${b.subtitle?`<span class="brand-sub">${esc(b.subtitle)}</span>`:''}</span>`}</a>`}
export function syncIdentity(site,document){const b=validateIdentity(site.branding),root=document.documentElement;root.dataset.identity='custom';for(const [k,v] of [['--accent',b.accent],['--ink',b.ink],['--cream',b.surface],['--sand',b.surface],['--muted',b.ink],['--serif',b.font==='modern'?"'DM Sans',Arial,sans-serif":"'Playfair Display',Georgia,serif"]])root.style.setProperty(k,v);let icon=document.head.querySelector('link[rel="icon"]');if(!icon){icon=document.createElement('link');icon.rel='icon';document.head.append(icon)}icon.href=b.faviconUrl||'/assets/favicon.svg';icon.removeAttribute('type');const color=document.head.querySelector('meta[name="theme-color"]');if(color)color.content=b.surface;}
