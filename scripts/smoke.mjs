// Read-only deployment checks. Never creates bookings, accounts, or test emails.
import assert from 'node:assert/strict';
const origin=new URL(process.argv[2]||'http://127.0.0.1:4174').origin;
for(const route of ['config','content','availability']){
 const response=await fetch(origin+'/api/'+route,{redirect:'manual',signal:AbortSignal.timeout(25000)});
 assert.equal(response.status,200,`/api/${route}: expected JSON 200 without a redirect, got ${response.status}`);
 assert.match(response.headers.get('content-type')||'',/application\/json/);
 const value=await response.json();if(route==='config'){assert.equal(typeof value.adminReady,'boolean');assert.equal(typeof value.mailReady,'boolean')}else assert.equal(typeof value.configured,'boolean');
 console.log('PASS /api/'+route);
}
for(const route of ['/admin/','/dostupnost/','/vodic/','/faq/','/apartmani/maslina/']){
 const response=await fetch(origin+route,{signal:AbortSignal.timeout(25000)});
 assert.equal(response.status,200,route+' should load');assert.match(await response.text(),/type="module" src="\/app.js"/);console.log('PASS '+route);
}
const protectedResponse=await fetch(origin+'/api/admin',{redirect:'manual',signal:AbortSignal.timeout(25000)});
assert.ok([401,503].includes(protectedResponse.status),'Admin endpoint must reject unauthenticated callers');
console.log('PASS unauthenticated admin is rejected');
