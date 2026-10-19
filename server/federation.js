import {ExternalAccountClient} from 'google-auth-library';
import {getVercelOidcToken} from '@vercel/oidc';

export function federationSettings(env,projectId){
 if(env.FIREBASE_FEDERATION_ENABLED!=='true'||env.VERCEL_ENV!=='production')return null;
 const provider=env.FIREBASE_WORKLOAD_IDENTITY_PROVIDER||'';
 const serviceAccount=env.FIREBASE_FEDERATED_SERVICE_ACCOUNT||'';
 if(!/^projects\/\d+\/locations\/global\/workloadIdentityPools\/[a-z0-9-]+\/providers\/[a-z0-9-]+$/.test(provider))return null;
 if(!/^[a-z0-9-]+$/.test(projectId)||!serviceAccount.endsWith('@'+projectId+'.iam.gserviceaccount.com')||!/^[a-z0-9-]+@/.test(serviceAccount))return null;
 return {provider,serviceAccount};
}
export function createFederatedClient(settings,tokenSupplier=getVercelOidcToken){
 return ExternalAccountClient.fromJSON({
  type:'external_account',
  audience:'//iam.googleapis.com/'+settings.provider,
  subject_token_type:'urn:ietf:params:oauth:token-type:jwt',
  token_url:'https://sts.googleapis.com/v1/token',
  service_account_impersonation_url:'https://iamcredentials.googleapis.com/v1/projects/-/serviceAccounts/'+settings.serviceAccount+':generateAccessToken',
  subject_token_supplier:{getSubjectToken:()=>tokenSupplier()},
  scopes:['https://www.googleapis.com/auth/cloud-platform','https://www.googleapis.com/auth/identitytoolkit']
 });
}
export function firebaseCredential(authClient){
 return {async getAccessToken(){
  const {token}=await authClient.getAccessToken();
  const expiry=authClient.credentials.expiry_date;
  if(!token||!Number.isFinite(expiry)||expiry<=Date.now())throw new Error('Google serverska prijava nije dostupna.');
  return {access_token:token,expires_in:Math.max(1,Math.floor((expiry-Date.now())/1000))};
 }};
}
