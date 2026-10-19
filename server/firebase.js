import {checkAdminServices} from './readiness.js';
import {Firestore} from '@google-cloud/firestore';
import {Storage} from '@google-cloud/storage';
import {federationSettings,createFederatedClient,firebaseCredential} from './federation.js';
import {cert,getApps,initializeApp} from 'firebase-admin/app';
import {getAuth} from 'firebase-admin/auth';
import {getFirestore} from 'firebase-admin/firestore';
import {getStorage} from 'firebase-admin/storage';
import webDefaults from './firebase-web.json' with {type:'json'};
// Public web identifiers do not grant service-account access.
export function firebaseWebConfig(env=process.env){
 const projectId=env.FIREBASE_PROJECT_ID||webDefaults.projectId;
 const defaults=projectId===webDefaults.projectId?webDefaults:{};
 return {...defaults,projectId,apiKey:env.FIREBASE_API_KEY||defaults.apiKey||null,storageBucket:env.FIREBASE_STORAGE_BUCKET||defaults.storageBucket||null};
}
let services;
export function firebaseConfigured(env=process.env){return Boolean(federationSettings(env,firebaseWebConfig(env).projectId)||(firebaseWebConfig(env).projectId&&env.FIREBASE_CLIENT_EMAIL&&env.FIREBASE_PRIVATE_KEY))}
export function firebase(){
 if(services)return services;
 if(!firebaseConfigured())throw Object.assign(new Error('Firebase nije konfiguriran.'),{status:503});
 const config=firebaseWebConfig();
 const federated=federationSettings(process.env,config.projectId);
 if(federated){
  const authClient=createFederatedClient(federated);
  const app=getApps().find(app=>app.name==='meleh-server-federated')||initializeApp({projectId:config.projectId,credential:firebaseCredential(authClient)},'meleh-server-federated');
  const db=new Firestore({projectId:config.projectId,authClient});
  const storage=new Storage({projectId:config.projectId,authClient});
  services={db,auth:getAuth(app),bucket:()=>storage.bucket(config.storageBucket)};
 }else{
  const app=getApps().find(app=>app.name==='[DEFAULT]')||initializeApp({credential:cert({projectId:config.projectId,clientEmail:process.env.FIREBASE_CLIENT_EMAIL,privateKey:process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g,'\n')}),storageBucket:config.storageBucket});
  services={db:getFirestore(app),auth:getAuth(app),bucket:()=>getStorage(app).bucket()};
 }
 return services;
}
let readinessPromise,readinessExpires=0;
export async function adminServicesReady(){
 const emails=adminEmailAllowlist();
 if(!firebaseConfigured()||!emails.length)return false;
 if(!readinessPromise||Date.now()>=readinessExpires){
  readinessExpires=Date.now()+30000;
  readinessPromise=Promise.resolve().then(()=>checkAdminServices(firebase(),emails[0])).catch(error=>{console.error('Firebase access check failed',{code:error.code||'unavailable'});return false});
 }
 return readinessPromise;
}
export function adminEmailAllowlist(env=process.env){return [...new Set([env.ADMIN_EMAIL,env.ADMIN_EMAILS].filter(Boolean).join(',').split(',').map(email=>email.trim().toLowerCase()).filter(Boolean))]}
export function adminIdentityAllowed(user,adminEmails){const emails=(Array.isArray(adminEmails)?adminEmails:String(adminEmails||'').split(',')).map(email=>email.trim().toLowerCase()).filter(Boolean);return Boolean(user.email_verified===true&&user.firebase?.sign_in_provider==='google.com'&&emails.includes(user.email?.toLowerCase()))}
export async function requireAdmin(request){const emails=adminEmailAllowlist();if(!emails.length)throw Object.assign(new Error('Administracija nije aktivirana.'),{status:503});const token=(request.headers.get('authorization')||'').match(/^Bearer (.+)$/)?.[1];if(!token)throw Object.assign(new Error('Potrebna je prijava.'),{status:401});let user;try{user=await firebase().auth.verifyIdToken(token,true)}catch{throw Object.assign(new Error('Prijava je istekla ili nije valjana.'),{status:401})}if(!adminIdentityAllowed(user,emails))throw Object.assign(new Error('Ovaj račun nema administratorski pristup.'),{status:403});return user}
