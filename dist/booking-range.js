import {addDays,date,interval,nights} from './model.js';

const today=()=>{const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`};
const monthDate=value=>new Date(value+'-01T12:00:00Z');
const format=value=>new Date(value+'T12:00:00Z').toLocaleDateString('hr-HR',{day:'numeric',month:'long',year:'numeric',timeZone:'UTC'});
export function shiftMonth(month,offset){const d=monthDate(month);d.setUTCMonth(d.getUTCMonth()+offset);return d.toISOString().slice(0,7)}
export function createBookingRange(month=today().slice(0,7)){return {month,arrival:'',departure:'',active:'arrival',focus:month+'-01'}}
export function chooseBookingDate(state,value){
 if(!date(value))return state;
 if(state.active==='arrival'||!state.arrival)return {...state,arrival:value,departure:state.departure>value&&interval(value,state.departure)?state.departure:'',active:'departure',focus:value};
 // Clicking an earlier day starts a new range without jumping to another month.
 if(value<=state.arrival)return {...state,arrival:value,departure:'',active:'departure',focus:value};
 if(!interval(state.arrival,value))return state;
 return {...state,departure:value,active:'arrival',focus:value};
}
export function clearBookingRange(state){return {...state,arrival:'',departure:'',active:'arrival'}}

function monthMarkup(month,state,periods,index){
 const first=monthDate(month),offset=(first.getUTCDay()+6)%7,last=new Date(Date.UTC(first.getUTCFullYear(),first.getUTCMonth()+1,0)).getUTCDate();
 const name=first.toLocaleDateString('hr-HR',{month:'long',year:'numeric',timeZone:'UTC'});
 return `<section class="booking-range-month" aria-labelledby="booking-month-${index}"><h3 id="booking-month-${index}">${name}</h3><div class="booking-range-days">${['Po','Ut','Sr','Če','Pe','Su','Ne'].map(d=>`<span class="booking-range-weekday" aria-hidden="true">${d}</span>`).join('')}${'<span aria-hidden="true"></span>'.repeat(offset)}${Array.from({length:last},(_,i)=>{
  const day=month+'-'+String(i+1).padStart(2,'0'),start=day===state.arrival,end=day===state.departure,between=state.arrival&&state.departure&&state.arrival<day&&day<state.departure,occupied=periods.some(p=>p.arrival<=day&&day<p.departure);
  const label=format(day)+(start?', dolazak':end?', odlazak':between?', odabrani boravak':'')+(occupied?', postojeće zauzeće':'');
  return `<button type="button" class="booking-range-day${start||end?' is-endpoint':''}${between?' is-between':''}${occupied?' is-occupied':''}" data-booking-day="${day}" aria-label="${label}" aria-pressed="${!!(start||end||between)}" ${day===today()?'aria-current="date"':''} tabindex="${day===(state.focus.startsWith(month)?state.focus:month+'-01')?0:-1}">${i+1}</button>`;
 }).join('')}</div></section>`;
}
export function bookingRangeMarkup(state,periods=[]){
 const complete=interval(state.arrival,state.departure),count=complete?nights(state.arrival,state.departure):0;
 return `<input type="hidden" name="arrival" value="${state.arrival}"><input type="hidden" name="departure" value="${state.departure}"><div class="booking-range-fields">${[['arrival','Dolazak'],['departure','Odlazak']].map(([key,label])=>`<button type="button" data-booking-field="${key}" class="booking-range-field${state.active===key?' is-active':''}" aria-pressed="${state.active===key}"><span>${label}</span><strong>${state[key]?format(state[key]):'Odaberite datum'}</strong></button>`).join('')}</div><p class="booking-range-summary" role="status" aria-live="polite">${complete?`${count} ${count===1?'noćenje':'noćenja'} · ${format(state.arrival)} – ${format(state.departure)}`:state.arrival?'Odaberite datum odlaska nakon dolaska.':'Odaberite datum dolaska, a zatim datum odlaska.'}</p><div class="booking-range-nav"><button type="button" data-booking-shift="-1" aria-label="Prethodni mjesec">←</button><label>Prikaži mjesec<input type="month" data-booking-month value="${state.month}" min="1900-01" max="2200-12"></label><button type="button" data-booking-shift="1" aria-label="Sljedeći mjesec">→</button></div><div class="booking-range-months">${monthMarkup(state.month,state,periods,0)}${monthMarkup(shiftMonth(state.month,1),state,periods,1)}</div><div class="booking-range-footer"><span><i aria-hidden="true"></i> Postojeće zauzeće</span><button type="button" data-booking-clear>Očisti datume</button></div><p class="booking-range-help">Datum odlaska nije zauzet. Za kretanje po danima možete koristiti strelice na tipkovnici.</p>`;
}
export function bindBookingRange(root,{getState,setState,getPeriods=()=>[]}){
 if(!root)return;
 const paint=()=>{root.innerHTML=bookingRangeMarkup(getState(),getPeriods())};
 const focusDay=value=>root.querySelector(`[data-booking-day="${value}"]`)?.focus();
 root.onclick=e=>{
  const button=e.target.closest('button');if(!button||!root.contains(button))return;
  let state=getState(),focus='';
  if(button.dataset.bookingDay){focus=button.dataset.bookingDay;state=chooseBookingDate(state,focus)}
  else if(button.dataset.bookingField){state={...state,active:button.dataset.bookingField};setState(state);paint();root.querySelector(`[data-booking-field="${state.active}"]`).focus();return}
  else if(button.dataset.bookingShift){const month=shiftMonth(state.month,Number(button.dataset.bookingShift));if(month<'1900-01'||month>'2200-12')return;state={...state,month,focus:month+'-01'}}
  else if(button.hasAttribute('data-booking-clear'))state=clearBookingRange(state);
  else return;
  setState(state);paint();if(focus)focusDay(focus);else root.querySelector(button.hasAttribute('data-booking-clear')?'[data-booking-clear]':`[data-booking-shift="${button.dataset.bookingShift}"]`)?.focus();
 };
 root.onchange=e=>{if(!e.target.matches('[data-booking-month]'))return;const month=e.target.value;if(!/^\d{4}-\d{2}$/.test(month)||month<'1900-01'||month>'2200-12')return;setState({...getState(),month,focus:month+'-01'});paint();root.querySelector('[data-booking-month]').focus()};
 root.onkeydown=e=>{
  const button=e.target.closest('[data-booking-day]');if(!button)return;
  const value=button.dataset.bookingDay,day=new Date(value+'T12:00:00Z').getUTCDay(),offset={ArrowLeft:-1,ArrowRight:1,ArrowUp:-7,ArrowDown:7,Home:-((day+6)%7),End:6-((day+6)%7)}[e.key];
  let target;if(offset!==undefined)target=addDays(value,offset);else if(e.key==='PageUp'||e.key==='PageDown'){const month=shiftMonth(value.slice(0,7),e.key==='PageUp'?-1:1),last=new Date(Date.UTC(Number(month.slice(0,4)),Number(month.slice(5,7)),0)).getUTCDate();target=month+'-'+String(Math.min(Number(value.slice(8)),last)).padStart(2,'0')}else return;
  if(target<'1900-01-01'||target>'2200-12-31')return;e.preventDefault();let state={...getState(),focus:target};if(!root.querySelector(`[data-booking-day="${target}"]`)||getComputedStyle(root.querySelector(`[data-booking-day="${target}"]`).closest('section')).display==='none')state.month=target.slice(0,7);setState(state);paint();focusDay(target);
 };
 paint();
}
