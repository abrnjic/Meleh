import {renderSeoHtml,sitemapXml,robotsTxt} from '../server/seo.js';
import {build} from 'esbuild';
import fs from 'node:fs/promises';
import vm from 'node:vm';
import {validateContent} from '../dist/model.js';
import {applyPhotoLibrary} from '../dist/photo-library.js';
await build({entryPoints:['client/google-auth.js'],outfile:'dist/auth.js',bundle:true,format:'esm',platform:'browser',target:'es2022',minify:true,legalComments:'eof'});
const specification=JSON.parse(await fs.readFile('config/property-specification.json','utf8'));
const content=(await fs.readFile('dist/content.js','utf8')).replace(/const propertySpecification=[^\n]*;/,()=> 'const propertySpecification='+JSON.stringify(specification)+';');
await fs.writeFile('dist/content.js',content);
const sandbox={window:{}};vm.runInNewContext(content,sandbox);
const site=validateContent(applyPhotoLibrary(JSON.parse(JSON.stringify(sandbox.window.SITE))));
await fs.mkdir('server',{recursive:true});await fs.writeFile('server/default-site.json',JSON.stringify(site,null,2)+'\n');
const source=await fs.readFile('server/page-template.html','utf8');
await fs.rm('dist/fotografije',{recursive:true,force:true});
const preview=process.env.VERCEL_ENV==='preview';
await fs.writeFile('dist/index.html',renderSeoHtml(source,site,'/','hr',{preview}).html);
for(const route of ['pronadi-apartman','plan-dana','kako-do-nas','gost','apartmani','usporedba','o-nama','galerija','kontakt','privatnost','uvjeti','vodic','faq','dostupnost','admin',...site.apartments.map(a=>'apartmani/'+a.slug)]){await fs.mkdir('dist/'+route,{recursive:true});await fs.writeFile('dist/'+route+'/index.html',renderSeoHtml(source,site,'/'+route,'hr',{preview}).html)}
await fs.writeFile('dist/404.html',renderSeoHtml(source,site,'/404','hr',{preview}).html);
await fs.writeFile('dist/robots.txt',robotsTxt(site));await fs.writeFile('dist/sitemap.xml',sitemapXml(site,{preview}));
// Vercel checks existing static files before rewrites. Keep HTML snapshots for
// local static previews, but let production routes reach the live SEO handler.
if(process.env.VERCEL==='1'){for(const route of ['', 'pronadi-apartman','plan-dana','kako-do-nas','gost','apartmani','usporedba','o-nama','galerija','kontakt','privatnost','uvjeti','vodic','faq','dostupnost','admin']){if(route)await fs.rm('dist/'+route,{recursive:true,force:true});else await fs.rm('dist/index.html',{force:true})}for(const file of ['sitemap.xml','robots.txt'])await fs.rm('dist/'+file,{force:true})}
console.log('Built server-rendered entry pages, SEO metadata, sitemap and validated default content.');
