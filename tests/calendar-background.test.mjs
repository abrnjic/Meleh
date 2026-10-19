import test from 'node:test';import assert from 'node:assert/strict';
import {requireCalendarCron,runCalendarBackground} from '../server/calendar-background.js';
import {memoryDb} from './memory-db.mjs';
const secret='test-only-'+ 'x'.repeat(48),request=value=>new Request('https://meleh.vercel.app/api/calendar-background',{headers:value?{authorization:value}:{}});
test('background endpoint requires an exact strong production-only scheduler credential',()=>{
 for(const value of [undefined,'Bearer wrong','Basic '+secret,'Bearer '+secret+'extra'])assert.throws(()=>requireCalendarCron(request(value),{CRON_SECRET:secret,VERCEL_ENV:'production'}),e=>e.status===401);
 assert.throws(()=>requireCalendarCron(request('Bearer '+secret),{CRON_SECRET:secret,VERCEL_ENV:'preview'}));assert.throws(()=>requireCalendarCron(request('Bearer '+secret),{}));assert.throws(()=>requireCalendarCron(request('Bearer short'),{CRON_SECRET:'short'}));assert.doesNotThrow(()=>requireCalendarCron(request('Bearer '+secret),{CRON_SECRET:secret,VERCEL_ENV:'production'}));
});
test('background job covers all forty connections in bounded batches and records aggregate progress only',async()=>{
 const seed=Object.fromEntries(Array.from({length:40},(_,n)=>['calendarFeeds/'+n,{url:'PRIVATE_CALENDAR_URL',apartment:'more'}]));const db=memoryDb(seed);let batches=0;
 const result=await runCalendarBackground(db,{sync:async(_db,options)=>{assert.equal(options.force,true);assert.equal(options.limit,8);assert.equal(options.overview,false);batches++;return {attempted:8,succeeded:7,failed:1}}});assert.equal(batches,5);assert.equal(result.attempted,40);assert.equal(result.failed,5);assert.equal(db.data.get('site/calendarBackground').state,'partial');assert.doesNotMatch(JSON.stringify(db.data.get('site/calendarBackground')),/PRIVATE/);
});
test('background job skips concurrent runs and recovers an expired execution lease',async()=>{
 const now=new Date();const db=memoryDb({'site/calendarBackground':{state:'running',lastStartedAt:now.toISOString(),runId:'existing'}});
 assert.equal((await runCalendarBackground(db)).skipped,true);assert.equal(db.data.get('site/calendarBackground').runId,'existing');db.data.set('site/calendarBackground',{state:'running',lastStartedAt:'2000-01-01T00:00:00Z'});const result=await runCalendarBackground(db);assert.equal(result.ok,true);assert.equal(result.attempted,0);assert.equal(db.data.get('site/calendarBackground').state,'completed');
});
test('failed background execution is recorded without leaking the provider error',async()=>{
 const db=memoryDb({'calendarFeeds/one':{}});await assert.rejects(runCalendarBackground(db,{sync:async()=>{throw new Error('PRIVATE URL AND TOKEN')}}),e=>e.status===503&&!e.message.includes('PRIVATE'));assert.equal(db.data.get('site/calendarBackground').state,'error');assert.doesNotMatch(JSON.stringify(db.data.get('site/calendarBackground')),/PRIVATE/);
});

test('background scheduler runs the actual importer across more than the interactive batch limit',async()=>{
 const {syncFeeds}=await import('../server/calendars.js');const seed=Object.fromEntries(Array.from({length:16},(_,n)=>['calendarFeeds/'+n,{apartment:'more',provider:'Airbnb',url:'https://www.airbnb.com/calendar/ical/'+n+'.ics',periods:[],lastAttempt:new Date(Date.now()-14*60000).toISOString()}]));const db=memoryDb(seed);let calls=0;
 const fetcher=async()=>{calls++;return new Response('BEGIN:VCALENDAR\r\nVERSION:2.0\r\nBEGIN:VEVENT\r\nDTSTART;VALUE=DATE:20270701\r\nDTEND;VALUE=DATE:20270708\r\nEND:VEVENT\r\nEND:VCALENDAR\r\n')};
 const result=await runCalendarBackground(db,{sync:(store,options)=>syncFeeds(store,{...options,fetcher})});assert.equal(calls,16);assert.equal(result.attempted,16);assert.equal(result.succeeded,16);assert.equal(result.failed,0);assert.equal(db.data.get('site/calendarBackground').state,'completed');
});
