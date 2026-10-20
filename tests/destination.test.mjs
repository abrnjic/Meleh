import test from 'node:test';import assert from 'node:assert/strict';
import defaults from '../server/default-site.json' with {type:'json'};
import {clone,validateContent} from '../dist/model.js';
import {correctedDestination,readSiteData,destinationRevision} from '../server/destination.js';
import {memoryDb} from './memory-db.mjs';
test('destination correction replaces legacy geography while preserving accommodation and contacts',()=>{
 const old=clone(defaults);old.address=null;old.mapsUrl=null;old.phone=null;old.email='host@example.com';old.apartments[0].name='Stvarni apartman';old.photos[0]={...old.photos[0],url:null,file:'crikvenica-plaza.jpg',alt:'Crikvenica'};old.guide=[{...old.guide[0],title:{hr:'Crikvenica'},url:'https://www.new.crikvenica-vinodol.com/en'}];
 const result=correctedDestination(old,defaults);assert.equal(result.address,defaults.address);assert.equal(result.phone,defaults.phone);assert.equal(result.mapsUrl,defaults.mapsUrl);assert.equal(result.apartments[0].name,'Stvarni apartman');assert.equal(result.email,'host@example.com');assert.doesNotMatch(JSON.stringify(result),/crikvenica/i);assert.ok(result.photos[0].url.includes('upload.wikimedia.org'));
});
test('stored destination migration runs once, advances revision and preserves later administrator changes',async()=>{
 const db=memoryDb({'site/public':{revision:2,data:clone(defaults)},'site/calendar':{bookings:[{id:'keep'}]}});
 const first=await readSiteData(db,defaults);assert.equal(first.revision,3);assert.equal(first.destinationRevision,destinationRevision);assert.equal(db.data.get('site/calendar').bookings[0].id,'keep');
 const stored=db.data.get('site/public');stored.data.address='Naknadno potvrđena adresa';const again=await readSiteData(db,defaults);assert.equal(again.revision,3);assert.equal(again.data.address,'Naknadno potvrđena adresa');
});
test('photo URLs accept Commons static assets and reject arbitrary third-party hosts',()=>{
 assert.doesNotThrow(()=>validateContent(defaults));for(const url of ['https://upload.wikimedia.org.evil.example/wikipedia/commons/a/ab/test.jpg','https://example.com/photo.jpg','https://upload.wikimedia.org/wikipedia/commons/a/ab/photo.jpg?tracking=1']){const data=clone(defaults);data.photos[0].url=url;assert.throws(()=>validateContent(data));}
});
