// Serialize writes: a slower older request can never overwrite a newer draft.
export function createAutosave({read,write,onState=()=>{},onDirty=()=>{},delay=1000}){
 let saved='',timer=null,flight=null,blocked=false,stopped=false;
 const fingerprint=()=>JSON.stringify(read());
 function accept(value){clearTimeout(timer);saved=JSON.stringify(value);blocked=false;stopped=false;onState('saved')}
 function mark(){if(stopped)return;let value;try{value=read();if(JSON.stringify(value)===saved)return;try{onDirty(value)}catch(error){onState('error',error)}}catch(error){onState('error',error);return}onState(blocked?'conflict':'dirty');clearTimeout(timer);if(!blocked)timer=setTimeout(()=>flush().catch(()=>{}),delay)}
 async function flush(){clearTimeout(timer);if(stopped)return;if(blocked)throw Error('Nacrt je promijenjen u drugoj kartici. Ponovno učitajte nacrt prije spremanja.');if(flight){await flight;return flush()}const value=read(),json=JSON.stringify(value);if(json===saved)return;onState('saving');flight=(async()=>{try{await write(JSON.parse(json));saved=json;onState(fingerprint()===saved?'saved':'dirty')}catch(error){blocked=error.status===409;onState(blocked?'conflict':'error',error);throw error}finally{flight=null}})();await flight;if(fingerprint()!==saved)mark()}
 function stop(){clearTimeout(timer);stopped=true}
 return {mark,flush,accept,stop,get dirty(){try{return fingerprint()!==saved}catch{return true}},get saving(){return !!flight}};
}
