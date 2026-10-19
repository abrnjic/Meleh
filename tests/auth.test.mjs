import test from 'node:test';import assert from 'node:assert/strict';
import {createGoogleLogin,googleAuthConfig,googleLoginError} from '../client/google-auth-core.js';
test('Google redirect sign-in preserves account choice, memory-only tokens and SDK renewal',async()=>{
 const calls=[];const auth={currentUser:null};
 const sdk={getApps:()=>[],inMemoryPersistence:'memory',browserPopupRedirectResolver:'popup',initializeApp:(config,name)=>({name,config}),initializeAuth:(app,options)=>{calls.push({app,options});return auth},GoogleAuthProvider:class{setCustomParameters(options){calls.push(options)}},signInWithRedirect:async()=>{calls.push('redirect')},getRedirectResult:async()=>{auth.currentUser={getIdToken:async()=> 'fresh-token'};return {user:auth.currentUser}},signOut:async()=>{auth.currentUser=null}};
 const login=createGoogleLogin(sdk,{projectId:'test'});
 assert.equal(calls[0].options.persistence,'memory');assert.deepEqual(calls[1],{prompt:'select_account'});
 await assert.rejects(login.getToken(),/Potrebna/);await login.signIn();assert.equal(calls.at(-1),'redirect');assert.equal(auth.currentUser,null);assert.equal(await login.resume(),true);assert.equal(await login.getToken(),'fresh-token');await login.signOut();await assert.rejects(login.getToken(),/Potrebna/);
});
test('popup failures give actionable messages without exposing provider internals',()=>{
 assert.match(googleLoginError({code:'auth/popup-blocked'}),/skočne/);
 assert.match(googleLoginError({code:'auth/unauthorized-domain'}),/domena/);
 assert.equal(googleLoginError({message:'private provider detail'}),'Google prijava nije uspjela. Pokušajte ponovno.');
});

test('redirect helper uses the proxied production origin only and preserves other config',()=>{
 const config={projectId:'meleh',authDomain:'meleh.firebaseapp.com',apiKey:'public'};
 assert.deepEqual(googleAuthConfig(config,'meleh.vercel.app'),{...config,authDomain:'meleh.vercel.app'});
 assert.equal(googleAuthConfig(config,'localhost'),config);
 assert.equal(googleAuthConfig(config,'untrusted.example'),config);
});
test('a cancelled redirect does not restore an administrator session',async()=>{
 const auth={currentUser:null};
 const sdk={getApps:()=>[{name:'meleh-admin'}],getAuth:()=>auth,GoogleAuthProvider:class{setCustomParameters(){}},getRedirectResult:async()=>null};
 const login=createGoogleLogin(sdk,{});assert.equal(await login.resume(),false);await assert.rejects(login.getToken(),/Potrebna/);
});
