import {randomUUID} from 'node:crypto';
const failure=(message,status=400,code)=>Object.assign(new Error(message),{status,code});
export async function storePhoto(bucket,bytes,type){
 const extension={'image/jpeg':'jpg','image/png':'png','image/webp':'webp'}[type];
 if(!extension)throw failure('Podržane su JPG, PNG i WebP fotografije.');
 if(bytes.length>2000000||bytes.length<12)throw failure('Fotografija smije imati najviše 2 MB.',413);
 const valid=type==='image/jpeg'?bytes[0]===255&&bytes[1]===216&&bytes[2]===255:type==='image/png'?bytes.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])):bytes.subarray(0,4).toString()==='RIFF'&&bytes.subarray(8,12).toString()==='WEBP';
 if(!valid)throw failure('Datoteka nije valjana fotografija.');
 const id=randomUUID()+'.'+extension;
 try{await bucket.file('photos/'+id).save(bytes,{resumable:false,metadata:{contentType:type}})}catch(error){
  if(Number(error.code)===404)throw failure('Spremnik fotografija nije dostupan. U Firebase konzoli aktivirajte Storage za postojeći projekt i provjerite naziv spremnika u serverskim postavkama. Fotografija nije prenesena.',503,'photo-storage-not-found');
  if(Number(error.code)===403||Number(error.code)===401)throw failure('Poslužitelj nema pristup spremniku fotografija. Provjerite IAM prava servisnog računa za čitanje i zapisivanje u tom spremniku. Fotografija nije prenesena.',503,'photo-storage-access-denied');
  throw error;
 }
 return {url:'/api/photo?id='+id};
}
