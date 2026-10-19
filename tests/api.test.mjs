import test from 'node:test';import assert from 'node:assert/strict';
import {handle} from '../api/index.js';import {adminEmailAllowlist,adminIdentityAllowed,firebaseWebConfig,firebaseConfigured} from '../server/firebase.js';
const request=(path,method='GET',body,headers={})=>new Request('https://example.test/api/'+path,{method,headers:{...(method==='GET'?{}:{Origin:'https://example.test','Content-Type':'application/json'}),...headers},...(body?{body:JSON.stringify(body)}:{})});
test('without service configuration API does not claim availability or accept mail',async()=>{for(const path of ['config','content','availability']){const r=await handle(request(path));assert.equal(r.status,200);const data=await r.json();if(path==='config'){assert.equal(data.adminReady,false);assert.equal(data.mailReady,false);assert.equal(Object.hasOwn(data,'ADMIN_EMAIL'),false)}else assert.equal(data.configured,false)}const r=await handle(request('inquiry','POST',{name:'Example'}));assert.equal(r.status,503);assert.equal((await r.json()).accepted,undefined)});
test('private routes reject unauthenticated requests and cross-origin writes',async()=>{const before=process.env.ADMIN_EMAIL;process.env.ADMIN_EMAIL='owner@example.test';try{const r=await handle(request('admin'));assert.equal(r.status,401);const cross=await handle(request('admin','PUT',{}, {Origin:'https://other.test'}));assert.equal(cross.status,403);const photo=await handle(request('photo?id=../../secret'));assert.equal(photo.status,404)}finally{if(before)process.env.ADMIN_EMAIL=before;else delete process.env.ADMIN_EMAIL}});
test('admin identity requires Google sign-in and a verified exact email match',()=>{assert.equal(adminIdentityAllowed({email:'OWNER@example.test',email_verified:true,firebase:{sign_in_provider:'google.com'}},'owner@example.test'),true);assert.equal(adminIdentityAllowed({email:'owner@example.test',email_verified:false,firebase:{sign_in_provider:'google.com'}},'owner@example.test'),false);assert.equal(adminIdentityAllowed({email:'other@example.test',email_verified:true,firebase:{sign_in_provider:'google.com'}},'owner@example.test'),false);assert.equal(adminIdentityAllowed({email:'owner@example.test',email_verified:true,firebase:{sign_in_provider:'google.com'}},''),false)});

test('public Firebase defaults identify the supplied project without enabling private services',async()=>{
 const config=firebaseWebConfig({});
 assert.equal(config.projectId,'meleh-ce687');
 assert.equal(config.authDomain,'meleh-ce687.firebaseapp.com');
 assert.equal(config.storageBucket,'meleh-ce687.firebasestorage.app');
 assert.equal(config.appId,'1:391784174386:web:cd272aebefb8a8335afd2b');
 assert.equal(firebaseConfigured({}),false);
 const response=await handle(request('config'));const data=await response.json();
 assert.deepEqual(data.firebaseConfig,config);assert.equal(data.firebaseApiKey,config.apiKey);
 assert.equal(data.firebaseConfigured,false);
 assert.equal(Object.hasOwn(data.firebaseConfig,'privateKey'),false);
 assert.equal(Object.hasOwn(data.firebaseConfig,'clientEmail'),false);
});
test('project overrides do not inherit identifiers from the original Firebase project',()=>{
 const config=firebaseWebConfig({FIREBASE_PROJECT_ID:'another-project'});
 assert.equal(config.projectId,'another-project');assert.equal(config.apiKey,null);
 assert.equal(config.storageBucket,null);assert.equal(config.authDomain,undefined);
 assert.equal(firebaseWebConfig({FIREBASE_API_KEY:'override'}).apiKey,'override');
});

test('password and missing-provider tokens cannot access administration even with the allowed verified email',()=>{for(const firebase of [undefined,{sign_in_provider:'password'},{sign_in_provider:'anonymous'}])assert.equal(adminIdentityAllowed({email:'owner@example.test',email_verified:true,firebase},'owner@example.test'),false)});

test('additional administrators retain the original owner and require verified Google identities',()=>{
 const emails=adminEmailAllowlist({ADMIN_EMAIL:'Owner@example.test',ADMIN_EMAILS:' second@example.test,OWNER@example.test, '});
 assert.deepEqual(emails,['owner@example.test','second@example.test']);
 const user=email=>({email,email_verified:true,firebase:{sign_in_provider:'google.com'}});
 for(const email of emails){assert.equal(adminIdentityAllowed(user(email),emails),true);assert.equal(adminIdentityAllowed({...user(email),email_verified:false},emails),false);assert.equal(adminIdentityAllowed({...user(email),firebase:{sign_in_provider:'password'}},emails),false)}
 assert.equal(adminIdentityAllowed(user('second@example.test.attacker.test'),emails),false);
 assert.equal(adminIdentityAllowed(user('other@example.test'),emails),false);
 assert.deepEqual(adminEmailAllowlist({}),[]);
});

test('inquiry workflow reads and writes remain restricted to authenticated administrators',async()=>{
 const before=process.env.ADMIN_EMAIL;process.env.ADMIN_EMAIL='owner@example.test';
 try{for(const method of ['GET','PUT']){const response=await handle(request('admin?resource=inquiries',method,method==='PUT'?{id:'12345678-1234-1234-1234-123456789012',status:'confirmed',internalNote:'Private test',workflowRevision:0}:undefined));assert.equal(response.status,401)}}finally{if(before)process.env.ADMIN_EMAIL=before;else delete process.env.ADMIN_EMAIL}
});

test('calendar connection secrets and private guest instructions require administrator authentication',async()=>{
 const before=process.env.ADMIN_EMAIL;process.env.ADMIN_EMAIL='owner@example.test';try{for(const resource of ['calendar-feeds','calendar-sync','calendar-export','guest-guide','guest-links']){for(const method of ['GET','POST','PUT','DELETE']){const r=await handle(request('admin?resource='+resource,method,method==='GET'?undefined:{}));assert.equal(r.status,401)}}}finally{if(before)process.env.ADMIN_EMAIL=before;else delete process.env.ADMIN_EMAIL}
});

test('background job cannot be started by public users or forged Vercel user-agent headers',async()=>{
 const before=process.env.CRON_SECRET;process.env.CRON_SECRET='test-only-'+ 'x'.repeat(48);
 try{for(const headers of [{},{'User-Agent':'vercel-cron/1.0'},{Authorization:'Bearer invalid'}]){const result=await handle(request('calendar-background','GET',undefined,headers));assert.equal(result.status,401)}}finally{if(before)process.env.CRON_SECRET=before;else delete process.env.CRON_SECRET}
});
