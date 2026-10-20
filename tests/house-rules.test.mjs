import test from 'node:test';
import assert from 'node:assert/strict';
import defaults from '../server/default-site.json' with {type:'json'};
import * as revisions from '../server/destination.js';
import {memoryDb} from './memory-db.mjs';
test('house rules migrate once without changing prices, photos or subsequent host edits',async()=>{
 const markers=Object.fromEntries(Object.entries(revisions).filter(([key,value])=>key.endsWith('Revision')&&key!=='houseRulesRevision'&&typeof value==='string'));
 const data=structuredClone(defaults);data.smoking=null;data.quietHours='22:00–08:00';data.apartments[0].seasons[0].nightly=75;
 const db=memoryDb({'site/public':{...markers,revision:12,data}});
 const result=await revisions.readSiteData(db,defaults);
 assert.equal(result.revision,13);assert.equal(result.houseRulesRevision,revisions.houseRulesRevision);assert.equal(result.data.smoking,defaults.smoking);assert.equal(result.data.quietHours,null);assert.equal(result.data.apartments[0].seasons[0].nightly,75);assert.deepEqual(result.data.photos,data.photos);
 db.data.get('site/public').data.smoking='Pravilo uređeno u administraciji';
 const again=await revisions.readSiteData(db,defaults);assert.equal(again.revision,13);assert.equal(again.data.smoking,'Pravilo uređeno u administraciji');
});
