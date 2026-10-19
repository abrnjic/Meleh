// Firebase REST keeps credentials and tokens out of persistent browser storage.
async function firebaseRequest(apiKey,action,payload,fetcher=fetch){
 const response=await fetcher('https://identitytoolkit.googleapis.com/v1/accounts:'+action+'?key='+encodeURIComponent(apiKey),{method:'POST',headers:{'Content-Type':'application/json','X-Firebase-Locale':'hr'},body:JSON.stringify(payload)});
 const result=await response.json();
 if(!response.ok)throw new Error(action==='signInWithPassword'?'Pogrešni podaci za prijavu ili račun nije dostupan.':'Firebase zahtjev nije uspio. Pokušajte se ponovno prijaviti.');
 return result;
}
export async function passwordSignIn(apiKey,email,password,fetcher=fetch){
 const result=await firebaseRequest(apiKey,'signInWithPassword',{email,password,returnSecureToken:true},fetcher);
 const account=await firebaseRequest(apiKey,'lookup',{idToken:result.idToken},fetcher);
 return {...result,emailVerified:account.users?.[0]?.emailVerified===true};
}
export async function sendVerification(apiKey,idToken,fetcher=fetch){
 await firebaseRequest(apiKey,'sendOobCode',{requestType:'VERIFY_EMAIL',idToken},fetcher);
}
