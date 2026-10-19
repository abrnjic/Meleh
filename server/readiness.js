// An enabled login must reflect usable Google credentials, not only env presence.
export async function checkAdminServices({db,auth},email){
 if(!email)return false;
 await Promise.all([
  db.collection('site').doc('public').get(),
  auth.getUserByEmail(email).catch(error=>{if(error.code!=='auth/user-not-found')throw error})
 ]);
 return true;
}
