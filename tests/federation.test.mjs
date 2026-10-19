import test from 'node:test';import assert from 'node:assert/strict';
import {federationSettings,createFederatedClient,firebaseCredential} from '../server/federation.js';
const env={FIREBASE_FEDERATION_ENABLED:'true',VERCEL_ENV:'production',FIREBASE_WORKLOAD_IDENTITY_PROVIDER:'projects/123456/locations/global/workloadIdentityPools/meleh-production/providers/vercel',FIREBASE_FEDERATED_SERVICE_ACCOUNT:'vercel-server@sample-project.iam.gserviceaccount.com'};
test('federation is opt-in, production-only and cannot select arbitrary credential endpoints',()=>{
 assert.ok(federationSettings(env,'sample-project'));
 for(const patch of [{VERCEL_ENV:'preview'},{VERCEL_ENV:'development'},{FIREBASE_FEDERATION_ENABLED:'false'},{FIREBASE_WORKLOAD_IDENTITY_PROVIDER:'https://other.test/token'},{FIREBASE_FEDERATED_SERVICE_ACCOUNT:'server@other-project.iam.gserviceaccount.com'}])assert.equal(federationSettings({...env,...patch},'sample-project'),null);
});
test('Google client uses the current request token each time and fixed Google endpoints',async()=>{
 let calls=0;const client=createFederatedClient(federationSettings(env,'sample-project'),async()=> 'request-token-'+ ++calls);
 assert.equal(await client.retrieveSubjectToken(),'request-token-1');assert.equal(await client.retrieveSubjectToken(),'request-token-2');
 assert.equal(client.audience,'//iam.googleapis.com/'+env.FIREBASE_WORKLOAD_IDENTITY_PROVIDER);
});
test('Firebase credential passes a valid short-lived token and rejects expired tokens',async()=>{
 const source={credentials:{expiry_date:Date.now()+3600000},getAccessToken:async()=>({token:'google-access-token'})};
 const credential=firebaseCredential(source);const result=await credential.getAccessToken();assert.equal(result.access_token,'google-access-token');assert.ok(result.expires_in>3500&&result.expires_in<=3600);
 source.credentials.expiry_date=Date.now()-1000;await assert.rejects(credential.getAccessToken(),/nije dostupna/);
});
test('Firebase readiness accepts complete production federation without a private key',async()=>{
 const {firebaseConfigured}=await import('../server/firebase.js');
 const configured={...env,FIREBASE_PROJECT_ID:'sample-project'};
 assert.equal(firebaseConfigured(configured),true);
 assert.equal(firebaseConfigured({...configured,VERCEL_ENV:'preview'}),false);
 assert.equal(firebaseConfigured({...configured,FIREBASE_FEDERATED_SERVICE_ACCOUNT:''}),false);
});
test('Google auth headers remain compatible with the Firestore 7 gRPC transport',async()=>{
 const client=createFederatedClient(federationSettings(env,'sample-project'));
 client.setCredentials({access_token:'transport-test-token',expiry_date:Date.now()+3600000});
 const headers=await client.getRequestHeaders();
 const key=Object.keys(headers).find(key=>key.toLowerCase()==='authorization');
 assert.ok(key,'Firestore gRPC reads enumerable object header fields');
 assert.equal(headers[key],'Bearer transport-test-token');
});
