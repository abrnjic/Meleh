import test from 'node:test';import assert from 'node:assert/strict';
import site from '../server/default-site.json' with {type:'json'};
import {translateCs,LANGUAGES,LOCALES} from '../dist/i18n.js';
import {clone,validateContent,validateInquiry} from '../dist/model.js';
import {enquiryText} from '../dist/stay-tools.js';
import {inquiryReply} from '../dist/inquiry-inbox.js';
import {messages} from '../server/mail.js';
import {guideSettings} from '../server/guest-guide.js';
import {guideContent} from '../dist/host-tools.js';
import {readSiteData,destinationRevision,catalogueRevision,photoLibraryRevision,apartmentNamesRevision,amenitiesRevision,specificationRevision,viewsRevision,productionPhotoRevision,languageRevision} from '../server/destination.js';
import {memoryDb} from './memory-db.mjs';
test('Czech copy covers apartment facts, dynamic captions and persisted editor content',()=>{
 assert.ok(LANGUAGES.includes('cs'));assert.equal(LOCALES.cs,'cs-CZ');assert.equal(translateCs('Make an enquiry'),'Poslat poptávku');assert.equal(translateCs('Capacity: 2 standard beds + 1 extra bed.'),'Kapacita: 2 základní lůžka + 1 přistýlka.');assert.equal(translateCs('Apartment A-3 — photograph 1'),'Apartmán A-3 — fotografie 1');
 for(const a of site.apartments){assert.match(a.description.cs,/výhled na moře i do zahrady/);assert.ok(a.description.cs.startsWith('Apartmán '+a.name));}
 for(const row of [...site.faq.map(f=>f.answer),...site.guide.map(g=>g.description),...site.nearby.map(x=>x.label)])assert.ok(row.cs);
 const edited=clone(site);edited.apartments[0].description.cs='Vlastní český popis';assert.equal(validateContent(edited).apartments[0].description.cs,'Vlastní český popis');
});
test('Czech enquiries, reply templates, mail and private guide keep the guest language',()=>{
 const i=validateInquiry({id:'12345678-1234-1234-1234-123456789012',name:'Jan Novák',email:'jan@example.test',apartment:'a-3',arrival:'2027-07-01',departure:'2027-07-08',adults:2,children:1,language:'cs',consent:true},site,'2026-10-20');assert.equal(i.language,'cs');assert.match(enquiryText({...i,apartment:'A-3'}),/Prosím o potvrzení dostupnosti/);assert.match(inquiryReply(i,site),/Tato zpráva není potvrzením rezervace/);assert.equal(messages(i,site).guest.subject,'Vaše poptávka byla přijata');
 const guide=guideSettings({texts:{cs:{arrival:'Příjezd k domu'}}});assert.equal(guide.texts.cs.arrival,'Příjezd k domu');assert.match(guideContent(guide,'cs',x=>x),/Heslo k Wi-Fi/);
});
test('Czech migration adds translations once without changing photos, prices or later edits',async()=>{
 const before=clone(site);for(const a of before.apartments)delete a.description.cs;delete before.aboutText.cs;before.apartments[0].seasons[0].nightly=75;
 const db=memoryDb({'site/public':{revision:11,destinationRevision,catalogueRevision,photoLibraryRevision,apartmentNamesRevision,amenitiesRevision,specificationRevision,viewsRevision,productionPhotoRevision,data:before}});
 const first=await readSiteData(db,site);assert.equal(first.revision,12);assert.equal(first.languageRevision,languageRevision);assert.ok(first.data.aboutText.cs);assert.equal(first.data.apartments[0].seasons[0].nightly,75);assert.equal(first.data.photos.length,before.photos.length);
 db.data.get('site/public').data.apartments[0].description.cs='Text hostitele';const again=await readSiteData(db,site);assert.equal(again.revision,12);assert.equal(again.data.apartments[0].description.cs,'Text hostitele');
});
