import {addDays,date,interval,nights} from './model.js';

const today=()=>{const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`};
const monthDate=value=>new Date(value+'-01T12:00:00Z');
const messages={
 hr:{locale:'hr-HR',arrival:'Dolazak',departure:'Odlazak',pick:'Odaberite datum',start:'Odaberite datum dolaska, a zatim datum odlaska.',end:'Odaberite datum odlaska nakon dolaska.',night:'noćenje',nights:'noćenja',previous:'Prethodni mjesec',next:'Sljedeći mjesec',month:'Prikaži mjesec',occupied:'Postojeće zauzeće',available:'Moguće slobodno',unknown:'Dostupnost nije potvrđena',clear:'Očisti datume',stay:'odabrani boravak',help:'Datum odlaska nije zauzet. Za kretanje po danima možete koristiti strelice na tipkovnici.',week:['Po','Ut','Sr','Če','Pe','Su','Ne']},
 en:{locale:'en-GB',arrival:'Check-in',departure:'Check-out',pick:'Choose a date',start:'Choose check-in, then check-out.',end:'Choose a check-out date after check-in.',night:'night',nights:'nights',previous:'Previous month',next:'Next month',month:'Show month',occupied:'Occupied',available:'Potentially available',unknown:'Availability not confirmed',clear:'Clear dates',stay:'selected stay',help:'The check-out day remains available. Use the arrow keys to move between dates.',week:['Mo','Tu','We','Th','Fr','Sa','Su']},
 de:{locale:'de-DE',arrival:'Anreise',departure:'Abreise',pick:'Datum wählen',start:'Wählen Sie zuerst die Anreise, dann die Abreise.',end:'Wählen Sie ein Abreisedatum nach der Anreise.',night:'Nacht',nights:'Nächte',previous:'Vorheriger Monat',next:'Nächster Monat',month:'Monat anzeigen',occupied:'Belegt',available:'Möglicherweise frei',unknown:'Verfügbarkeit nicht bestätigt',clear:'Daten löschen',stay:'gewählter Aufenthalt',help:'Der Abreisetag bleibt frei. Mit den Pfeiltasten können Sie zwischen Tagen wechseln.',week:['Mo','Di','Mi','Do','Fr','Sa','So']},
 cs:{locale:'cs-CZ',arrival:'Příjezd',departure:'Odjezd',pick:'Vyberte datum',start:'Vyberte datum příjezdu a poté odjezdu.',end:'Vyberte datum odjezdu po příjezdu.',night:'noc',nights:'nocí',previous:'Předchozí měsíc',next:'Následující měsíc',month:'Zobrazit měsíc',occupied:'Obsazeno',available:'Pravděpodobně volno',unknown:'Dostupnost není potvrzena',clear:'Vymazat data',stay:'vybraný pobyt',help:'Den odjezdu zůstává volný. Mezi dny se můžete pohybovat šipkami na klávesnici.',week:['Po','Út','St','Čt','Pá','So','Ne']}
};
const language=options=>messages[options.language]||messages.hr;
const format=(value,options={})=>new Date(value+'T12:00:00Z').toLocaleDateString(language(options).locale,{day:'numeric',month:'long',year:'numeric',timeZone:'UTC'});
export function shiftMonth(month,offset){const d=monthDate(month);d.setUTCMonth(d.getUTCMonth()+offset);return d.toISOString().slice(0,7)}
export function createBookingRange(month=today().slice(0,7)){return {month,arrival:'',departure:'',active:'arrival',focus:month+'-01'}}
export function chooseBookingDate(state,value,{minDate}={}){
 if(!date(value)||minDate&&value<minDate)return state;
 if(state.active==='arrival'||!state.arrival)return {...state,arrival:value,departure:state.departure>value&&interval(value,state.departure)?state.departure:'',active:'departure',focus:value};
 // Clicking an earlier day starts a new range without jumping to another month.
 if(value<=state.arrival)return {...state,arrival:value,departure:'',active:'departure',focus:value};
 if(!interval(state.arrival,value))return state;
 return {...state,departure:value,active:'arrival',focus:value};
}
export function clearBookingRange(state){return {...state,arrival:'',departure:'',active:'arrival'}}

function monthMarkup(month,state,periods,index,options){
 const text=language(options);
 const first=monthDate(month),offset=(first.getUTCDay()+6)%7,last=new Date(Date.UTC(first.getUTCFullYear(),first.getUTCMonth()+1,0)).getUTCDate();
 const name=first.toLocaleDateString(text.locale,{month:'long',year:'numeric',timeZone:'UTC'});
 return `<section class="booking-range-month" aria-labelledby="booking-month-${index}"><h3 id="booking-month-${index}">${name}</h3><div class="booking-range-days">${text.week.map(d=>`<span class="booking-range-weekday" aria-hidden="true">${d}</span>`).join('')}${'<span aria-hidden="true"></span>'.repeat(offset)}${Array.from({length:last},(_,i)=>{
  const day=month+'-'+String(i+1).padStart(2,'0'),start=day===state.arrival,end=day===state.departure,between=state.arrival&&state.departure&&state.arrival<day&&day<state.departure,occupied=periods.some(p=>p.arrival<=day&&day<p.departure);
  const label=format(day,options)+(start?', '+text.arrival:end?', '+text.departure:between?', '+text.stay:'')+(occupied?', '+text.occupied:options.public?', '+(options.known?text.available:text.unknown):'');
  const disabled=!!options.minDate&&day<options.minDate,entry=state.focus.startsWith(month)&&(!options.minDate||state.focus>=options.minDate)?state.focus:options.minDate?.startsWith(month)?options.minDate:month+'-01';
  return `<button type="button" class="booking-range-day${start||end?' is-endpoint':''}${between?' is-between':''}${occupied?' is-occupied':''}" data-booking-day="${day}" aria-label="${label}" ${disabled?'disabled':''} aria-pressed="${!!(start||end||between)}" ${day===today()?'aria-current="date"':''} tabindex="${!disabled&&day===entry?0:-1}">${i+1}</button>`;
 }).join('')}</div></section>`;
}
export function bookingRangeMarkup(state,periods=[],options={}){
 const text=language(options),complete=interval(state.arrival,state.departure),count=complete?nights(state.arrival,state.departure):0;
 const countLabel=options.language==='cs'?(count===1?'noc':count>=2&&count<=4?'noci':'nocí'):count===1?text.night:text.nights;
 return `<input type="hidden" name="arrival" value="${state.arrival}"><input type="hidden" name="departure" value="${state.departure}"><div class="booking-range-fields">${[['arrival',text.arrival],['departure',text.departure]].map(([key,label])=>`<button type="button" data-booking-field="${key}" class="booking-range-field${state.active===key?' is-active':''}" aria-pressed="${state.active===key}"><span>${label}</span><strong>${state[key]?format(state[key],options):text.pick}</strong></button>`).join('')}</div><p class="booking-range-summary" role="status" aria-live="polite">${complete?`${count} ${countLabel} · ${format(state.arrival,options)} – ${format(state.departure,options)}`:state.arrival?text.end:text.start}</p><div class="booking-range-nav"><button type="button" data-booking-shift="-1" aria-label="${text.previous}">←</button><label>${text.month}<input type="month" data-booking-month value="${state.month}" min="1900-01" max="2200-12"></label><button type="button" data-booking-shift="1" aria-label="${text.next}">→</button></div><div class="booking-range-months">${monthMarkup(state.month,state,periods,0,options)}${monthMarkup(shiftMonth(state.month,1),state,periods,1,options)}</div><div class="booking-range-footer"><span><i aria-hidden="true"></i> ${text.occupied}</span>${options.public?`<span class="booking-range-availability">${options.known?text.available:text.unknown}</span>`:''}<button type="button" data-booking-clear>${text.clear}</button></div><p class="booking-range-help">${text.help}</p>`;
}
export function bindBookingRange(root,{getState,setState,getPeriods=()=>[],options={},onChange=()=>{}}){
 if(!root)return;
 const paint=()=>{root.innerHTML=bookingRangeMarkup(getState(),getPeriods(),options)};
 const update=state=>{const before=getState();setState(state);paint();if(before.arrival!==state.arrival||before.departure!==state.departure)onChange(state)};
 const focusDay=value=>root.querySelector(`[data-booking-day="${value}"]`)?.focus();
 root.onclick=e=>{
  const button=e.target.closest('button');if(!button||!root.contains(button))return;
  let state=getState(),focus='';
  if(button.dataset.bookingDay){focus=button.dataset.bookingDay;state=chooseBookingDate(state,focus,options)}
  else if(button.dataset.bookingField){state={...state,active:button.dataset.bookingField};update(state);root.querySelector(`[data-booking-field="${state.active}"]`).focus();return}
  else if(button.dataset.bookingShift){const month=shiftMonth(state.month,Number(button.dataset.bookingShift));if(month<'1900-01'||month>'2200-12')return;state={...state,month,focus:month+'-01'}}
  else if(button.hasAttribute('data-booking-clear'))state=clearBookingRange(state);
  else return;
  update(state);if(focus)focusDay(focus);else root.querySelector(button.hasAttribute('data-booking-clear')?'[data-booking-clear]':`[data-booking-shift="${button.dataset.bookingShift}"]`)?.focus();
 };
 root.onchange=e=>{if(!e.target.matches('[data-booking-month]'))return;const month=e.target.value;if(!/^\d{4}-\d{2}$/.test(month)||month<'1900-01'||month>'2200-12')return;update({...getState(),month,focus:month+'-01'});root.querySelector('[data-booking-month]').focus()};
 root.onkeydown=e=>{
  const button=e.target.closest('[data-booking-day]');if(!button)return;
  const value=button.dataset.bookingDay,day=new Date(value+'T12:00:00Z').getUTCDay(),offset={ArrowLeft:-1,ArrowRight:1,ArrowUp:-7,ArrowDown:7,Home:-((day+6)%7),End:6-((day+6)%7)}[e.key];
  let target;if(offset!==undefined)target=addDays(value,offset);else if(e.key==='PageUp'||e.key==='PageDown'){const month=shiftMonth(value.slice(0,7),e.key==='PageUp'?-1:1),last=new Date(Date.UTC(Number(month.slice(0,4)),Number(month.slice(5,7)),0)).getUTCDate();target=month+'-'+String(Math.min(Number(value.slice(8)),last)).padStart(2,'0')}else return;
  if(target<'1900-01-01'||target>'2200-12-31'||options.minDate&&target<options.minDate)return;e.preventDefault();let state={...getState(),focus:target};if(!root.querySelector(`[data-booking-day="${target}"]`)||getComputedStyle(root.querySelector(`[data-booking-day="${target}"]`).closest('section')).display==='none')state.month=target.slice(0,7);update(state);focusDay(target);
 };
 paint();
}
