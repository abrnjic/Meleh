import test from 'node:test';import assert from 'node:assert/strict';
import {passwordSignIn,sendVerification} from '../dist/auth.js';
test('sign-in reads verification state without automatically sending email',async()=>{
 const calls=[];const fetcher=async(url,options)=>{calls.push({url,body:JSON.parse(options.body)});return Response.json(calls.length===1?{idToken:'test-token',refreshToken:'test-refresh',expiresIn:'3600'}:{users:[{emailVerified:false}]})};
 const result=await passwordSignIn('test-key','owner@example.test','test-password',fetcher);
 assert.equal(result.emailVerified,false);assert.equal(calls.length,2);assert.ok(calls[1].url.includes('accounts:lookup'));assert.deepEqual(calls[1].body,{idToken:'test-token'});
});
test('verification is explicit and uses the authenticated account token',async()=>{
 let payload;await sendVerification('test-key','account-token',async(url,options)=>{assert.ok(url.includes('accounts:sendOobCode'));payload=JSON.parse(options.body);return Response.json({})});
 assert.deepEqual(payload,{requestType:'VERIFY_EMAIL',idToken:'account-token'});
});
test('failed or incomplete account lookup cannot claim a verified identity',async()=>{
 const fetcher=async(url)=>Response.json(url.includes('signInWithPassword')?{idToken:'test-token'}:{});
 assert.equal((await passwordSignIn('key','owner@example.test','pass',fetcher)).emailVerified,false);
 await assert.rejects(passwordSignIn('key','owner@example.test','pass',async()=>Response.json({error:{}},{status:400})),/Pogrešni/);
});
