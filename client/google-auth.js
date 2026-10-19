import {initializeApp,getApps} from 'firebase/app';
import {initializeAuth,getAuth,inMemoryPersistence,browserPopupRedirectResolver,GoogleAuthProvider,signInWithRedirect,getRedirectResult,signOut} from 'firebase/auth';
import {createGoogleLogin,googleAuthConfig,googleLoginError} from './google-auth-core.js';
const sdk={initializeApp,getApps,initializeAuth,getAuth,inMemoryPersistence,browserPopupRedirectResolver,GoogleAuthProvider,signInWithRedirect,getRedirectResult,signOut};
export const prepareGoogleLogin=config=>createGoogleLogin(sdk,googleAuthConfig(config,window.location.hostname));
export {googleLoginError};
