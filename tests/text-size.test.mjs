import test from 'node:test';
import assert from 'node:assert/strict';
import {normalizeTextSize,applyTextSize,restoreTextSize} from '../dist/text-size.js';
test('text size restores a supported preference and safely falls back for invalid values',()=>{
 for(const size of ['100','115','130','150'])assert.equal(normalizeTextSize(size),size);
 for(const value of [null,undefined,'900','125%','javascript:alert(1)'])assert.equal(normalizeTextSize(value),'100');
 const root={dataset:{}};const values=new Map();const storage={getItem:key=>values.get(key),setItem:(key,value)=>values.set(key,value)};
 applyTextSize('130',root,storage);assert.equal(root.dataset.textSize,'130');
 const nextPage={dataset:{}};restoreTextSize(nextPage,storage);assert.equal(nextPage.dataset.textSize,'130');
 applyTextSize('100',root,storage);restoreTextSize(nextPage,storage);assert.equal(nextPage.dataset.textSize,'100');
});
test('text resizing still works when browser storage is unavailable',()=>{
 const root={dataset:{}};const storage={getItem(){throw new Error('blocked')},setItem(){throw new Error('blocked')}};
 assert.equal(restoreTextSize(root,storage),'100');assert.equal(applyTextSize('150',root,storage),'150');assert.equal(root.dataset.textSize,'150');
});
