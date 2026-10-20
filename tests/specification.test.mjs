import test from 'node:test';
import assert from 'node:assert/strict';
import defaults from '../server/default-site.json' with {type:'json'};
import imported from '../config/property-specification.json' with {type:'json'};
import {clone,validateContent,quote} from '../dist/model.js';
import {openForStay} from '../dist/planning.js';
import {readSiteData,destinationRevision,catalogueRevision,photoLibraryRevision,apartmentNamesRevision,amenitiesRevision,specificationRevision} from '../server/destination.js';
import {memoryDb} from './memory-db.mjs';
test('all six apartments retain the workbook equipment, pet fees and 36 correctly bounded price periods',()=>{
 assert.equal(defaults.name,'Meleh Apartmani');assert.equal(defaults.checkIn,'15:00');assert.equal(defaults.checkOut,'10:00');assert.equal(defaults.categoryStars,3);assert.equal(defaults.touristTaxIncluded,true);
 assert.equal(defaults.apartments.reduce((n,a)=>n+a.seasons.length,0),36);
 for(const a of defaults.apartments){const source=imported.apartments[a.slug];assert.deepEqual(a.seasons,source.seasons);assert.equal(a.petFee,10);assert.equal(a.minNights,['a-3','a-8'].includes(a.slug)?7:1);for(const key of ['aircon','terrace','balcony','wifi','parking','kitchen','tv','seaView','gardenView','privateBathroom'])assert.equal(a.amenities[key],true);assert.equal(a.amenities.microwave,['a-4','a-9'].includes(a.slug));assert.equal(a.amenities.dishwasher,['a-4','a-9'].includes(a.slug));assert.equal(a.amenities.washingMachine,false);assert.ok(!Object.hasOwn(a.amenities,'stepFree'));}
 assert.deepEqual(validateContent(defaults),defaults);
});
test('season boundaries include the source final night and do not extrapolate missing prices',()=>{
 const a=defaults.apartments.find(a=>a.slug==='a-4');
 assert.equal(quote(a,'2027-06-30','2027-07-02').total,180);
 assert.equal(quote(a,'2027-08-31','2027-09-02').total,180);
 assert.equal(quote(a,'2027-09-30','2027-10-01').total,70);
 assert.equal(quote(a,'2027-10-01','2027-10-02'),null);
 const small=defaults.apartments.find(a=>a.slug==='a-3');assert.equal(quote(small,'2027-07-01','2027-07-08').total,560);assert.equal(quote(small,'2027-07-01','2027-07-07').meetsMinimum,false);assert.equal(openForStay(small,[],'2027-05-01','2027-05-03'),false);
});
test('workbook migration updates the public document once and leaves photos, stays and later admin changes intact',async()=>{
 const before=clone(defaults);for(const a of before.apartments){a.seasons=[];a.amenities.aircon=null;a.petFee=null;a.minNights=1}before.checkIn=null;
 const db=memoryDb({'site/public':{revision:8,destinationRevision,catalogueRevision,photoLibraryRevision,apartmentNamesRevision,amenitiesRevision,data:before},'site/calendar':{bookings:[{id:'keep'}]},'inquiries/keep':{status:'new'}});
 const result=await readSiteData(db,defaults);assert.equal(result.revision,9);assert.equal(result.specificationRevision,specificationRevision);assert.equal(result.data.checkIn,'15:00');assert.equal(result.data.apartments[0].seasons.length,6);assert.deepEqual(result.data.photos,before.photos);assert.deepEqual(db.data.get('site/calendar').bookings,[{id:'keep'}]);assert.deepEqual(db.data.get('inquiries/keep'),{status:'new'});
 db.data.get('site/public').data.apartments[0].seasons[0].nightly=75;assert.equal((await readSiteData(db,defaults)).data.apartments[0].seasons[0].nightly,75);assert.equal((await readSiteData(db,defaults)).revision,9);
});


test('adding garden views preserves both views, prices, photographs and later host changes',async()=>{
 const {viewsRevision}=await import('../server/destination.js');
 const before=clone(defaults);for(const a of before.apartments){delete a.amenities.gardenView;a.description.hr=a.description.hr.replace('pogled na more i vrt,','pogled na more,');}before.apartments[0].seasons[0].nightly=75;
 const db=memoryDb({'site/public':{revision:9,destinationRevision,catalogueRevision,photoLibraryRevision,apartmentNamesRevision,amenitiesRevision,specificationRevision,data:before}});
 const first=await readSiteData(db,defaults);assert.equal(first.revision,10);assert.equal(first.viewsRevision,viewsRevision);
 for(const a of first.data.apartments){assert.equal(a.amenities.seaView,true);assert.equal(a.amenities.gardenView,true);assert.match(a.description.hr,/pogled na more i vrt/);}
 assert.equal(first.data.apartments[0].seasons[0].nightly,75);assert.deepEqual(first.data.photos,before.photos);
 db.data.get('site/public').data.apartments[0].description.hr='Naknadni opis domaćina';const again=await readSiteData(db,defaults);assert.equal(again.revision,10);assert.equal(again.data.apartments[0].description.hr,'Naknadni opis domaćina');
});
