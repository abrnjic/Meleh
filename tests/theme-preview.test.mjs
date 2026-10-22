import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFile} from 'node:fs/promises';
import {handle} from '../api/index.js';
const script=await readFile(new URL('../dist/theme.js',import.meta.url),'utf8');
function browser(url){
 const nodes=new Map(),listeners={};
 const container={append(node){nodes.set(node.id,node)},prepend(node){nodes.set(node.id,node)}};
 const document={documentElement:{dataset:{}},head:container,body:container,getElementById:id=>nodes.get(id),createElement:()=>({dataset:{},append(){},setAttribute(){},remove(){nodes.delete(this.id)}}),addEventListener:(type,fn)=>{listeners[type]=fn}};
 const window={addEventListener(){}};const localStorage={removeItem(){},setItem(){throw new Error('Preview must not be persisted')}};
 const location={href:url,pathname:new URL(url).pathname,origin:new URL(url).origin};
 vm.runInNewContext(script,{document,window,localStorage,location,URL});
 return {document,window,nodes,location,listeners};
}
test('normal visits keep classic design and do not load trial CSS',()=>{const b=browser('https://example.test/');assert.equal(b.document.documentElement.dataset.design,'classic');assert.equal(b.nodes.size,0)});
test('preview loads only the scoped trial and exit retains language and booking parameters',()=>{const b=browser('https://example.test/apartmani/a-3?lang=cs&arrival=2027-07-01&theme-preview=adria');assert.equal(b.document.documentElement.dataset.design,'adria');assert.equal(b.nodes.get('theme-preview-styles').href,'/themes/adria.css');assert.ok(b.nodes.has('theme-preview-banner'));b.location.href='https://example.test/apartmani/a-3?lang=cs';b.window.MelehTheme.sync();assert.equal(b.document.documentElement.dataset.design,'classic');assert.equal(b.nodes.size,0)});
test('invalid themes and private admin or guest pages never receive trial styles',()=>{for(const path of ['/admin?theme-preview=adria','/gost?theme-preview=adria','/?theme-preview=unknown'])assert.equal(browser('https://example.test'+path).document.documentElement.dataset.design,'classic')});
test('preview follows internal pages but never API or external links',()=>{const b=browser('https://example.test/?theme-preview=adria');for(const [href,expected] of [['https://example.test/galerija?lang=de',true],['https://example.test/api/photo?id=abc',false],['https://outside.test/',false]]){const a={href,dataset:{},getAttribute:()=>href};b.listeners.click({target:{closest:()=>a}});assert.equal(new URL(a.href).searchParams.has('theme-preview'),expected)}});
test('theme preview is noindex while the same public page remains indexable',async()=>{for(const [query,preview] of [['&theme-preview=adria',true],['',false]]){const response=await handle(new Request('https://example.test/api/index?route=seo-page&pagePath=/'+query));assert.equal(response.status,200);assert.equal(response.headers.get('x-robots-tag'),preview?'noindex, nofollow':'index, follow');assert.match(await response.text(),preview?/window.MELEH_PREVIEW=true/:/window.MELEH_PREVIEW=false/)}});
