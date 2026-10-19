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
export function firebaseConfigured(env=process.env){return Boolean(firebaseWebConfig(env).projectId&&env.FIREBASE_CLIENT_EMAIL&&env.FIREBASE_PRIVATE_KEY)}
export function firebase(){if(!firebaseConfigured())throw Object.assign(new Error('Firebase nije konfiguriran.'),{status:503});const app=getApps()[0]||initializeApp({credential:cert({projectId:firebaseWebConfig().projectId,clientEmail:process.env.FIREBASE_CLIENT_EMAIL,privateKey:process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g,'\n')}),storageBucket:firebaseWebConfig().storageBucket});return {db:getFirestore(app),auth:getAuth(app),bucket:()=>getStorage(app).bucket()}}
export function adminIdentityAllowed(user,adminEmail){return Boolean(adminEmail&&user.email_verified===true&&user.firebase?.sign_in_provider==='google.com'&&user.email?.toLowerCase()===adminEmail.trim().toLowerCase())}
export async function requireAdmin(request){if(!process.env.ADMIN_EMAIL)throw Object.assign(new Error('Administracija nije aktivirana.'),{status:503});const token=(request.headers.get('authorization')||'').match(/^Bearer (.+)$/)?.[1];if(!token)throw Object.assign(new Error('Potrebna je prijava.'),{status:401});let user;try{user=await firebase().auth.verifyIdToken(token,true)}catch{throw Object.assign(new Error('Prijava je istekla ili nije valjana.'),{status:401})}if(!adminIdentityAllowed(user,process.env.ADMIN_EMAIL))throw Object.assign(new Error('Ovaj račun nema administratorski pristup.'),{status:403});return user}
