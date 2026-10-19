import {timingSafeEqual,randomUUID} from 'node:crypto';
import {calendarFeeds,syncFeeds} from './calendars.js';
const denied=()=>Object.assign(new Error('Pristup pozadinskom zadatku nije dopušten.'),{status:401});
export function requireCalendarCron(request,env=process.env){
 const secret=env.CRON_SECRET;
 if(typeof secret!=='string'||secret.length<32||env.VERCEL_ENV&&env.VERCEL_ENV!=='production')throw denied();
 const actual=Buffer.from(request.headers.get('authorization')||''),expected=Buffer.from('Bearer '+secret);
 if(actual.length!==expected.length||!timingSafeEqual(actual,expected))throw denied();
}
export async function runCalendarBackground(db,{sync=syncFeeds,now=()=>new Date()}={}){
 const ref=db.collection('site').doc('calendarBackground'),runId=randomUUID(),startedAt=now().toISOString();let claimed=false;
 await db.runTransaction(async tx=>{const current=(await tx.get(ref)).data()||{};
  if(current.state==='running'&&now().getTime()-Date.parse(current.lastStartedAt||'1970-01-01')<600000)return;
  tx.set(ref,{runId,state:'running',lastStartedAt:startedAt,lastFinishedAt:current.lastFinishedAt||null,attempted:0,succeeded:0,failed:0});claimed=true;
 });
 if(!claimed)return {skipped:true,reason:'already-running'};
 const counts={attempted:0,succeeded:0,failed:0};
 try{
  const feeds=await calendarFeeds(db);
  for(let batch=0;batch<Math.ceil(feeds.length/8);batch++){
   const result=await sync(db,{limit:8,overview:false});
   for(const key of Object.keys(counts))counts[key]+=result[key];
   if(!result.attempted)break;
  }
  const finishedAt=now().toISOString();
  await db.runTransaction(async tx=>{const current=await tx.get(ref);if(current.data()?.runId===runId)tx.update(ref,{state:counts.failed?'partial':'completed',lastFinishedAt:finishedAt,...counts})});
  return {ok:counts.failed===0,...counts,finishedAt};
 }catch{
  await db.runTransaction(async tx=>{const current=await tx.get(ref);if(current.data()?.runId===runId)tx.update(ref,{state:'error',lastFinishedAt:now().toISOString(),...counts})});
  throw Object.assign(new Error('Pozadinska provjera nije dovršena.'),{status:503});
 }
}
