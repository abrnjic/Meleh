import test from 'node:test';
import assert from 'node:assert/strict';
import {inquiryDateRange} from '../dist/contact-dates.js';
import {bookingRangeMarkup} from '../dist/booking-range.js';

test('contact dates open on the transferred arrival month with the full range',()=>{
 const state=inquiryDateRange('2027-07-10','2027-07-17','2026-10-22');
 assert.equal(state.month,'2027-07');assert.equal(state.arrival,'2027-07-10');assert.equal(state.departure,'2027-07-17');
 assert.match(bookingRangeMarkup(state),/7 noćenja/);
});
test('incomplete or reversed query dates keep only the valid arrival',()=>{
 for(const departure of [null,'','2027-07-09','2027-07-10','2031-07-10']){
  const state=inquiryDateRange('2027-07-10',departure,'2026-10-22');
  assert.equal(state.arrival,'2027-07-10');assert.equal(state.departure,'');assert.equal(state.active,'departure');
 }
});
test('past and malformed query values never populate hidden fields or markup',()=>{
 for(const arrival of [null,'','2026-10-21','2027-02-30','2027-07-10" onfocus="alert(1)']){
  const state=inquiryDateRange(arrival,'2027-07-17','2026-10-22');
  assert.equal(state.arrival,'');assert.equal(state.departure,'');assert.equal(state.month,'2026-10');assert.equal(state.focus,'2026-10-22');
  assert.doesNotMatch(bookingRangeMarkup(state),/onfocus/);
 }
});
