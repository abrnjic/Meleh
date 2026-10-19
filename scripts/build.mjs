import {build} from 'esbuild';
import fs from 'node:fs/promises';
import vm from 'node:vm';
import {validateContent} from '../dist/model.js';
await build({entryPoints:['client/google-auth.js'],outfile:'dist/auth.js',bundle:true,format:'esm',platform:'browser',target:'es2022',minify:true,legalComments:'eof'});
const sandbox={window:{}};vm.runInNewContext(await fs.readFile('dist/content.js','utf8'),sandbox);
const site=validateContent(JSON.parse(JSON.stringify(sandbox.window.SITE)));
await fs.mkdir('server',{recursive:true});await fs.writeFile('server/default-site.json',JSON.stringify(site,null,2)+'\n');
const source=await fs.readFile('dist/index.html','utf8');
for(const route of ['pronadi-apartman','plan-dana','gost','apartmani','usporedba','o-nama','galerija','kontakt','privatnost','uvjeti','fotografije','vodic','faq','dostupnost','admin',...site.apartments.map(a=>'apartmani/'+a.slug)]){await fs.mkdir('dist/'+route,{recursive:true});await fs.writeFile('dist/'+route+'/index.html',route==='gost'?source.replace('<head>','<head><meta name="robots" content="noindex,nofollow"><meta name="referrer" content="no-referrer">').replace(/<link[^>]+(?:fonts\.googleapis|fonts\.gstatic)[^>]*>/g,''):source)}
await fs.writeFile('dist/404.html',source);
console.log('Built entry pages and validated default content.');
