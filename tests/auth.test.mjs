import test from 'node:test';import assert from 'node:assert/strict';
import {createGoogleLogin,googleLoginError} from '../client/google-auth-core.js';
test('Google sign-in uses memory-only persistence, account choice and SDK token renewal',async()=>{
 const calls=[];const auth={currentUser:null};
 const sdk={getApps:()=>[],inMemoryPersistence:'memory',browserPopupRedirectResolver:'popup',initializeApp:(config,name)=>({name,config}),initializeAuth:(app,options)=>{calls.push({app,options});return auth},GoogleAuthProvider:class{setCustomParameters(options){calls.push(options)}},signInWithPopup:async()=>{auth.currentUser={getIdToken:async()=> 'fresh-token'}},signOut:async()=>{auth.currentUser=null}};
 const login=createGoogleLogin(sdk,{projectId:'test'});
 assert.equal(calls[0].options.persistence,'memory');assert.deepEqual(calls[1],{prompt:'select_account'});
 await assert.rejects(login.getToken(),/Potrebna/);await login.signIn();assert.equal(await login.getToken(),'fresh-token');await login.signOut();await assert.rejects(login.getToken(),/Potrebna/);
});
test('popup failures give actionable messages without exposing provider internals',()=>{
 assert.match(googleLoginError({code:'auth/popup-blocked'}),/skočne/);
 assert.match(googleLoginError({code:'auth/unauthorized-domain'}),/domena/);
 assert.equal(googleLoginError({message:'private provider detail'}),'Google prijava nije uspjela. Pokušajte ponovno.');
});
