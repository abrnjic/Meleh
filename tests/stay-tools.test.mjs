import test from 'node:test';
import assert from 'node:assert/strict';
import {whatsappNumber,validateContent,clone} from '../dist/model.js';
import {whatsappHref,enquiryText,stayIssue,createStayTools} from '../dist/stay-tools.js';
import base from '../server/default-site.json' with {type:'json'};
test('WhatsApp links require an international number and safely encode the complete message',()=>{
 assert.equal(whatsappNumber('+385 (99) 123-4567'),'385991234567');
 assert.equal(whatsappNumber('00385 99 1234567'),'385991234567');
 for(const value of [null,'','0991234567','javascript:alert(1)','+385123&text=bad','1234567890123456'])assert.equal(whatsappNumber(value),null);
 const text=enquiryText({apartment:'More & sun',arrival:'2027-07-01',departure:'2027-07-08',adults:2,children:1,message:'Želim terasu? & pogled 🌊'});
 const link=new URL(whatsappHref('+385991234567',text));assert.equal(link.origin,'https://wa.me');assert.equal(link.pathname,'/385991234567');assert.equal(link.searchParams.get('text'),text);assert.equal([...link.searchParams].length,1);
 assert.equal(whatsappHref(null,text),null);
 const data=clone(base);data.whatsapp='0991234567';assert.throws(()=>validateContent(data),/međunarodnom/);data.whatsapp='+385991234567';assert.equal(validateContent(data).whatsapp,data.whatsapp);
});
test('messages use the chosen language, retain children and do not invent missing dates',()=>{
 for(const language of ['hr','en','de']){const text=enquiryText({language,apartment:'Maslina',adults:2,children:3});assert.match(text,/Maslina/);assert.match(text,/: 3/);assert.doesNotMatch(text,/undefined|null/)}
 assert.match(enquiryText({language:'en',arrival:'2027-02-30',departure:'2027-03-04'}),/Dates to be arranged/);
 assert.match(enquiryText({language:'de',arrival:'2027-07-01',departure:'2027-07-08',name:' Ana '}),/Name: Ana/);
});
test('WhatsApp inquiry validates partial dates, past dates and capacity without requiring email',()=>{
 const data={apartment:'more',adults:2,children:0};assert.equal(stayIssue(data,base.apartments,'2026-10-20'),null);
 assert.equal(stayIssue({...data,arrival:'2027-07-01'},base.apartments,'2026-10-20'),'dates');
 assert.equal(stayIssue({...data,arrival:'2025-07-01',departure:'2025-07-08'},base.apartments,'2026-10-20'),'dates');
 assert.equal(stayIssue({...data,children:1},base.apartments,'2026-10-20'),'capacity');
 assert.equal(stayIssue({...data,adults:1.5},base.apartments,'2026-10-20'),'guests');
});
test('comparison uses all nightly seasons, flags minimum stays, and leaves gaps on request',()=>{
 const site=clone(base);site.apartments[0].seasons=[{from:'2027-06-01',to:'2027-07-01',nightly:80,minNights:3},{from:'2027-07-01',to:'2027-08-01',nightly:100,minNights:5}];
 const saved=globalThis.location;globalThis.location={search:'?apartments=maslina,more,unknown&arrival=2027-06-29&departure=2027-07-03&adults=2&children=1'};
 try{const tools=createStayTools({S:site,t:(hr,en)=>en,esc:String,url:slug=>'/apartmani/'+slug+'/',photo:()=>'',getLang:()=> 'en',navigate:()=>{}});const html=tools.comparisonPage();assert.match(html,/€360\.00/);assert.match(html,/shorter than the minimum/);assert.match(html,/Insufficient capacity/);assert.match(html,/On request/);assert.doesNotMatch(html,/wa\.me/);assert.match(html,/children=1/);assert.doesNotMatch(html,/<h2>Lavanda/)}finally{globalThis.location=saved}
});
