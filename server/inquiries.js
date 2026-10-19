import {validateInquiryUpdate} from '../dist/model.js';
export async function updateInquiry(db,value){
 const input=validateInquiryUpdate(value),ref=db.collection('inquiries').doc(input.id);
 let saved;
 await db.runTransaction(async tx=>{
  const current=await tx.get(ref);
  if(!current.exists)throw Object.assign(new Error('Upit nije pronađen.'),{status:404});
  if((current.data().workflowRevision||0)!==input.workflowRevision)throw Object.assign(new Error('Drugi administrator izmijenio je ovaj upit. Kopirajte svoju bilješku, osvježite popis i pokušajte ponovno.'),{status:409});
  saved={status:input.status,internalNote:input.internalNote,workflowRevision:input.workflowRevision+1,updatedAt:new Date().toISOString()};
  tx.update(ref,saved);
 });
 return {saved:true,...saved};
}
