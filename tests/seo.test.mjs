import {captureSeoValues,seoEditorMarkup} from '../dist/seo-editor.js';
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {validateContent,clone} from '../dist/model.js';
import {seoPages,pageSeo,seoHead,structuredData,localizedUrl,seoPath,SEO_LANGUAGES} from '../dist/seo.js';
import {renderSeoHtml,sitemapXml,robotsTxt} from '../server/seo.js';
import {handle} from '../api/index.js';
const defaults=JSON.parse(await readFile(new URL('../server/default-site.json',import.meta.url),'utf8'));
const template=await readFile(new URL('../server/page-template.html',import.meta.url),'utf8');
const site=()=>validateContent(clone(defaults));
test('all public URLs have unique localized titles, canonical URLs and reciprocal language links in initial HTML',()=>{
 const s=site();for(const language of SEO_LANGUAGES){const titles=[];for(const path of seoPages(s)){const {html,meta,status}=renderSeoHtml(template,s,path,language);assert.equal(status,200);assert.equal(meta.noindex,false);assert.equal((html.match(/<title\b/g)||[]).length,1);assert.equal((html.match(/<h1\b/g)||[]).length,1);assert.ok(html.includes(`lang="${language}"`));assert.ok(html.includes(meta.canonical.replace(/&/g,'&amp;')));assert.ok(html.includes('hreflang="cs"'));assert.ok(html.includes('application/ld+json'));titles.push(meta.title)}assert.equal(new Set(titles).size,titles.length)}
});
test('saved SEO fields survive validation, serialization and server rendering without altering rates or photos',()=>{
 const s=site(),prices=clone(s.apartments.map(a=>a.seasons)),photos=clone(s.photos);s.seo.pages['/apartmani/a-3']={title:{hr:'Naš apartman A-3',cs:'Náš apartmán A-3'},description:{hr:'Opis iz administracije za apartman A-3.',cs:'Popis upravený ve správě.'},image:s.photos[1].key,noindex:false};s.seo.googleVerification='safe_verification-code';const saved=validateContent(JSON.parse(JSON.stringify(s)));const result=renderSeoHtml(template,saved,'/apartmani/a-3','cs');assert.match(result.html,/<title data-seo>Náš apartmán A-3/);assert.match(result.html,/Popis upravený ve správě/);assert.match(result.html,/google-site-verification/);assert.deepEqual(saved.apartments.map(a=>a.seasons),prices);assert.deepEqual(saved.photos,photos);assert.equal(pageSeo(saved,'/apartmani/a-3','en').title.includes('Naš apartman'),false);
});
test('metadata overrides reject scripts, arbitrary images, fake origins and verification HTML',()=>{
 for(const change of [s=>s.seo.siteUrl='javascript:alert(1)',s=>s.seo.siteUrl='https://example.com/subpath',s=>s.seo.siteUrl='https://user:secret@example.com',s=>s.seo.googleVerification='<meta name="x">',s=>s.seo.image='not-a-photo',s=>s.seo.pages['/']={title:{hr:'<script>alert(1)</script>'}},s=>s.seo.pages['/']={description:{hr:'x'.repeat(321)}}]){const s=site();change(s);assert.throws(()=>validateContent(s))}
});
test('admin, guest guides, preview deployments and missing pages always remain noindex',()=>{
 const s=site();s.seo.pages['/admin']={noindex:false,title:{hr:'Index me'}};s.seo.pages['/gost']={noindex:false};for(const path of ['/admin','/gost','/missing']){const {html,meta,status}=renderSeoHtml(template,s,path,'en');assert.equal(meta.noindex,true);assert.match(html,/noindex, nofollow/);assert.doesNotMatch(html,/application\/ld\+json/);assert.equal(status,path==='/missing'?404:200)}assert.equal(pageSeo(s,'/','hr',{preview:true}).noindex,true);assert.equal((sitemapXml(s,{preview:true}).match(/<url>/g)||[]).length,0);
});
test('noindex removes all four language variants from sitemap and clearing the flag restores them',()=>{
 const s=site();const before=sitemapXml(s);assert.equal((before.match(/<url>/g)||[]).length,seoPages(s).length*4);s.seo.pages['/galerija']={noindex:true};const excluded=sitemapXml(s);assert.equal(excluded.includes('/galerija'),false);assert.equal((excluded.match(/<url>/g)||[]).length,(seoPages(s).length-1)*4);s.seo.pages['/galerija'].noindex=false;assert.ok(sitemapXml(s).includes('/galerija?lang=cs'));assert.doesNotMatch(before,/\/admin|\/gost|lastmod/);assert.match(robotsTxt(s),/Allow: \/api\/photo/);
});
test('canonical URLs discard enquiry parameters, normalize trailing slashes and resist network-path injection',()=>{
 const s=site();assert.equal(pageSeo(s,'/apartmani/a-3/?arrival=2027-06-01','en').canonical,'https://meleh.vercel.app/apartmani/a-3?lang=en');assert.equal(localizedUrl('/','hr',s.seo.siteUrl),'https://meleh.vercel.app/');assert.equal(seoPath('//evil.example'),'\/404');assert.equal(pageSeo(s,'//evil.example','hr').canonical,'https://meleh.vercel.app/404');
});
test('structured data reflects known apartment facts without inventing ratings, prices or availability',()=>{
 const s=site(),a=s.apartments[0];const schema=structuredData(s,pageSeo(s,'/apartmani/'+a.slug,'en'));const apartment=schema['@graph'].find(x=>x['@type']==='Apartment');assert.equal(apartment.floorSize.value,a.area);assert.equal(apartment.numberOfBedrooms,a.rooms);assert.ok(apartment.amenityFeature.every(f=>a.amenities[f.name]===true));assert.doesNotMatch(JSON.stringify(schema),/"(?:aggregateRating|reviewCount|priceCurrency|availability|offers)":/);const breadcrumbs=schema['@graph'].find(x=>x['@type']==='BreadcrumbList');assert.equal(breadcrumbs.itemListElement.length,3);assert.ok(breadcrumbs.itemListElement.every(x=>x.item.includes('lang=en')));
});
test('server HTML includes actual apartment description, season prices, equipment and host details without JS',()=>{
 const s=site(),a=s.apartments[0],{html}=renderSeoHtml(template,s,'/apartmani/'+a.slug,'en');assert.match(html,/Seasonal nightly prices/);assert.match(html,/Amenities/);assert.ok(html.includes(String(a.seasons[0].nightly)));assert.ok(html.includes(a.seasons[0].from));assert.ok(html.includes('window.SITE='));assert.doesNotMatch(html,/src="\/content.js"/);const faq=renderSeoHtml(template,s,'/faq','hr').html;assert.ok(faq.includes(s.faq[0].question.hr));assert.match(faq,/FAQPage/);
});
test('safe JSON serialization cannot terminate its script element',()=>{
 const s=site();s.aboutText.hr='</script><script>injected()</script>';const {html}=renderSeoHtml(template,s,'/o-nama','hr');assert.equal(html.includes('<script>injected()'),false);assert.match(html,/\\u003c\/script>/);assert.match(html,/&lt;\/script&gt;/);
});
test('public SEO endpoints return HTML, XML, text and real 404 status, and support HEAD',async()=>{
 for(const [route,type] of [['seo-page&path=/apartmani/a-3&lang=de','text/html'],['sitemap.xml','application/xml'],['robots.txt','text/plain']]){const url='https://example.test/api/index?route='+route;const response=await handle(new Request(url));assert.equal(response.status,200);assert.ok(response.headers.get('content-type').startsWith(type));const head=await handle(new Request(url,{method:'HEAD'}));assert.equal(head.status,200);assert.equal(await head.text(),'')}
 const absent=await handle(new Request('https://example.test/api/index?route=seo-page&path=/apartmani/missing'));assert.equal(absent.status,404);assert.match(absent.headers.get('x-robots-tag'),/noindex/);
 const oldAdmin=process.env.ADMIN_EMAIL;process.env.ADMIN_EMAIL='owner@example.test';const privateWrite=await handle(new Request('https://example.test/api/admin',{method:'PUT',headers:{Origin:'https://example.test','Content-Type':'application/json'},body:JSON.stringify({data:{seo:{pages:{'/':{title:{hr:'unauthorized'}}}}}})}));assert.equal(privateWrite.status,401);if(oldAdmin===undefined)delete process.env.ADMIN_EMAIL;else process.env.ADMIN_EMAIL=oldAdmin;
});
test('sharing metadata uses absolute images and escapes quote characters',()=>{
 const s=site();s.seo.pages['/']={title:{hr:'More & "sunce"'},description:{hr:'Domaćin & gosti'},image:s.photos[0].key};const head=seoHead(s,pageSeo(s,'/','hr'));assert.match(head,/og:image/);assert.match(head,/twitter:card/);assert.match(head,/More &amp; &quot;sunce&quot;/);assert.match(head,/fetchpriority="high"/);assert.match(head,/https:\/\/meleh.vercel.app\/assets\//);
});

test('editing another page preserves SEO already entered for other pages and records four languages',()=>{const s=site();s.seo.pages['/']={title:{hr:'Početna'},description:{hr:'Prvi opis'},noindex:false,image:''};const values={'seo-siteUrl':s.seo.siteUrl,'seo-titleSuffix':s.name,'seo-image':'','seo-googleVerification':'token','seo-bingVerification':'','seo-title-hr':'Galerija domaćina','seo-title-cs':'Galerie hostitele','seo-description-en':'House and apartment photo albums.','seo-noindex':'on'};captureSeoValues(values,s,'/galerija');const saved=validateContent(s);assert.equal(saved.seo.pages['/'].title.hr,'Početna');assert.equal(saved.seo.pages['/galerija'].title.cs,'Galerie hostitele');assert.equal(saved.seo.pages['/galerija'].description.en,'House and apartment photo albums.');assert.equal(saved.seo.pages['/galerija'].noindex,true);assert.equal(saved.seo.googleVerification,'token');});
