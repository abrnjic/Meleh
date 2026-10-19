// The Firebase SDK handles OAuth state, popup messaging and token renewal.
export function createGoogleLogin(sdk,config){
 const existing=sdk.getApps().find(app=>app.name==='meleh-admin');
 const auth=existing?sdk.getAuth(existing):sdk.initializeAuth(sdk.initializeApp(config,'meleh-admin'),{persistence:sdk.inMemoryPersistence,popupRedirectResolver:sdk.browserPopupRedirectResolver});
 const provider=new sdk.GoogleAuthProvider();
 provider.setCustomParameters({prompt:'select_account'});
 return {
  async signIn(){await sdk.signInWithPopup(auth,provider)},
  async getToken(){if(!auth.currentUser)throw new Error('Potrebna je prijava.');return auth.currentUser.getIdToken()},
  async signOut(){await sdk.signOut(auth)}
 };
}
export function googleLoginError(error){
 const messages={
  'auth/popup-closed-by-user':'Google prijava je zatvorena. Pokušajte ponovno.',
  'auth/cancelled-popup-request':'Otvoren je drugi prozor prijave. Dovršite prijavu u njemu.',
  'auth/popup-blocked':'Preglednik je blokirao prozor prijave. Dopustite skočne prozore za ovu stranicu.',
  'auth/unauthorized-domain':'Ova domena još nije odobrena za Google prijavu.',
  'auth/operation-not-allowed':'Google prijava još nije aktivirana u Firebaseu.',
  'auth/network-request-failed':'Provjerite internetsku vezu i pokušajte ponovno.'
 };
 return messages[error.code]||'Google prijava nije uspjela. Pokušajte ponovno.';
}
