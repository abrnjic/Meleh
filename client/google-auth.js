import {initializeApp,getApps} from 'firebase/app';
import {initializeAuth,getAuth,inMemoryPersistence,browserPopupRedirectResolver,GoogleAuthProvider,signInWithPopup,signOut} from 'firebase/auth';
import {createGoogleLogin,googleLoginError} from './google-auth-core.js';
const sdk={initializeApp,getApps,initializeAuth,getAuth,inMemoryPersistence,browserPopupRedirectResolver,GoogleAuthProvider,signInWithPopup,signOut};
export const prepareGoogleLogin=config=>createGoogleLogin(sdk,config);
export {googleLoginError};
