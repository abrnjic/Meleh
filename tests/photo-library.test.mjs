import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs/promises';
import defaults from '../server/default-site.json' with {type:'json'};
import {clone,validateContent} from '../dist/model.js';
import {applyPhotoLibrary,apartmentPhotographs,isIllustrativePhoto,photoLibraryRevision} from '../dist/photo-library.js';
import {readSiteData,destinationRevision,catalogueRevision} from '../server/destination.js';
import {memoryDb} from './memory-db.mjs';
test('real photographs are isolated to the three explicitly identified apartments',async()=>{
 const site=validateContent(applyPhotoLibrary(defaults));
 for(const [slug,count]of [['a-3',21],['a-4',24],['a-9',14],['a-13',0],['a-8',0],['a-12',0]]){const rows=apartmentPhotographs(site,slug);assert.equal(rows.length,count);const a=site.apartments.find(a=>a.slug===slug);assert.equal(isIllustrativePhoto(site.photos.find(p=>p.key===a.image)),count===0);for(const p of rows){assert.ok(p.file.startsWith(slug+'-'));const bytes=await fs.readFile(new URL('../dist/assets/'+p.file,import.meta.url));assert.equal(bytes.subarray(0,4).toString(),'RIFF');assert.equal(bytes.subarray(8,12).toString(),'WEBP');}}
 assert.equal(new Set(site.photos.map(p=>p.key)).size,site.photos.length);
});
test('photo provenance survives administrator validation and older examples remain marked illustrative',()=>{
 const site=validateContent(defaults);assert.equal(isIllustrativePhoto(site.photos.find(p=>p.category==='a-3')),false);assert.equal(isIllustrativePhoto(site.photos.find(p=>p.category==='a-13')),true);assert.equal(isIllustrativePhoto({category:'a-8'}),true);assert.equal(isIllustrativePhoto({category:'location'}),false);
});
test('photo migration preserves apartment data and later host cover selections',async()=>{
 const before=clone(defaults);before.apartments[0].area=31;before.apartments[1].seasons=[{from:'2027-06-01',to:'2027-09-01',nightly:80,minNights:3}];
 const db=memoryDb({'site/public':{revision:4,destinationRevision,catalogueRevision,data:before},'site/calendar':{bookings:[{id:'keep'}]}});
 const first=await readSiteData(db,defaults);assert.equal(first.revision,5);assert.equal(first.photoLibraryRevision,photoLibraryRevision);assert.equal(first.data.apartments[0].area,31);assert.equal(first.data.apartments[1].seasons[0].nightly,80);assert.equal(db.data.get('site/calendar').bookings[0].id,'keep');
 const custom=first.data.photos.find(p=>p.category==='a-3'&&p.key!==first.data.apartments[0].image).key;db.data.get('site/public').data.apartments[0].image=custom;assert.equal((await readSiteData(db,defaults)).data.apartments[0].image,custom);assert.equal((await readSiteData(db,defaults)).revision,5);
});
test('adding a new library revision retains real host uploads and an existing chosen cover',()=>{
 const before=clone(defaults);before.photos.push({key:'host-upload',file:'host.webp',category:'a-3',illustrative:false,alt:'Host photo'});before.apartments[0].image='host-upload';const after=applyPhotoLibrary(before);assert.equal(after.apartments[0].image,'host-upload');assert.equal(after.photos.filter(p=>p.key==='host-upload').length,1);assert.equal(apartmentPhotographs(after,'a-3').length,22);
});
