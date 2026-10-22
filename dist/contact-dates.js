import {date,interval} from './model.js';
import {createBookingRange,clearBookingRange,bookingRangeMarkup,bindBookingRange} from './booking-range.js';

export function inquiryDateRange(arrival,departure,minDate){
 const validArrival=date(arrival)&&arrival>=minDate,validDeparture=validArrival&&interval(arrival,departure);
 const state=createBookingRange(validArrival?arrival.slice(0,7):minDate.slice(0,7));
 return {...state,arrival:validArrival?arrival:'',departure:validDeparture?departure:'',active:validDeparture?'arrival':validArrival?'departure':'arrival',focus:validArrival?arrival:minDate};
}

// Only the date section is repainted: personal details, consent and message stay intact.
export function createContactDates({getLanguage,getCalendarData,getToday,getQuery}){
 let state=inquiryDateRange('','',getToday()),queryKey=null;
 const periods=form=>form.elements.apartment.value?(getCalendarData().periods||[]).filter(p=>p.apartment===form.elements.apartment.value):[];
 const options=form=>({language:getLanguage(),minDate:getToday(),public:true,known:!!form.elements.apartment.value&&getCalendarData().known});
 function markup(){
  const query=getQuery(),key=JSON.stringify([query.get('arrival'),query.get('departure')]);
  if(key!==queryKey){state=inquiryDateRange(query.get('arrival'),query.get('departure'),getToday());queryKey=key}
  return `<div id="contact-date-range" class="booking-range booking-range-public full">${bookingRangeMarkup(state,[],{language:getLanguage(),minDate:getToday(),public:true,known:false})}</div>`;
 }
 function refresh(form){
  if(!form)return;
  bindBookingRange(form.querySelector('#contact-date-range'),{getState:()=>state,setState:value=>{state=value},getPeriods:()=>periods(form),options:options(form),onChange:()=>{
   document.querySelector('#inquiry-result')?.replaceChildren();
   const error=document.querySelector('#form-error');if(error)error.textContent='';
   // Hidden values are updated before notifying WhatsApp, validation and retry tracking.
   form.dispatchEvent(new Event('input',{bubbles:true}));
   form.dispatchEvent(new Event('change',{bubbles:true}));
  }});
 }
 function bind(form){
  if(!form)return;refresh(form);
  form.elements.apartment.addEventListener('change',()=>refresh(form));
  form.addEventListener('reset',()=>requestAnimationFrame(()=>{state=clearBookingRange(state);refresh(form)}));
 }
 function valid(form){return interval(form.elements.arrival.value,form.elements.departure.value)&&form.elements.arrival.value>=getToday()}
 return {markup,bind,refresh,valid};
}
