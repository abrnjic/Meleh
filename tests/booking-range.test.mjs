import test from 'node:test';
import assert from 'node:assert/strict';
import {createBookingRange,chooseBookingDate,clearBookingRange,shiftMonth,bookingRangeMarkup} from '../dist/booking-range.js';
import {validateBooking,nights,overlaps} from '../dist/model.js';

test('arrival switches to checkout without changing the visible month',()=>{
 const initial=createBookingRange('2027-07');
 const arrival=chooseBookingDate(initial,'2027-07-03');
 assert.equal(arrival.active,'departure');assert.equal(arrival.month,'2027-07');
 const range=chooseBookingDate(arrival,'2027-07-10');
 assert.deepEqual(validateBooking({...range,apartment:'a-3',note:'Test'},[{slug:'a-3'}]),{id:null,apartment:'a-3',arrival:'2027-07-03',departure:'2027-07-10',note:'Test'});
 assert.equal(nights(range.arrival,range.departure),7);
 assert.equal(overlaps(range,{arrival:'2027-07-10',departure:'2027-07-15'}),false);
});
test('cross-month and year ranges keep ISO dates and count nights across DST',()=>{
 let state=chooseBookingDate(createBookingRange('2027-03'),'2027-03-27');
 state=chooseBookingDate(state,'2027-04-03');assert.equal(nights(state.arrival,state.departure),7);
 assert.equal(state.month,'2027-03');
 assert.equal(shiftMonth('2027-12',1),'2028-01');assert.equal(shiftMonth('2028-01',-1),'2027-12');
 const leap=chooseBookingDate(chooseBookingDate(createBookingRange('2028-02'),'2028-02-28'),'2028-03-01');assert.equal(nights(leap.arrival,leap.departure),2);
});
test('earlier checkout restarts the range and invalid or excessive ranges are rejected',()=>{
 const state=chooseBookingDate(createBookingRange('2027-07'),'2027-07-10');
 const earlier=chooseBookingDate(state,'2027-07-03');assert.equal(earlier.arrival,'2027-07-03');assert.equal(earlier.departure,'');assert.equal(earlier.active,'departure');
 assert.equal(chooseBookingDate(state,'2027-02-30'),state);
 assert.equal(chooseBookingDate(state,'2030-01-01'),state);
});
test('clearing retains the viewed month and past bookings remain possible',()=>{
 const state=chooseBookingDate(chooseBookingDate(createBookingRange('2020-06'),'2020-06-01'),'2020-06-08');
 const cleared=clearBookingRange(state);assert.equal(cleared.month,'2020-06');assert.equal(cleared.arrival,'');assert.equal(cleared.departure,'');
 assert.doesNotThrow(()=>validateBooking({...state,apartment:'a-3'},[{slug:'a-3'}]));
});
test('markup identifies both endpoints, selected nights and existing bookings',()=>{
 const state=chooseBookingDate(chooseBookingDate(createBookingRange('2027-07'),'2027-07-03'),'2027-07-10');
 const html=bookingRangeMarkup(state,[{arrival:'2027-07-10',departure:'2027-07-12'}]);
 assert.match(html,/name="arrival" value="2027-07-03"/);assert.match(html,/name="departure" value="2027-07-10"/);
 assert.equal((html.match(/class="booking-range-day is-endpoint/g)||[]).length,2);
 assert.equal((html.match(/class="booking-range-day is-between/g)||[]).length,6);
 assert.equal((html.match(/is-occupied"/g)||[]).length,2);
 assert.match(html,/7 noćenja/);assert.match(html,/aria-live="polite"/);
});

test('guest date selection rejects past dates while admin can still enter them',()=>{
 const state=createBookingRange('2027-07');
 assert.equal(chooseBookingDate(state,'2027-07-02',{minDate:'2027-07-03'}),state);
 assert.equal(chooseBookingDate(state,'2027-07-03',{minDate:'2027-07-03'}).arrival,'2027-07-03');
 assert.equal(chooseBookingDate(state,'2027-07-02').arrival,'2027-07-02');
 const html=bookingRangeMarkup(state,[],{public:true,minDate:'2027-07-03',known:false});
 assert.match(html,/data-booking-day="2027-07-02"[^>]*disabled/);
 assert.doesNotMatch(html,/data-booking-day="2027-07-03"[^>]*disabled/);
 assert.match(html,/Dostupnost nije potvrđena/);assert.doesNotMatch(html,/Moguće slobodno/);
});
test('guest calendar labels and summaries follow all four site languages',()=>{
 const state=chooseBookingDate(chooseBookingDate(createBookingRange('2027-07'),'2027-07-03'),'2027-07-10');
 for(const [language,month,summary,label] of [['hr','srpanj','7 noćenja','Dolazak'],['en','July','7 nights','Check-in'],['de','Juli','7 Nächte','Anreise'],['cs','červenec','7 nocí','Příjezd']]){
  const html=bookingRangeMarkup(state,[],{public:true,known:true,language});
  assert.ok(html.includes(month),language);assert.ok(html.includes(summary),language);assert.ok(html.includes(label),language);
 }
});
