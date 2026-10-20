import {capacity,interval,nights,addDays,overlaps,quote} from './model.js';
export const AMENITIES={terrace:['Terasa','Terrace','Terrasse'],balcony:['Balkon','Balcony','Balkon'],parking:['Parking','Parking','Parkplatz'],wifi:['Wi-Fi','Wi-Fi','WLAN'],aircon:['Klima','Air conditioning','Klimaanlage'],kitchen:['Kuhinja','Kitchen','Küche'],stepFree:['Ulaz bez stepenica','Step-free entrance','Stufenloser Eingang']};
export function amenityState(value){return value===true?true:value===false?false:null}
export function matchingApartments(apartments,{adults=2,children=0,rooms=0,wishes=[]}={}){
 const total=Number(adults)+Number(children);if(!Number.isInteger(Number(adults))||!Number.isInteger(Number(children))||!Number.isInteger(total)||Number(adults)<1||Number(children)<0||total>40)return [];
 return apartments.filter(a=>capacity(a)>=total&&a.rooms>=Number(rooms)&&wishes.every(k=>Object.hasOwn(AMENITIES,k)&&a.amenities?.[k]===true)).sort((a,b)=>capacity(a)-capacity(b)||a.area-b.area);
}
export function openForStay(a,periods,arrival,departure){return interval(arrival,departure)&&!periods.some(p=>p.apartment===a.slug&&overlaps(p,{arrival,departure}))&&quote(a,arrival,departure)?.meetsMinimum!==false}
export function alternativeStays(apartments,periods,{arrival,departure,adults=2,children=0,wishes=[],rooms=0,apartment='',today='0000-01-01'}={}){
 if(!interval(arrival,departure))return [];
 const eligible=matchingApartments(apartments,{adults,children,wishes,rooms}),length=nights(arrival,departure),result=[];
 for(const offset of [0,...Array.from({length:14},(_,i)=>[i+1,-i-1]).flat()]){const start=addDays(arrival,offset),end=addDays(start,length);if(start<today)continue;for(const a of eligible){if(offset===0&&a.slug===apartment)continue;if(openForStay(a,periods,start,end)){result.push({apartment:a.slug,arrival:start,departure:end,offset});if(result.length===3)return result}}}return result;
}
export const DAY_PLANS={
  "family": {
    "title": [
      "Dan za obitelj",
      "A family day",
      "Ein Familientag"
    ],
    "stops": [
      {
        "time": [
          "Jutro",
          "Morning",
          "Morgen"
        ],
        "title": [
          "Plaža u Luci Dubravi",
          "Luka Dubrava beach",
          "Strand von Luka Dubrava"
        ],
        "text": [
          "Počnite dan kupanjem u uvali. Aktivnosti prilagodite dobi djece i uvjetima na moru.",
          "Start with a swim in the bay. Choose activities suited to the children’s ages and sea conditions.",
          "Beginnen Sie mit einem Bad in der Bucht. Aktivitäten an Alter und Meeresbedingungen anpassen."
        ],
        "place": "Plaža Luka Dubrava Pelješac",
        "source": "https://www.ston.hr/?u=luka-dubrava%2Fdeg%2Fst%2F53%2F53"
      },
      {
        "time": [
          "Poslijepodne",
          "Afternoon",
          "Nachmittag"
        ],
        "title": [
          "Izlet u Ston",
          "A trip to Ston",
          "Ausflug nach Ston"
        ],
        "text": [
          "Prošećite Stonom ili obiđite zidine. Prije polaska provjerite ulaznice, vrijeme i prikladnost rute za svoju obitelj.",
          "Stroll through Ston or visit the walls. Check tickets, weather and route suitability for your family before leaving.",
          "Spazieren Sie durch Ston oder besichtigen Sie die Mauern. Eintritt, Wetter und Eignung der Route für Ihre Familie vorab prüfen."
        ],
        "place": "Stonske zidine",
        "source": "https://www.ston.hr/?u=stonske-zidine%2Ffrg%2Fst%2F58%2F59"
      },
      {
        "time": [
          "Večer",
          "Evening",
          "Abend"
        ],
        "title": [
          "Predvečerje u Luci Dubravi",
          "An evening in Luka Dubrava",
          "Abend in Luka Dubrava"
        ],
        "text": [
          "Vratite se u Luku Dubravu za mirnu večer uz more i odmor u apartmanu.",
          "Return to Luka Dubrava for a quiet seaside evening and time to unwind in your apartment.",
          "Kehren Sie für einen ruhigen Abend am Meer und Erholung im Apartment nach Luka Dubrava zurück."
        ],
        "place": "Luka Dubrava Pelješac"
      }
    ]
  },
  "couple": {
    "title": [
      "Dan udvoje",
      "A day for two",
      "Ein Tag zu zweit"
    ],
    "stops": [
      {
        "time": [
          "Jutro",
          "Morning",
          "Morgen"
        ],
        "title": [
          "Jutro u uvali",
          "Morning in the bay",
          "Morgen in der Bucht"
        ],
        "text": [
          "Odvojite vrijeme za kavu i laganu šetnju u Luci Dubravi.",
          "Take time for coffee and a gentle stroll in Luka Dubrava.",
          "Nehmen Sie sich Zeit für Kaffee und einen Spaziergang in Luka Dubrava."
        ],
        "place": "Luka Dubrava Pelješac"
      },
      {
        "time": [
          "Poslijepodne",
          "Afternoon",
          "Nachmittag"
        ],
        "title": [
          "Izlet u Ston",
          "A trip to Ston",
          "Ausflug nach Ston"
        ],
        "text": [
          "Prošećite Stonom ili obiđite zidine. Prije polaska provjerite ulaznice, vrijeme i prikladnost rute za svoju obitelj.",
          "Stroll through Ston or visit the walls. Check tickets, weather and route suitability for your family before leaving.",
          "Spazieren Sie durch Ston oder besichtigen Sie die Mauern. Eintritt, Wetter und Eignung der Route für Ihre Familie vorab prüfen."
        ],
        "place": "Stonske zidine",
        "source": "https://www.ston.hr/?u=stonske-zidine%2Ffrg%2Fst%2F58%2F59"
      },
      {
        "time": [
          "Večer",
          "Evening",
          "Abend"
        ],
        "title": [
          "Večera u stonskom kraju",
          "Dinner in the Ston area",
          "Abendessen in der Region Ston"
        ],
        "text": [
          "Odaberite restoran prema svom ukusu. Radno vrijeme i rezervaciju stola provjerite izravno s restoranom.",
          "Choose a restaurant to suit your taste. Check opening hours and table reservations directly with the restaurant.",
          "Wählen Sie ein Restaurant nach Ihrem Geschmack. Öffnungszeiten und Reservierung direkt beim Restaurant prüfen."
        ],
        "place": "Restorani Ston Mali Ston",
        "source": "https://www.ston.hr/?u=gastro-ponuda%2Fhr%2Fst%2F66"
      }
    ]
  },
  "rain": {
    "title": [
      "Plan za kišni dan",
      "A rainy-day plan",
      "Ein Regentag"
    ],
    "stops": [
      {
        "time": [
          "Jutro",
          "Morning",
          "Morgen"
        ],
        "title": [
          "Muzej u Putnikoviću",
          "Museum in Putniković",
          "Museum in Putniković"
        ],
        "text": [
          "Upoznajte vinogradarsku tradiciju Pelješca u Muzeju vinogradarstva i vinarstva. Provjerite radno vrijeme i dostupnost posjeta.",
          "Explore Pelješac’s heritage at the Museum of Viticulture and Winemaking. Check opening hours and visit availability.",
          "Entdecken Sie Pelješacs Tradition im Weinbau- und Weinmuseum. Öffnungszeiten und Besuchsmöglichkeiten vorab prüfen."
        ],
        "place": "Muzej vinogradarstva i vinarstva Putniković",
        "source": "https://www.ston.hr/?u=muzej-vinogradarstva-i-vinarstva-putnikovic%2Fceg%2Fst%2F180"
      },
      {
        "time": [
          "Večer",
          "Evening",
          "Abend"
        ],
        "title": [
          "Večera u stonskom kraju",
          "Dinner in the Ston area",
          "Abendessen in der Region Ston"
        ],
        "text": [
          "Odaberite restoran prema svom ukusu. Radno vrijeme i rezervaciju stola provjerite izravno s restoranom.",
          "Choose a restaurant to suit your taste. Check opening hours and table reservations directly with the restaurant.",
          "Wählen Sie ein Restaurant nach Ihrem Geschmack. Öffnungszeiten und Reservierung direkt beim Restaurant prüfen."
        ],
        "place": "Restorani Ston Mali Ston",
        "source": "https://www.ston.hr/?u=gastro-ponuda%2Fhr%2Fst%2F66"
      },
      {
        "time": [
          "Predah",
          "A break",
          "Eine Pause"
        ],
        "title": [
          "Vrijeme za odmor",
          "Time to unwind",
          "Zeit zum Entspannen"
        ],
        "text": [
          "Ostavite dio dana za knjigu ili društvenu igru u apartmanu. Po lošem vremenu izlet prilagodite uvjetima na cesti.",
          "Leave time for a book or a board game in your apartment. In bad weather, adapt any outing to road conditions.",
          "Nehmen Sie sich Zeit für ein Buch oder Gesellschaftsspiel im Apartment. Ausflüge bei schlechtem Wetter an die Straßenverhältnisse anpassen."
        ],
        "place": null
      }
    ]
  }
};
export function createPlanning({S,t,esc,url,photo,getLang,navigate,getCalendar}){
 const tx=a=>a[{hr:0,en:1,de:2}[getLang()]||0],today=()=>new Date().toLocaleDateString('en-CA');
 function badges(a){return Object.entries(AMENITIES).map(([k,label])=>`<div><dt>${tx(label)}</dt><dd>${a.amenities?.[k]===true?t('Da','Yes','Ja'):a.amenities?.[k]===false?t('Ne','No','Nein'):t('Nepotvrđeno','Unconfirmed','Unbestätigt')}</dd></div>`).join('')}
 const contact=(a,data)=>'/kontakt/?'+new URLSearchParams({apartman:a.slug,arrival:data.arrival,departure:data.departure,adults:data.adults||2,children:data.children||0});
 function resultCard(a,data){const calendar=getCalendar(),q=quote(a,data.arrival,data.departure);return `<article class="planner-result">${photo(a.image)}<div><h2>${esc(a.name)}</h2><p>${esc(a.guests)} ${t('osobe','guests','Personen')} · ${a.rooms} ${t(a.rooms===1?'spavaća soba':a.rooms<5?'spavaće sobe':'spavaćih soba',a.rooms===1?'bedroom':'bedrooms','Schlafzimmer')} · ${a.area} m²</p><p class="section-note">${calendar.known?t('Nema evidentiranog zauzeća. Dostupnost potvrđuje domaćin.','No recorded block. The host confirms availability.','Keine erfasste Belegung. Verfügbarkeit bestätigt der Gastgeber.'):t('Dostupnost još nije potvrđena.','Availability is not yet confirmed.','Verfügbarkeit ist noch nicht bestätigt.')}</p>${q?`<p><strong>${new Intl.NumberFormat({hr:'hr-HR',en:'en-GB',de:'de-DE'}[getLang()],{style:'currency',currency:'EUR'}).format(q.total)}</strong> · ${q.nights} ${t('noći','nights','Nächte')}</p>`:`<p>${t('Cijena na upit.','Price on request.','Preis auf Anfrage.')}</p>`}<p class="section-note">${t('Izračun je prema cjeniku; konačnu cijenu i dodatne troškove potvrđuje domaćin.','Prices are calculated from the price list; the host confirms the final price and any extra charges.','Berechnung laut Preisliste; Endpreis und mögliche Zusatzkosten bestätigt der Gastgeber.')}</p><dl class="planner-amenities">${badges(a)}</dl><div class="actions"><a class="btn" href="${esc(contact(a,data))}">${t('Pripremi upit','Prepare enquiry','Anfrage vorbereiten')} ↗</a><a class="text-link" href="${url(a.slug)}">${t('Detalji','Details','Details')} ↗</a></div></div></article>`}
 function alternativeMarkup(data){const calendar=getCalendar(),suggestions=alternativeStays(S.apartments,calendar.periods,{...data,today:today()});return `<div class="alternative-stays"><h3>${t('Drugi termini ili apartmani','Other dates or apartments','Andere Termine oder Apartments')}</h3><p class="section-note">${t('Prijedlozi unutar 14 dana od odabranog dolaska. Dostupnost i konačnu cijenu potvrđuje domaćin.','Suggestions within 14 days of your chosen arrival. The host confirms availability and final prices.','Vorschläge innerhalb von 14 Tagen um Ihre Anreise. Verfügbarkeit und Endpreise bestätigt der Gastgeber.')}</p>${suggestions.length?suggestions.map(s=>{const a=S.apartments.find(a=>a.slug===s.apartment);return `<a class="alternative-link" href="${esc(contact(a,{...data,...s}))}"><strong>${esc(a.name)}</strong><span>${s.arrival} → ${s.departure}</span><span>${t('Pripremi upit','Prepare enquiry','Anfrage vorbereiten')} ↗</span></a>`}).join(''):`<p>${t('Nema prijedloga za zadane uvjete. Pokušajte s drugim datumima ili manje uvjeta.','No suggestions match these requirements. Try different dates or fewer requirements.','Keine passenden Vorschläge. Versuchen Sie andere Reisedaten oder weniger Kriterien.')}</p>`}</div>`}
 function finderPage(){const q=new URLSearchParams(location.search),wishes=q.getAll('wish').filter(k=>Object.hasOwn(AMENITIES,k)),data={arrival:q.get('arrival')||'',departure:q.get('departure')||'',adults:q.get('adults')||'2',children:q.get('children')||'0',rooms:q.get('rooms')||'0',wishes},valid=interval(data.arrival,data.departure)&&data.arrival>=today(),eligible=matchingApartments(S.apartments,data),matches=valid?eligible.filter(a=>openForStay(a,getCalendar().periods,data.arrival,data.departure)):[];return head(t('Pronađimo vaš apartman.','Let’s find your apartment.','Finden wir Ihr Apartment.'),t('Datumi, društvo i detalji koji su vam važni.','Your dates, your company and the details that matter.','Ihre Reisedaten, Ihre Begleitung und wichtige Details.'))+`<section class="section"><div class="wrap"><form id="apartment-finder" class="planner-form"><div class="form-grid"><label class="field">${t('Dolazak','Check-in','Anreise')}<input type="date" name="arrival" min="${today()}" value="${esc(valid?data.arrival:'')}" required></label><label class="field">${t('Odlazak','Check-out','Abreise')}<input type="date" name="departure" min="${esc(valid?addDays(data.arrival,1):today())}" value="${esc(valid?data.departure:'')}" required></label><label class="field">${t('Odrasli','Adults','Erwachsene')}<input type="number" name="adults" min="1" max="40" value="${esc(data.adults)}" required></label><label class="field">${t('Djeca','Children','Kinder')}<input type="number" name="children" min="0" max="40" value="${esc(data.children)}"></label><label class="field">${t('Najmanje spavaćih soba','Minimum bedrooms','Mindestens Schlafzimmer')}<select name="rooms">${[0,1,2,3].map(n=>`<option value="${n}" ${String(n)===data.rooms?'selected':''}>${n||t('Svejedno','Any','Egal')}</option>`).join('')}</select></label></div><fieldset><legend>${t('Želim potvrđene sadržaje','I need confirmed amenities','Ich benötige bestätigte Ausstattung')}</legend><div class="compare-choices">${Object.entries(AMENITIES).map(([k,l])=>`<label><input type="checkbox" name="wish" value="${k}" ${wishes.includes(k)?'checked':''}>${tx(l)}</label>`).join('')}</div></fieldset><p class="section-note">${t('Nepotvrđeni sadržaji ne računaju se kao dostupni.','Unconfirmed amenities are not counted as available.','Unbestätigte Ausstattung wird nicht als verfügbar gewertet.')}</p><button class="btn">${t('Pronađi apartman za mene','Find my apartment','Mein Apartment finden')} ↗</button><p id="finder-error" role="alert"></p></form><div id="finder-results" aria-live="polite">${valid?`<h2>${matches.length?t('Prijedlozi za vaš boravak','Suggestions for your stay','Vorschläge für Ihren Aufenthalt'):t('Pokušajmo s drugim izborom.','Let’s try another option.','Versuchen wir eine andere Auswahl.')}</h2>${S.demo?`<p class="section-note">${t('Ogledne fotografije su posebno označene. Osnovni podaci apartmana su potvrđeni.','Illustrative photographs are labelled. Basic apartment details are confirmed.','Beispielfotos sind gekennzeichnet. Die Grunddaten der Apartments sind bestätigt.')}</p>`:''}${matches.map(a=>resultCard(a,data)).join('')}${!matches.length?alternativeMarkup(data):''}`:''}</div></div></section>`}
 function head(title,sub){return `<section class="page-head"><div class="wrap"><div class="breadcrumbs"><a href="/">${t('Naslovnica','Home','Startseite')}</a> / ${title}</div><h1>${title}</h1><p>${sub}</p></div></section>`}
 function dayPage(){const selected=new URLSearchParams(location.search).get('plan')||'family',key=Object.hasOwn(DAY_PLANS,selected)?selected:'family',p=DAY_PLANS[key];return head(t('Vaš dan na Pelješcu.','Your day on Pelješac.','Ihr Tag auf Pelješac.'),t('Tri ideje za dan koji prati vaš ritam.','Three ideas for a day at your pace.','Drei Ideen für einen Tag in Ihrem Rhythmus.'))+`<section class="section"><div class="wrap"><nav class="day-tabs" aria-label="${t('Odaberite plan dana','Choose a day plan','Tagesplan wählen')}">${Object.entries(DAY_PLANS).map(([k,p])=>`<a class="filter ${k===key?'active':''}" ${k===key?'aria-current="page"':''} href="/plan-dana/?plan=${k}">${tx(p.title)}</a>`).join('')}</nav><h2>${tx(p.title)}</h2><p class="section-note">${t('Ovo su prijedlozi, a ne rezervirane aktivnosti. Radno vrijeme, ulaznice, vrijeme i uvjete provjerite prije polaska.','These are suggestions, not booked activities. Check opening hours, tickets, weather and conditions before leaving.','Dies sind Vorschläge, keine gebuchten Aktivitäten. Öffnungszeiten, Eintritt, Wetter und Bedingungen vorab prüfen.')}</p><ol class="day-stops">${p.stops.map(s=>`<li><span class="eyebrow">${tx(s.time)}</span><h3>${tx(s.title)}</h3><p>${tx(s.text)}</p><div class="actions">${s.place?`<a class="text-link" href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(s.place)}" target="_blank" rel="noopener noreferrer">${t('Na karti','On the map','Auf der Karte')} ↗</a>`:''}${s.source?`<a class="text-link" href="${esc(s.source)}" target="_blank" rel="noopener noreferrer">${t('Službene informacije','Official information','Offizielle Informationen')} ↗</a>`:''}</div></li>`).join('')}</ol><a class="btn outline" href="/vodic/">${t('Sve preporuke','All recommendations','Alle Empfehlungen')} ↗</a></div></section>`}
 function homeLinks(){return `<section class="section cream"><div class="wrap planning-intro"><div><span class="eyebrow">${t('VAŠ ODMOR, VAŠ IZBOR','YOUR STAY, YOUR CHOICE','IHR URLAUB, IHRE WAHL')}</span><h2>${t('Manje traženja.<br>Više iščekivanja.','Less searching.<br>More looking forward.','Weniger suchen.<br>Mehr Vorfreude.')}</h2></div><div><p>${t('Pronađite apartman prema svojim željama ili isplanirajte dan na Pelješcu.','Find an apartment that suits your wishes or plan a day on Pelješac.','Finden Sie ein passendes Apartment oder planen Sie Ihren Tag auf Pelješac.')}</p><div class="actions"><a class="btn" href="/pronadi-apartman/">${t('Pronađi apartman za mene','Find my apartment','Mein Apartment finden')} ↗</a><a class="text-link" href="/plan-dana/">${t('Vaš dan na Pelješcu','Your day on Pelješac','Ihr Tag auf Pelješac')} ↗</a></div></div></div></section>`}
 function bind(){const f=document.querySelector('#apartment-finder');if(f){f.arrival.onchange=()=>f.departure.min=f.arrival.value?addDays(f.arrival.value,1):today();f.oninput=()=>{document.querySelector('#finder-results').hidden=true};f.onsubmit=e=>{e.preventDefault();const data=Object.fromEntries(new FormData(f));if(!interval(data.arrival,data.departure)||data.arrival<today()){document.querySelector('#finder-error').textContent=t('Provjerite datume.','Check your dates.','Prüfen Sie die Reisedaten.');return}navigate('/pronadi-apartman/?'+new URLSearchParams(new FormData(f)))}}}
 return {finderPage,dayPage,homeLinks,alternativeMarkup,badges,bind};
}
