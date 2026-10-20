import test from 'node:test';
import assert from 'node:assert/strict';
import {clone,validateInquiryUpdate} from '../dist/model.js';
import {filterInquiries,inquiryReply,demoInquiries} from '../dist/inquiry-inbox.js';
import {updateInquiry} from '../server/inquiries.js';
import base from './fixtures/sample-site.json' with {type:'json'};
const id='12345678-1234-1234-1234-123456789012';
test('inbox combines text, status, apartment and arrival filters without changing records',()=>{
 const rows=demoInquiries(),copy=clone(rows);assert.equal(filterInquiries(rows,{search:'ANA@EXAMPLE'},base.apartments).length,1);
 assert.equal(filterInquiries(rows,{status:'offered',apartment:'lavanda',arrivalFrom:'2027-08-01',arrivalTo:'2027-08-31'},base.apartments).length,1);
 assert.equal(filterInquiries(rows,{search:'parkiranja'},base.apartments)[0].status,'offered');
 assert.equal(filterInquiries(rows,{status:'confirmed'},base.apartments).length,0);assert.deepEqual(rows,copy);
});
test('reply templates use guest language and never disclose internal notes or invent prices',()=>{
 for(const row of demoInquiries()){const text=inquiryReply({...row,internalNote:'PRIVATE_SENTINEL'},base);assert.doesNotMatch(text,/PRIVATE_SENTINEL/);assert.match(text,new RegExp(row.arrival));assert.match(text,new RegExp(row.departure));assert.doesNotMatch(text,/undefined|null/)}
 const site=clone(base);site.apartments[0].seasons=[{from:'2027-07-01',to:'2027-07-09',nightly:100,minNights:3}];
 assert.match(inquiryReply(demoInquiries()[0],site),/700/);
 assert.doesNotMatch(inquiryReply({...demoInquiries()[0],departure:'2027-07-02'},site),/100,00/);
});
test('inquiry changes validate status, note size and revision and ignore unrelated fields',()=>{
 const value={id,status:'confirmed',internalNote:'Dogovor telefonom',workflowRevision:0,arrival:'2099-01-01'};
 assert.deepEqual(validateInquiryUpdate(value),{id,status:'confirmed',internalNote:'Dogovor telefonom',workflowRevision:0});
 for(const patch of [{id:'invalid'},{status:'__proto__'},{status:'deleted'},{internalNote:'x'.repeat(5001)},{internalNote:'<script>'},{workflowRevision:-1},{workflowRevision:undefined}])assert.throws(()=>validateInquiryUpdate({...value,...patch}));
});
test('transactional updates persist only workflow fields and reject stale concurrent changes',async()=>{
 let record={name:'Guest',arrival:'2027-07-01',status:'new',internalNote:'',delivery:{guest:{status:'sent'}}};let writes=0;
 const ref={};const db={collection:name=>{assert.equal(name,'inquiries');return {doc:key=>{assert.equal(key,id);return ref}}},runTransaction:async fn=>fn({get:async target=>{assert.equal(target,ref);return {exists:true,data:()=>record}},update:(target,patch)=>{assert.equal(target,ref);record={...record,...patch};writes++}})};
 const saved=await updateInquiry(db,{id,status:'offered',internalNote:'Privatna bilješka',workflowRevision:0});assert.equal(saved.workflowRevision,1);assert.equal(record.internalNote,'Privatna bilješka');assert.equal(record.name,'Guest');assert.equal(record.delivery.guest.status,'sent');assert.equal(record.arrival,'2027-07-01');
 await assert.rejects(updateInquiry(db,{id,status:'cancelled',internalNote:'Stara bilješka',workflowRevision:0}),e=>e.status===409);assert.equal(writes,1);assert.equal(record.status,'offered');
 await updateInquiry(db,{id,status:'confirmed',internalNote:'',workflowRevision:1});assert.equal(record.workflowRevision,2);assert.equal(record.internalNote,'');
});
test('missing inquiry is not created by a workflow update',async()=>{
 const db={collection:()=>({doc:()=>({})}),runTransaction:async fn=>fn({get:async()=>({exists:false}),update:()=>assert.fail('must not write')})};
 await assert.rejects(updateInquiry(db,{id,status:'new',internalNote:'',workflowRevision:0}),e=>e.status===404);
});
