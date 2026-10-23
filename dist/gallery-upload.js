// Keep successful uploads when another file in a batch fails. Callers snapshot
// FileList before any asynchronous work or rerender can replace the input.
export async function uploadGalleryFiles(files,{available,prepare,transfer,onPhoto,onProgress=()=>{}}){
 const result={added:0,failed:[]};
 for(const [index,file]of Array.from(files).entries()){
  onProgress(`Dodajem ${index+1}/${files.length}: ${file.name}`);
  try{
   if(result.added>=available)throw Error('Dosegnut je broj od 300 fotografija.');
   const blob=await prepare(file),url=await transfer(blob);
   if(typeof url!=='string'||!url)throw Error('Poslužitelj nije potvrdio prijenos fotografije. Pokušajte ponovno.');
   onPhoto({key:'photo-'+crypto.randomUUID().slice(0,8),file:null,url,alt:file.name.replace(/\.[^.]+$/,'').slice(0,300),altEn:'',altDe:'',altCs:'',illustrative:false});result.added++;
  }catch(error){result.failed.push({name:file.name,message:error.message||'Prijenos nije uspio.'})}
 }
 return result;
}
export function galleryUploadMessage(result){return `${result.added?`${result.added} fotografija dodano u nacrt. Za javni prikaz odaberite Objavi fotografije.`:'Nijedna fotografija nije dodana.'}${result.failed.length?' '+result.failed.map(row=>row.name+': '+row.message).join(' '):''}`}
