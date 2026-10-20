import test from 'node:test';import assert from 'node:assert/strict';
import defaults from '../server/default-site.json' with {type:'json'};
import old from './fixtures/sample-site.json' with {type:'json'};
import {clone,capacity,validateContent,validateInquiry} from '../dist/model.js';
import {matchingApartments} from '../dist/planning.js';
import {readSiteData,destinationRevision,catalogueRevision} from '../server/destination.js';
import {memoryDb} from './memory-db.mjs';
test('six confirmed units exactly match host beds, bedrooms and floor areas',()=>{
 const units=validateContent(defaults).apartments;
 assert.deepEqual(units.map(a=>[a.slug,a.name,a.guests,a.rooms,a.area]),[['a-3','A-3','2 + 1',1,30],['a-4','A-4','4',2,60],['a-9','A-9','4',2,60],['a-13','A-13','4',2,60],['a-8','A-8','2 + 1',1,30],['a-12','A-12','2 + 1',1,30]]);
 for(const a of units){assert.equal(a.detailsConfirmed,true);assert.equal(a.baths,null);assert.equal(a.floor,null);assert.equal(a.price,null);assert.equal(a.amenities.parking,true);assert.equal(a.amenities.wifi,null);assert.ok(defaults.photos.some(p=>p.key===a.image&&p.category===a.slug));}
});
test('legacy catalogue migration privately backs up units without reassigning stays or inquiry history',async()=>{
 const booking={id:'existing',apartment:'more',arrival:'2027-07-01',departure:'2027-07-08'},inquiry={apartment:'lavanda',status:'new'};
 const db=memoryDb({'site/public':{revision:3,destinationRevision,data:clone(old)},'site/calendar':{bookings:[booking]},'inquiries/existing':inquiry});
 const result=await readSiteData(db,defaults);assert.equal(result.revision,4);assert.equal(result.catalogueRevision,catalogueRevision);assert.equal(result.data.apartments.length,6);assert.equal(db.data.get('site/catalogue-before-six-2026-10').apartments.length,3);assert.deepEqual(db.data.get('site/calendar').bookings,[booking]);assert.deepEqual(db.data.get('inquiries/existing'),inquiry);
 db.data.get('site/public').data.apartments[0].area=31;assert.equal((await readSiteData(db,defaults)).data.apartments[0].area,31);assert.equal((await readSiteData(db,defaults)).revision,4);
});
test('finder and inquiries respect the actual capacity of all six units',()=>{
 assert.deepEqual(matchingApartments(defaults.apartments,{adults:4,rooms:2}).map(a=>a.slug),['a-4','a-9','a-13']);assert.equal(matchingApartments(defaults.apartments,{adults:5}).length,0);
 for(const a of defaults.apartments){const input={id:'12345678-1234-1234-1234-123456789012',name:'Example Guest',email:'guest@example.test',arrival:'2027-07-01',departure:'2027-07-08',apartment:a.slug,adults:capacity(a),children:0,consent:true};assert.equal(validateInquiry(input,defaults,'2026-10-20').apartment,a.slug);assert.throws(()=>validateInquiry({...input,children:1},defaults,'2026-10-20'));}
});

test('short apartment names migrate once without changing capacities, photos or saved accommodation data',async()=>{
 const {photoLibraryRevision,apartmentNamesRevision}=await import('../server/destination.js');
 const before=clone(defaults);
 for(const slug of ['a-8','a-12']){const a=before.apartments.find(a=>a.slug===slug);a.name+=' (2+1)';for(const lang of ['hr','en','de'])a.description[lang]=a.description[lang].replace(a.name.replace(' (2+1)',''),a.name);}
 before.apartments[0].area=31;
 const db=memoryDb({'site/public':{revision:5,destinationRevision,catalogueRevision,photoLibraryRevision,data:before}});
 const result=await readSiteData(db,defaults);
 assert.equal(result.revision,6);assert.equal(result.apartmentNamesRevision,apartmentNamesRevision);
 for(const slug of ['a-8','a-12']){const a=result.data.apartments.find(a=>a.slug===slug);assert.equal(a.name,slug.toUpperCase());assert.equal(a.guests,'2 + 1');assert.ok(!JSON.stringify(a.description).includes('(2+1)'));assert.match(a.description.hr,/2 osnovna ležaja i 1 dodatni ležaj/);}
 assert.equal(result.data.apartments[0].area,31);assert.deepEqual(result.data.photos,before.photos);
 assert.equal((await readSiteData(db,defaults)).revision,6);
});
