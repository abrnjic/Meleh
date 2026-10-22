import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {IDENTITY_DEFAULTS,IDENTITY_PRESETS,validateIdentity,applyIdentity,identityMarkup} from '../dist/identity.js';
import {validateContent} from '../dist/model.js';
import {renderSeoHtml} from '../server/seo.js';
import {publicSiteRecord} from '../server/site-record.js';
import {readSiteData} from '../server/destination.js';
import {memoryDb} from './memory-db.mjs';
const defaults=JSON.parse(await fs.readFile(new URL('../server/default-site.json',import.meta.url),'utf8'));
const template=await fs.readFile(new URL('../server/page-template.html',import.meta.url),'utf8');
const esc=s=>String(s).replace(/[&<>"']/g,c=>`&#${c.charCodeAt(0)};`);
test('identity validates presets and rejects unsafe content, uploads and unreadable colors',()=>{
 for(const preset of Object.values(IDENTITY_PRESETS))assert.deepEqual(validateIdentity(preset.branding),preset.branding);
 for(const changes of [{accent:'red;display:none'},{logoUrl:'https://example.com/logo.png'},{logoUrl:'data:image/svg+xml,<svg>'},{logoUrl:'/assets/../secret.svg'},{subtitle:'<script>'},{accent:'#ffffff'},{ink:'#eeeeee'},{surface:'#111111'},{theme:'dark'}])assert.throws(()=>validateIdentity({...IDENTITY_DEFAULTS,...changes}));
 assert.equal(validateIdentity({logoUrl:'/api/photo?id=aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa.png'}).logoUrl,'/api/photo?id=aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa.png');
});
test('one identity change updates SEO and copy while preserving catalogue, URLs, photos and rates',()=>{
 const site=validateContent(structuredClone(defaults));site.seo.pages['/']={title:{hr:'Adria Maja Apartmani · odmor'},description:{hr:'Odmor u Adria Maja Apartmani'}};site.seo.googleVerification='keep-token';
 const next=validateContent(applyIdentity(site,{name:'Villa More',branding:IDENTITY_PRESETS.meleh.branding}));
 assert.equal(next.name,'Villa More');assert.equal(next.seo.titleSuffix,'Villa More');assert.equal(next.seo.pages['/'].title.hr,'Villa More · odmor');assert.equal(next.seo.googleVerification,'keep-token');assert.equal(next.seo.siteUrl,site.seo.siteUrl);
 for(const key of ['apartments','photos','heroImage','distances','address'])assert.deepEqual(next[key],site[key]);
 assert.equal(site.name,'Adria Maja Apartmani');
});
test('saved identity survives record migration and is present in initial SEO HTML',async()=>{
 const site=validateContent(applyIdentity(defaults,{name:'Villa More',branding:{...IDENTITY_DEFAULTS,logoUrl:'/assets/meleh-symbol.svg',faviconUrl:'/assets/meleh-symbol.svg',accent:'#005a88',theme:'adria'}}));
 const record=publicSiteRecord(site,27);const db=memoryDb({'site/public':record});const read=await readSiteData(db);assert.equal(read.data.name,'Villa More');assert.equal(read.revision,27);
 const {html}=renderSeoHtml(template,read.data,'/');assert.match(html,/aria-label="Villa More"/);assert.match(html,/src="\/assets\/meleh-symbol.svg"/);assert.match(html,/rel="icon" href="\/assets\/meleh-symbol.svg"/);assert.match(html,/--accent:#005a88/);assert.match(html,/<title[^>]*>[^<]*Villa More/);
});
test('text-only and full logos render without duplicate names and escape admin-entered names',()=>{
 const full=identityMarkup({name:'Villa "More"',branding:{...IDENTITY_DEFAULTS,logoMode:'full'}},esc);assert.ok(!full.includes('class="brand-name"'));assert.match(full,/alt="Villa &#34;More&#34;"/);
 const text=identityMarkup({name:'Villa More',branding:{...IDENTITY_DEFAULTS,logoUrl:''}},esc);assert.ok(!text.includes('<img'));assert.match(text,/Villa More/);
});
test('CMS save and publication retain complete identity and archive the former identity',async()=>{
 const {saveCmsDraft,publishContent,listCmsHistory}=await import('../server/cms.js');
 const db=memoryDb({'site/public':publicSiteRecord(defaults,4)}),user={uid:'admin'};
 const data=validateContent(applyIdentity(defaults,{name:'Kuća Jadran',branding:{...IDENTITY_DEFAULTS,logoUrl:'/assets/meleh-symbol.svg',font:'modern',theme:'adria'}}));
 const saved=await saveCmsDraft(db,{data,revision:0,baseRevision:4},user);
 await publishContent(db,{revision:4,draftRevision:saved.revision},user,{draft:true});
 const read=await readSiteData(db);assert.equal(read.data.name,'Kuća Jadran');assert.deepEqual(read.data.branding,data.branding);assert.deepEqual(read.data.apartments,defaults.apartments);assert.ok((await listCmsHistory(db)).versions.length>0);
});
