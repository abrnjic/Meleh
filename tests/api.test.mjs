import test from 'node:test';import assert from 'node:assert/strict';
import {handle} from '../api/index.js';import {adminIdentityAllowed,firebaseWebConfig,firebaseConfigured} from '../server/firebase.js';
const request=(path,method='GET',body,headers={})=>new Request('https://example.test/api/'+path,{method,headers:{...(method==='GET'?{}:{Origin:'https://example.test','Content-Type':'application/json'}),...headers},...(body?{body:JSON.stringify(body)}:{})});
test('without service configuration API does not claim availability or accept mail',async()=>{for(const path of ['config','content','availability']){const r=await handle(request(path));assert.equal(r.status,200);const data=await r.json();if(path==='config'){assert.equal(data.adminReady,false);assert.equal(data.mailReady,false);assert.equal(Object.hasOwn(data,'ADMIN_EMAIL'),false)}else assert.equal(data.configured,false)}const r=await handle(request('inquiry','POST',{name:'Example'}));assert.equal(r.status,503);assert.equal((await r.json()).accepted,undefined)});
test('private routes reject unauthenticated requests and cross-origin writes',async()=>{const before=process.env.ADMIN_EMAIL;process.env.ADMIN_EMAIL='owner@example.test';try{const r=await handle(request('admin'));assert.equal(r.status,401);const cross=await handle(request('admin','PUT',{}, {Origin:'https://other.test'}));assert.equal(cross.status,403);const photo=await handle(request('photo?id=../../secret'));assert.equal(photo.status,404)}finally{if(before)process.env.ADMIN_EMAIL=before;else delete process.env.ADMIN_EMAIL}});
test('admin identity requires a verified exact email match',()=>{assert.equal(adminIdentityAllowed({email:'OWNER@example.test',email_verified:true},'owner@example.test'),true);assert.equal(adminIdentityAllowed({email:'owner@example.test',email_verified:false},'owner@example.test'),false);assert.equal(adminIdentityAllowed({email:'other@example.test',email_verified:true},'owner@example.test'),false);assert.equal(adminIdentityAllowed({email:'owner@example.test',email_verified:true},''),false)});

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
