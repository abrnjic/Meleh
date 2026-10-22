import {publicSite,publishedApartments} from './publication.js';
// Shared SEO model: server HTML and client navigation use the same canonical data.
export const SEO_LANGUAGES=['hr','en','de','cs'];
export const SEO_ROUTES={
 '/':['Apartmani uz more na Pelješcu','Seafront apartments on Pelješac','Apartments am Meer auf Pelješac','Apartmány u moře na Pelješci'],
 '/apartmani':['Apartmani i cijene na Pelješcu','Apartments and prices on Pelješac','Apartments und Preise auf Pelješac','Apartmány a ceny na Pelješci'],
 '/o-nama':['Kuća i okućnica u Luci Dubravi','Our house and garden in Luka Dubrava','Haus und Garten in Luka Dubrava','Dům a zahrada v Luce Dubravě'],
 '/galerija':['Galerija apartmana, kuće i plaža','Apartment, house and beach photo albums','Fotoalben der Apartments, des Hauses und der Strände','Fotoalba apartmánů, domu a pláží'],
 '/kontakt':['Kontakt i upit za smještaj','Contact and accommodation enquiries','Kontakt und Unterkunftsanfrage','Kontakt a poptávka ubytování'],
 '/vodic':['Vodič kroz Pelješac','Pelješac travel guide','Reiseführer für Pelješac','Průvodce Pelješcem'],
 '/faq':['Česta pitanja o boravku','Frequently asked questions about your stay','Häufige Fragen zu Ihrem Aufenthalt','Časté otázky k pobytu'],
 '/dostupnost':['Dostupnost apartmana','Apartment availability','Verfügbarkeit der Apartments','Dostupnost apartmánů'],
 '/usporedba':['Usporedite apartmane','Compare apartments','Apartments vergleichen','Porovnejte apartmány'],
 '/pronadi-apartman':['Pronađite apartman za svoj odmor','Find an apartment for your holiday','Finden Sie Ihr Urlaubsapartment','Najděte apartmán pro svou dovolenou'],
 '/plan-dana':['Isplanirajte dan na Pelješcu','Plan your day on Pelješac','Planen Sie Ihren Tag auf Pelješac','Naplánujte si den na Pelješci'],
 '/privatnost':['Pravila privatnosti','Privacy notice','Datenschutzhinweise','Ochrana osobních údajů'],
 '/uvjeti':['Uvjeti korištenja','Terms of use','Nutzungsbedingungen','Podmínky použití']
};
export const seoText=(value,language='hr')=>typeof value==='string'?value:value?.[language]||value?.hr||'';
export const seoPath=value=>{const path=String(value||'/').split('?')[0].replace(/\/+$/,'')||'/';return /^\/(?:[a-z0-9-]+(?:\/[a-z0-9-]+)*)?$/.test(path)?path:'/404'};
export function seoPages(site){return [...Object.keys(SEO_ROUTES),...publishedApartments(site).map(a=>'/apartmani/'+a.slug)]}
export function localizedUrl(path,language='hr',origin='https://meleh.vercel.app'){const u=new URL(seoPath(path),origin);if(language!=='hr'&&SEO_LANGUAGES.includes(language))u.searchParams.set('lang',language);return u.href}
const clean=(value,max)=>{if(value==null||value==='')return '';if(typeof value!=='string'||value.length>max||/[<>\u0000-\u001f]/.test(value))throw Object.assign(new Error('Provjerite SEO tekst i dopuštenu duljinu.'),{status:400});return value.trim()};
const localized=(value,max)=>Object.fromEntries(SEO_LANGUAGES.map(l=>[l,clean(value?.[l],max)]));
// Preserve saved SEO settings while updating the renamed primary property's display name.
const brandText=(value,site)=>site.name==='Adria Maja Apartmani'&&typeof value==='string'?value.replace(/Meleh (?:Apartmani|Apartments)/g,site.name):value;
export function validateSeo(input,site){
 if(input!=null&&(typeof input!=='object'||Array.isArray(input)))throw Object.assign(new Error('Neispravne SEO postavke.'),{status:400});
 const source=input||{};const s={...source,titleSuffix:brandText(source.titleSuffix,site),description:Object.fromEntries(SEO_LANGUAGES.map(l=>[l,brandText(source.description?.[l],site)])),pages:Object.fromEntries(Object.entries(source.pages||{}).map(([path,p])=>[path,p&&typeof p==='object'&&!Array.isArray(p)?{...p,title:Object.fromEntries(SEO_LANGUAGES.map(l=>[l,brandText(p.title?.[l],site)])),description:Object.fromEntries(SEO_LANGUAGES.map(l=>[l,brandText(p.description?.[l],site)]))}:p]))};let origin;try{const u=new URL(s.siteUrl||'https://meleh.vercel.app');if(u.protocol!=='https:'||u.username||u.password||u.search||u.hash||u.pathname!=='/'||u.hostname==='localhost'||!u.hostname.includes('.'))throw Error();origin=u.origin}catch{throw Object.assign(new Error('SEO adresa mora biti HTTPS domena bez putanje, npr. https://meleh.vercel.app.'),{status:400})}
 const image=value=>{if(!value)return '';if(typeof value!=='string'||!site.photos.some(p=>p.key===value))throw Object.assign(new Error('Odaberite postojeću SEO fotografiju.'),{status:400});return value};
 const token=value=>{const v=clean(value,300);if(v&&!/^[a-zA-Z0-9_-]+$/.test(v))throw Object.assign(new Error('Unesite samo verifikacijski kod, bez HTML oznake.'),{status:400});return v};
 const pages={};for(const path of seoPages(site)){const p=s.pages?.[path];if(!p)continue;if(typeof p!=='object'||Array.isArray(p))throw Object.assign(new Error('Neispravne SEO postavke stranice.'),{status:400});pages[path]={title:localized(p.title,120),description:localized(p.description,320),image:image(p.image),noindex:p.noindex===true}}
 return {siteUrl:origin,titleSuffix:clean(s.titleSuffix||site.name,100),description:localized(s.description,320),image:image(s.image),googleVerification:token(s.googleVerification),bingVerification:token(s.bingVerification),pages};
}
export function pageSeo(site,path,language='hr',{preview=false}={}){
 site=publicSite(site);path=seoPath(path);language=SEO_LANGUAGES.includes(language)?language:'hr';const l=SEO_LANGUAGES.indexOf(language),a=site.apartments?.find(a=>path==='/apartmani/'+a.slug),known=seoPages(site).includes(path),privatePage=['/admin','/gost'].includes(path),s=site.seo||{},p=s.pages?.[path]||{};
 const generic=[`Šest apartmana u Luci Dubravi na Pelješcu, uz more. Terasa i balkon, kuhinja, Wi-Fi i privatni parking. Pogledajte fotografije, cijene i pošaljite upit.`,`Six apartments by the sea in Luka Dubrava, Pelješac. Terrace and balcony, kitchen, Wi-Fi and private parking. View photos and prices and enquire about your stay.`,`Sechs Apartments am Meer in Luka Dubrava auf Pelješac. Terrasse und Balkon, Küche, WLAN und Privatparkplatz. Fotos, Preise und direkte Anfrage.`,`Šest apartmánů u moře v Luce Dubravě na Pelješci. Terasa a balkon, kuchyň, Wi-Fi a soukromé parkování. Fotografie, ceny a přímá poptávka.`][l];
 const name=a?[`Apartman ${a.name} — Pelješac`,`Apartment ${a.name} — Pelješac`,`Apartment ${a.name} — Pelješac`,`Apartmán ${a.name} — Pelješac`][l]:SEO_ROUTES[path]?.[l]|| (privatePage?(path==='/admin'?'Administracija':'Vodič za goste'):['Stranica nije pronađena','Page not found','Seite nicht gefunden','Stránka nenalezena'][l]);
 const description=p.description?.[language]|| (a?seoText(a.description,language).slice(0,300):s.description?.[language])||(path==='/'?generic:name+'. '+generic);
 const photo=site.photos?.find(photo=>photo.key===(p.image||(a?.image)||s.image||site.heroImage))||site.photos?.[0];
 const origin=s.siteUrl||'https://meleh.vercel.app',canonical=localizedUrl(path,language,origin),title=(p.title?.[language]||name)+' | '+(s.titleSuffix||site.name||'Adria Maja Apartmani');
 return {path,language,title:brandText(title,site),description:brandText(description,site),canonical,image:photo?new URL(photo.url||'/assets/'+photo.file,origin).href:null,imageAlt:photo?(photo[['alt','altEn','altDe','altCs'][l]]||photo.alt):'',noindex:preview||privatePage||!known||p.noindex===true,known,privatePage,apartment:a,origin,alternates:known&&!privatePage?SEO_LANGUAGES.map(language=>({language,url:localizedUrl(path,language,origin)})):[]};
}
const escape=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function structuredData(site,meta){site=publicSite(site);
 if(meta.noindex)return null;const root=meta.origin,local=v=>seoText(v,meta.language),business={'@type':'LodgingBusiness','@id':root+'/#lodging',name:site.name,url:root+'/',description:local(site.aboutText),address:{'@type':'PostalAddress',streetAddress:site.address,addressCountry:'HR'},telephone:site.phone,image:meta.image,sameAs:[site.instagram,site.facebook].filter(Boolean)},website={'@type':'WebSite','@id':root+'/#website',url:root+'/',name:site.name,inLanguage:SEO_LANGUAGES};
 const graph=[business,website,{'@type':'WebPage','@id':meta.canonical+'#page',url:meta.canonical,name:meta.title,description:meta.description,inLanguage:meta.language,isPartOf:{'@id':website['@id']},about:{'@id':business['@id']}}];
 if(meta.path!=='/'){const crumbs=[{'@type':'ListItem',position:1,name:['Naslovnica','Home','Startseite','Úvod'][SEO_LANGUAGES.indexOf(meta.language)],item:localizedUrl('/',meta.language,root)}];if(meta.apartment)crumbs.push({'@type':'ListItem',position:2,name:SEO_ROUTES['/apartmani'][SEO_LANGUAGES.indexOf(meta.language)],item:localizedUrl('/apartmani',meta.language,root)});crumbs.push({'@type':'ListItem',position:crumbs.length+1,name:meta.apartment?.name||meta.title.split(' | ')[0],item:meta.canonical});graph.push({'@type':'BreadcrumbList',itemListElement:crumbs})}
 if(meta.apartment){const a=meta.apartment;graph.push({'@type':'Apartment','@id':meta.canonical+'#apartment',name:a.name,url:meta.canonical,image:meta.image,description:local(a.description),numberOfBedrooms:a.rooms,floorSize:{'@type':'QuantitativeValue',value:a.area,unitCode:'MTK'},containedInPlace:{'@id':business['@id']},amenityFeature:Object.entries(a.amenities||{}).filter(([,v])=>v===true).map(([name])=>({'@type':'LocationFeatureSpecification',name,value:true}))})}
 if(meta.path==='/faq')graph.push({'@type':'FAQPage',mainEntity:site.faq.filter(f=>local(f.question)&&local(f.answer)).map(f=>({'@type':'Question',name:local(f.question),acceptedAnswer:{'@type':'Answer',text:local(f.answer)}}))});
 return {'@context':'https://schema.org','@graph':graph};
}
export function seoHead(site,meta){const attrs=(name,value,property=false)=>`<meta data-seo ${property?'property':'name'}="${name}" content="${escape(value)}">`;const robots=meta.noindex?'noindex, nofollow':'index, follow, max-image-preview:large';let out=`<title data-seo>${escape(meta.title)}</title>`+attrs('description',meta.description)+attrs('robots',robots)+`<link data-seo rel="canonical" href="${escape(meta.canonical)}">`;
 if(!meta.noindex){out+=meta.alternates.map(a=>`<link data-seo rel="alternate" hreflang="${a.language}" href="${escape(a.url)}">`).join('');out+=`<link data-seo rel="alternate" hreflang="x-default" href="${escape(localizedUrl(meta.path,'hr',meta.origin))}">`}
 for(const [name,value] of Object.entries({'og:type':'website','og:title':meta.title,'og:description':meta.description,'og:url':meta.canonical,'og:site_name':site.name,'og:locale':{hr:'hr_HR',en:'en_GB',de:'de_DE',cs:'cs_CZ'}[meta.language]}))out+=attrs(name,value,true);
 out+=attrs('twitter:card',meta.image?'summary_large_image':'summary')+attrs('twitter:title',meta.title)+attrs('twitter:description',meta.description);
 if(meta.image)out+=attrs('og:image',meta.image,true)+attrs('og:image:alt',meta.imageAlt,true)+attrs('twitter:image',meta.image)+attrs('twitter:image:alt',meta.imageAlt);
 if(site.seo?.googleVerification)out+=attrs('google-site-verification',site.seo.googleVerification);if(site.seo?.bingVerification)out+=attrs('msvalidate.01',site.seo.bingVerification);
 const cover=meta.apartment?.image||(meta.path==='/'?site.heroImage:meta.path==='/o-nama'?site.introImage:null);const coverPhoto=site.photos?.find(p=>p.key===cover);if(coverPhoto)out+=`<link data-seo rel="preload" as="image" fetchpriority="high" href="${escape(new URL(coverPhoto.url||'/assets/'+coverPhoto.file,meta.origin).href)}">`;
 const schema=structuredData(site,meta);if(schema)out+=`<script data-seo type="application/ld+json">${JSON.stringify(schema).replace(/</g,'\\u003c')}</script>`;return out;
}
export function updateSeoDocument(site,path,language,document,options={}){const meta=pageSeo(site,path,language,options);document.head.querySelectorAll('[data-seo],title,meta[name="description"],meta[name="robots"],link[rel="canonical"],link[hreflang]').forEach(e=>e.remove());document.head.insertAdjacentHTML('beforeend',seoHead(site,meta));document.documentElement.lang=meta.language;return meta}
