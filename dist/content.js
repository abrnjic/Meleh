// Centralno mjesto za unos potvrđenih podataka. null = podatak još nije dostavljen.
window.SITE = {
  name: 'Meleh Apartmani', demo: true, location: 'Luka Dubrava · Pelješac · Hrvatska', address: 'Luka Dubrava 28, 20248 Dubrava, Pelješac, Hrvatska',
  email: null, phone: '+385 91 888 0575', whatsapp: null, viber: null,
  mapEmbed: null, mapsUrl: 'https://goo.gl/maps/8DoVQCfixUfhY4me8', instagram: null, facebook: null,
  checkIn: null, checkOut: null, pets: null, smoking: null, quietHours: null,
  distances: {beach:null, center:null, shop:null, restaurant:null, airport:null, parking:null},
  reviews: [],
  apartments: [
  {
    "slug": "a-3",
    "name": "A-3",
    "guests": "2 + 1",
    "rooms": 1,
    "baths": null,
    "area": 30,
    "floor": null,
    "image": "a-3-photo",
    "tag": "",
    "type": "couple",
    "price": null,
    "detailsConfirmed": true,
    "description": {
      "hr": "Apartman A-3 ima 30 m² i jednu spavaću sobu. Dostupno je 2 osnovna ležaja i 1 dodatni ležaj.",
      "en": "Apartment A-3 offers 30 m² and 1 bedroom. It has 2 standard beds and 1 extra bed.",
      "de": "Apartment A-3 bietet 30 m² und 1 Schlafzimmer. Es verfügt über 2 reguläre Schlafplätze und 1 Zusatzbett."
    },
    "amenities": {
      "parking": true,
      "terraceOrBalcony": true,
      "kitchen": true,
      "wifi": true
    }
  },
  {
    "slug": "a-4",
    "name": "A-4",
    "guests": "4",
    "rooms": 2,
    "baths": null,
    "area": 60,
    "floor": null,
    "image": "a-4-photo",
    "tag": "",
    "type": "family",
    "price": null,
    "detailsConfirmed": true,
    "description": {
      "hr": "Apartman A-4 ima 60 m² i dvije spavaće sobe. Dostupno je 4 osnovna ležaja.",
      "en": "Apartment A-4 offers 60 m² and 2 bedrooms. It has 4 standard beds.",
      "de": "Apartment A-4 bietet 60 m² und 2 Schlafzimmer. Es verfügt über 4 reguläre Schlafplätze."
    },
    "amenities": {
      "parking": true,
      "terraceOrBalcony": true,
      "kitchen": true,
      "wifi": true
    }
  },
  {
    "slug": "a-9",
    "name": "A-9",
    "guests": "4",
    "rooms": 2,
    "baths": null,
    "area": 60,
    "floor": null,
    "image": "a-9-photo",
    "tag": "",
    "type": "family",
    "price": null,
    "detailsConfirmed": true,
    "description": {
      "hr": "Apartman A-9 ima 60 m² i dvije spavaće sobe. Dostupno je 4 osnovna ležaja.",
      "en": "Apartment A-9 offers 60 m² and 2 bedrooms. It has 4 standard beds.",
      "de": "Apartment A-9 bietet 60 m² und 2 Schlafzimmer. Es verfügt über 4 reguläre Schlafplätze."
    },
    "amenities": {
      "parking": true,
      "terraceOrBalcony": true,
      "kitchen": true,
      "wifi": true
    }
  },
  {
    "slug": "a-13",
    "name": "A-13",
    "guests": "4",
    "rooms": 2,
    "baths": null,
    "area": 60,
    "floor": null,
    "image": "a-13-photo",
    "tag": "",
    "type": "family",
    "price": null,
    "detailsConfirmed": true,
    "description": {
      "hr": "Apartman A-13 ima 60 m² i dvije spavaće sobe. Dostupno je 4 osnovna ležaja.",
      "en": "Apartment A-13 offers 60 m² and 2 bedrooms. It has 4 standard beds.",
      "de": "Apartment A-13 bietet 60 m² und 2 Schlafzimmer. Es verfügt über 4 reguläre Schlafplätze."
    },
    "amenities": {
      "parking": true,
      "terraceOrBalcony": true,
      "kitchen": true,
      "wifi": true
    }
  },
  {
    "slug": "a-8",
    "name": "A-8",
    "guests": "2 + 1",
    "rooms": 1,
    "baths": null,
    "area": 30,
    "floor": null,
    "image": "a-8-photo",
    "tag": "",
    "type": "couple",
    "price": null,
    "detailsConfirmed": true,
    "description": {
      "hr": "Apartman A-8 ima 30 m² i jednu spavaću sobu. Dostupno je 2 osnovna ležaja i 1 dodatni ležaj.",
      "en": "Apartment A-8 offers 30 m² and 1 bedroom. It has 2 standard beds and 1 extra bed.",
      "de": "Apartment A-8 bietet 30 m² und 1 Schlafzimmer. Es verfügt über 2 reguläre Schlafplätze und 1 Zusatzbett."
    },
    "amenities": {
      "parking": true,
      "terraceOrBalcony": true,
      "kitchen": true,
      "wifi": true
    }
  },
  {
    "slug": "a-12",
    "name": "A-12",
    "guests": "2 + 1",
    "rooms": 1,
    "baths": null,
    "area": 30,
    "floor": null,
    "image": "a-12-photo",
    "tag": "",
    "type": "couple",
    "price": null,
    "detailsConfirmed": true,
    "description": {
      "hr": "Apartman A-12 ima 30 m² i jednu spavaću sobu. Dostupno je 2 osnovna ležaja i 1 dodatni ležaj.",
      "en": "Apartment A-12 offers 30 m² and 1 bedroom. It has 2 standard beds and 1 extra bed.",
      "de": "Apartment A-12 bietet 30 m² und 1 Schlafzimmer. Es verfügt über 2 reguläre Schlafplätze und 1 Zusatzbett."
    },
    "amenities": {
      "parking": true,
      "terraceOrBalcony": true,
      "kitchen": true,
      "wifi": true
    }
  }
],
  photoCredits: [{"file": "peljesac-obala.jpg", "title": "Peljesac south coast.jpg", "author": "Yerpo", "source": "https://commons.wikimedia.org/wiki/File:Peljesac_south_coast.jpg", "license": "CC BY-SA 3.0", "licenseUrl": "https://creativecommons.org/licenses/by-sa/3.0"}, {"file": "peljesac-prapratno.jpg", "title": "Prapratno, Croatia.JPG", "author": "Neoneo13", "source": "https://commons.wikimedia.org/wiki/File:Prapratno,_Croatia.JPG", "license": "Public domain", "licenseUrl": "https://creativecommons.org/publicdomain/mark/1.0/"}, {"file": "peljesac-ston.jpg", "title": "View of Ston, Croatia.jpg", "author": "Bernard Gagnon", "source": "https://commons.wikimedia.org/wiki/File:View_of_Ston,_Croatia.jpg", "license": "CC BY-SA 4.0", "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0"}],
  photos: [
    {"key": "hero", "file": "peljesac-obala.jpg", "url": "https://upload.wikimedia.org/wikipedia/commons/5/53/Peljesac_south_coast.jpg", "alt": "Južna obala Pelješca", "altEn": "South coast of Pelješac", "altDe": "Südküste von Pelješac", "category": "location"},
    {"key": "beach", "file": "peljesac-prapratno.jpg", "url": "https://upload.wikimedia.org/wikipedia/commons/3/33/Prapratno%2C_Croatia.JPG", "alt": "Uvala Prapratno na Pelješcu", "altEn": "Prapratno bay on Pelješac", "altDe": "Bucht Prapratno auf Pelješac", "category": "location"},
    {"key": "sunset", "file": "peljesac-ston.jpg", "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d6/View_of_Ston%2C_Croatia.jpg/1920px-View_of_Ston%2C_Croatia.jpg", "alt": "Pogled na Ston na Pelješcu", "altEn": "View of Ston on Pelješac", "altDe": "Blick auf Ston auf Pelješac", "category": "location"},
  ]
};

// Editable multilingual content; property-specific answers stay unconfirmed.
window.SITE.aboutText={"hr": "Dobro došli u Luku Dubravu na Pelješcu. Apartmani se nalaze na adresi Luka Dubrava 28, a vaša je domaćica Marija Prpić. Za dogovor o boravku javite nam se telefonom.", "en": "Welcome to Luka Dubrava on the Pelješac peninsula. The apartments are at Luka Dubrava 28, and your host is Marija Prpić. Please call us to arrange your stay.", "de": "Willkommen in Luka Dubrava auf der Halbinsel Pelješac. Die Apartments liegen in Luka Dubrava 28. Ihre Gastgeberin ist Marija Prpić. Für Ihren Aufenthalt erreichen Sie uns telefonisch."};
window.SITE.faq=[
 {question:{hr:'Kako rezervirati apartman?',en:'How do I book an apartment?',de:'Wie buche ich ein Apartment?'},answer:{hr:'Odaberite apartman i datume pa pošaljite upit. Domaćin potvrđuje dostupnost, konačnu cijenu i uvjete. Upit i prikaz kalendara nisu potvrda rezervacije.',en:'Choose an apartment and dates, then send an enquiry. The host confirms availability, the final price and conditions. An enquiry or calendar display is not a confirmed reservation.',de:'Wählen Sie Apartment und Reisedaten und senden Sie eine Anfrage. Der Gastgeber bestätigt Verfügbarkeit, Endpreis und Bedingungen. Anfrage und Kalender sind keine Buchungsbestätigung.'}},
 {question:{hr:'Kada su prijava i odjava?',en:'When are check-in and check-out?',de:'Wann sind An- und Abreise?'},answer:{hr:'Točna vremena bit će dodana nakon potvrde domaćina. Za raniji dolazak ili kasniji odlazak navedite želju u upitu.',en:'Exact times will be added after host confirmation. Mention requests for early arrival or late departure in your enquiry.',de:'Die genauen Zeiten folgen nach Bestätigung des Gastgebers. Frühe Anreise oder späte Abreise bitte in der Anfrage angeben.'}},
 {question:{hr:'Je li osiguran parking?',en:'Is parking available?',de:'Gibt es Parkplätze?'},answer:{hr:'Parking za goste nalazi se ispred kuće. Navedite broj vozila u upitu kako bi domaćin potvrdio raspoloživa mjesta.',en:'Guest parking is in front of the house. Include your vehicle count so the host can confirm available spaces.',de:'Gästeparkplätze befinden sich vor dem Haus. Geben Sie die Fahrzeugzahl an, damit die Gastgeberin die verfügbaren Plätze bestätigen kann.'}},
 {question:{hr:'Jesu li kućni ljubimci dopušteni?',en:'Are pets allowed?',de:'Sind Haustiere erlaubt?'},answer:{hr:'Pravila još nisu potvrđena. U upitu navedite vrstu i broj kućnih ljubimaca i pričekajte potvrdu domaćina.',en:'The policy is not yet confirmed. Include the type and number of pets in your enquiry and wait for host confirmation.',de:'Die Regeln sind noch nicht bestätigt. Geben Sie Art und Anzahl der Haustiere an und warten Sie auf die Bestätigung.'}},
 {question:{hr:'Mogu li doći s djecom?',en:'Can I stay with children?',de:'Kann ich mit Kindern anreisen?'},answer:{hr:'U obrascu navedite broj odraslih i djece. Dostupnost dječjeg krevetića, hranilice i ostale opreme potrebno je potvrditi s domaćinom.',en:'Enter the number of adults and children in the form. Cots, high chairs and other equipment must be confirmed with the host.',de:'Geben Sie die Anzahl der Erwachsenen und Kinder an. Babybett, Hochstuhl und andere Ausstattung müssen bestätigt werden.'}},
 {question:{hr:'Kako se plaća i koji su uvjeti otkazivanja?',en:'What are the payment and cancellation terms?',de:'Welche Zahlungs- und Stornobedingungen gelten?'},answer:{hr:'Iznos predujma, način plaćanja i uvjete otkazivanja domaćin će navesti u ponudi prije potvrde rezervacije.',en:'The host will state the deposit, payment method and cancellation terms in the offer before you confirm the booking.',de:'Anzahlung, Zahlungsweise und Stornobedingungen nennt der Gastgeber im Angebot vor der Buchungsbestätigung.'}}
];
window.SITE.guide=[
  {
    "title": {
      "hr": "Luka Dubrava i more",
      "en": "Luka Dubrava and the sea",
      "de": "Luka Dubrava und das Meer"
    },
    "description": {
      "hr": "Upoznajte uvalu i šljunčanu plažu Luke Dubrave. Odaberite mjesto za kupanje prema vremenu i uvjetima na moru.",
      "en": "Explore Luka Dubrava bay and its pebble beach. Choose your swimming spot according to the weather and sea conditions.",
      "de": "Entdecken Sie die Bucht und den Kieselstrand von Luka Dubrava. Wählen Sie Ihren Badeplatz passend zu Wetter und Meeresbedingungen."
    },
    "category": "beaches",
    "photo": "beach",
    "url": "https://www.ston.hr/?u=luka-dubrava%2Fdeg%2Fst%2F53%2F53",
    "mapUrl": "https://www.google.com/maps/search/?api=1&query=Pla%C5%BEa%20Luka%20Dubrava%20Pelje%C5%A1ac"
  },
  {
    "title": {
      "hr": "Stonske zidine",
      "en": "Walls of Ston",
      "de": "Stadtmauern von Ston"
    },
    "description": {
      "hr": "Isplanirajte izlet do Stona i šetnju zidinama. Radno vrijeme, ulaznice i uvjete obilaska provjerite prije polaska.",
      "en": "Plan a trip to Ston and a walk along its walls. Check opening hours, tickets and visiting conditions before leaving.",
      "de": "Planen Sie einen Ausflug nach Ston und einen Spaziergang auf den Mauern. Prüfen Sie Öffnungszeiten, Eintritt und Bedingungen vorab."
    },
    "category": "walks",
    "photo": "sunset",
    "url": "https://www.ston.hr/?u=stonske-zidine%2Ffrg%2Fst%2F58%2F59",
    "mapUrl": "https://www.google.com/maps/search/?api=1&query=Stonske%20zidine"
  },
  {
    "title": {
      "hr": "Prapratno i obala Pelješca",
      "en": "Prapratno and the Pelješac coast",
      "de": "Prapratno und Pelješacs Küste"
    },
    "description": {
      "hr": "Otkrijte Prapratno i druge uvale Pelješca. Izlet automobilom prilagodite svojim željama i vremenskim uvjetima.",
      "en": "Discover Prapratno and other bays on Pelješac. Plan your drive around your interests and the weather.",
      "de": "Entdecken Sie Prapratno und weitere Buchten auf Pelješac. Passen Sie den Ausflug mit dem Auto Ihren Wünschen und dem Wetter an."
    },
    "category": "trips",
    "photo": "beach",
    "url": "https://www.ston.hr/",
    "mapUrl": "https://www.google.com/maps/search/?api=1&query=Prapratno%20Pelje%C5%A1ac"
  },
  {
    "title": {
      "hr": "Okusi Pelješca",
      "en": "Flavours of Pelješac",
      "de": "Die Aromen von Pelješac"
    },
    "description": {
      "hr": "Istražite lokalne restorane i ponudu pelješkog kraja. Radno vrijeme i rezervacije provjerite izravno s odabranim restoranom.",
      "en": "Explore local restaurants and the flavours of Pelješac. Check opening hours and reservations directly with your chosen restaurant.",
      "de": "Entdecken Sie lokale Restaurants und die Küche von Pelješac. Öffnungszeiten und Reservierungen direkt beim Restaurant prüfen."
    },
    "category": "food",
    "photo": "hero",
    "url": "https://www.ston.hr/",
    "mapUrl": "https://www.google.com/maps/search/?api=1&query=Restorani%20Luka%20Dubrava%20Pelje%C5%A1ac"
  }
];

// Property details and inclusive source price periods imported from the supplied workbook.
const propertySpecification={"site":{"name":"Meleh Apartmani","checkIn":"15:00","checkOut":"10:00","pets":"Da · 10 € / dan","categoryStars":3,"touristTaxIncluded":true,"arrivalDays":{"hr":"Dolazak je moguć bilo kojim danom.","en":"Arrival is possible on any day.","de":"Anreise ist an jedem Wochentag möglich."},"distances":{"beach":"200 m","center":null,"shop":"3 km","restaurant":"300 m","airport":null,"parking":"Besplatan privatni parking ispred kuće"},"aboutText":{"hr":"Meleh Apartmani nalaze se u Luci Dubravi na Pelješcu, na adresi Luka Dubrava 28. Kuća s tri zvjezdice ima šest klimatiziranih apartmana s terasom i balkonom, opremljenom kuhinjom, vlastitom kupaonicom, pogledom na more i vrt te prostorom za sjedenje i blagovanje. Gostima su dostupni besplatan Wi-Fi i privatni parking ispred kuće, posteljina, ručnici, okućnica, roštilj i stolni tenis. More je udaljeno 10 m, a plaža 200 m. Kućni ljubimci su dobrodošli uz doplatu 10 € dnevno.","en":"Meleh Apartments are in Luka Dubrava on Pelješac, at Luka Dubrava 28. The three-star house offers six air-conditioned apartments with a terrace and balcony, equipped kitchen, private bathroom, sea and garden views, seating and dining areas. Guests enjoy free Wi-Fi and private parking in front of the house, bed linen, towels, the garden, a barbecue and table tennis. The sea is 10 m away and the beach is 200 m away. Pets are welcome for €10 per day.","de":"Die Meleh Apartments liegen in Luka Dubrava auf Pelješac, Luka Dubrava 28. Das Haus mit drei Sternen bietet sechs klimatisierte Apartments mit Terrasse und Balkon, ausgestatteter Küche, eigenem Bad, Meer- und Gartenblick sowie Sitz- und Essbereich. WLAN und Privatparkplätze vor dem Haus sind kostenlos. Bettwäsche, Handtücher, Garten, Grill und Tischtennis stehen zur Verfügung. Das Meer ist 10 m, der Strand 200 m entfernt. Haustiere sind für 10 € pro Tag willkommen."},"nearby":[{"label":{"hr":"More","en":"Sea","de":"Meer"},"distance":"10 m"},{"label":{"hr":"Plaža","en":"Beach","de":"Strand"},"distance":"200 m"},{"label":{"hr":"Restoran","en":"Restaurant","de":"Restaurant"},"distance":"300 m"},{"label":{"hr":"Market","en":"Grocery shop","de":"Lebensmittelgeschäft"},"distance":"3 km"},{"label":{"hr":"Pošta","en":"Post office","de":"Post"},"distance":"3 km"},{"label":{"hr":"Liječnik","en":"Doctor","de":"Arzt"},"distance":"3 km"},{"label":{"hr":"Bankomat","en":"ATM","de":"Geldautomat"},"distance":"3 km"},{"label":{"hr":"Ljekarna","en":"Pharmacy","de":"Apotheke"},"distance":"3 km"},{"label":{"hr":"Autobusno stajalište","en":"Bus stop","de":"Bushaltestelle"},"distance":"3 km"},{"label":{"hr":"Benzinska postaja","en":"Petrol station","de":"Tankstelle"},"distance":"10 km"}],"propertyFacts":[{"label":{"hr":"Kategorija","en":"Category","de":"Kategorie"},"value":{"hr":"3 zvjezdice","en":"3 stars","de":"3 Sterne"}},{"label":{"hr":"Smještaj","en":"Accommodation","de":"Unterkunft"},"value":{"hr":"6 apartmana","en":"6 apartments","de":"6 Apartments"}},{"label":{"hr":"Ukupno soba u objektu","en":"Total rooms in the property","de":"Zimmer insgesamt im Haus"},"value":{"hr":"15","en":"15","de":"15"}},{"label":{"hr":"Parking i internet","en":"Parking and internet","de":"Parkplätze und Internet"},"value":{"hr":"Besplatan privatni parking i Wi-Fi","en":"Free private parking and Wi-Fi","de":"Kostenlose Privatparkplätze und WLAN"}},{"label":{"hr":"Uključeno","en":"Included","de":"Inklusive"},"value":{"hr":"Posteljina, ručnici i boravišna pristojba","en":"Bed linen, towels and tourist tax","de":"Bettwäsche, Handtücher und Kurtaxe"}},{"label":{"hr":"Zajednički sadržaji","en":"Shared facilities","de":"Gemeinschaftliche Ausstattung"},"value":{"hr":"Okućnica, roštilj i stolni tenis","en":"Garden, barbecue and table tennis","de":"Garten, Grill und Tischtennis"}},{"label":{"hr":"Za nautičare","en":"For boaters","de":"Für Bootsfahrer"},"value":{"hr":"Mogućnost veza za čamac","en":"Boat mooring available","de":"Bootsliegeplatz möglich"}},{"label":{"hr":"Plaže","en":"Beaches","de":"Strände"},"value":{"hr":"Šljunčana i betonska plaža","en":"Pebble and concrete beaches","de":"Kies- und Betonstrände"}},{"label":{"hr":"Aktivnosti u okolici","en":"Activities nearby","de":"Aktivitäten in der Umgebung"},"value":{"hr":"Ronjenje i snorkeling","en":"Diving and snorkelling","de":"Tauchen und Schnorcheln"}},{"label":{"hr":"Sadržaji koji nisu dostupni","en":"Facilities not available","de":"Nicht verfügbare Ausstattung"},"value":{"hr":"Garaža, bazen, whirlpool, tenisko igralište i polupansion","en":"Garage, pool, whirlpool, tennis court and half board","de":"Garage, Pool, Whirlpool, Tennisplatz und Halbpension"}}],"smoking":"Pušenje nije dopušteno u apartmanu. Dopušteno je na balkonu ili terasi.","quietHours":null},"apartments":{"a-3":{"name":"A-3","guests":"2 + 1","rooms":1,"area":30,"minNights":7,"petFee":10,"description":{"hr":"Apartman A-3 ima 30 m² i jednu spavaću sobu. Na raspolaganju su 2 osnovna ležaja i 1 dodatni ležaj. Apartman ima terasu i balkon, pogled na more i vrt, klimatizaciju, opremljenu kuhinju, vlastitu kupaonicu i TV/SAT. Wi-Fi i privatni parking su besplatni.","en":"Apartment A-3 offers 30 m², 1 bedroom and 2 standard beds plus 1 extra bed. Enjoy a terrace and balcony, sea and garden views, air conditioning, an equipped kitchen, a private bathroom and TV/SAT. Wi-Fi and private parking are free.","de":"Apartment A-3 bietet 30 m², 1 Schlafzimmer und 2 reguläre Schlafplätze sowie 1 Zusatzbett. Zur Ausstattung gehören Terrasse und Balkon, Meer- und Gartenblick, Klimaanlage, eine ausgestattete Küche, ein eigenes Bad und TV/SAT. WLAN und Privatparkplätze sind kostenlos."},"amenities":{"terrace":true,"balcony":true,"aircon":true,"tv":true,"fridge":true,"washingMachine":false,"microwave":false,"kettle":true,"stove":true,"freezer":true,"grill":true,"dishwasher":false,"seaView":true,"terraceOrBalcony":true,"parking":true,"wifi":true,"kitchen":true,"privateBathroom":true,"gardenView":true},"seasons":[{"to":"2026-07-01","nightly":70,"minNights":7,"from":"2026-06-01"},{"to":"2026-09-01","nightly":80,"minNights":7,"from":"2026-07-01"},{"to":"2026-10-01","nightly":70,"minNights":7,"from":"2026-09-01"},{"to":"2027-07-01","nightly":70,"minNights":7,"from":"2027-06-01"},{"to":"2027-09-01","nightly":80,"minNights":7,"from":"2027-07-01"},{"to":"2027-10-01","nightly":70,"minNights":7,"from":"2027-09-01"}]},"a-8":{"name":"A-8","guests":"2 + 1","rooms":1,"area":30,"minNights":7,"petFee":10,"description":{"hr":"Apartman A-8 ima 30 m² i jednu spavaću sobu. Na raspolaganju su 2 osnovna ležaja i 1 dodatni ležaj. Apartman ima terasu i balkon, pogled na more i vrt, klimatizaciju, opremljenu kuhinju, vlastitu kupaonicu i TV/SAT. Wi-Fi i privatni parking su besplatni.","en":"Apartment A-8 offers 30 m², 1 bedroom and 2 standard beds plus 1 extra bed. Enjoy a terrace and balcony, sea and garden views, air conditioning, an equipped kitchen, a private bathroom and TV/SAT. Wi-Fi and private parking are free.","de":"Apartment A-8 bietet 30 m², 1 Schlafzimmer und 2 reguläre Schlafplätze sowie 1 Zusatzbett. Zur Ausstattung gehören Terrasse und Balkon, Meer- und Gartenblick, Klimaanlage, eine ausgestattete Küche, ein eigenes Bad und TV/SAT. WLAN und Privatparkplätze sind kostenlos."},"amenities":{"terrace":true,"balcony":true,"aircon":true,"tv":true,"fridge":true,"washingMachine":false,"microwave":false,"kettle":true,"stove":true,"freezer":true,"grill":true,"dishwasher":false,"seaView":true,"terraceOrBalcony":true,"parking":true,"wifi":true,"kitchen":true,"privateBathroom":true,"gardenView":true},"seasons":[{"to":"2026-07-01","nightly":70,"minNights":7,"from":"2026-06-01"},{"to":"2026-09-01","nightly":80,"minNights":7,"from":"2026-07-01"},{"to":"2026-10-01","nightly":70,"minNights":7,"from":"2026-09-01"},{"to":"2027-07-01","nightly":70,"minNights":7,"from":"2027-06-01"},{"to":"2027-09-01","nightly":80,"minNights":7,"from":"2027-07-01"},{"to":"2027-10-01","nightly":70,"minNights":7,"from":"2027-09-01"}]},"a-12":{"name":"A-12","guests":"2 + 1","rooms":1,"area":30,"minNights":1,"petFee":10,"description":{"hr":"Apartman A-12 ima 30 m² i jednu spavaću sobu. Na raspolaganju su 2 osnovna ležaja i 1 dodatni ležaj. Apartman ima terasu i balkon, pogled na more i vrt, klimatizaciju, opremljenu kuhinju, vlastitu kupaonicu i TV/SAT. Wi-Fi i privatni parking su besplatni.","en":"Apartment A-12 offers 30 m², 1 bedroom and 2 standard beds plus 1 extra bed. Enjoy a terrace and balcony, sea and garden views, air conditioning, an equipped kitchen, a private bathroom and TV/SAT. Wi-Fi and private parking are free.","de":"Apartment A-12 bietet 30 m², 1 Schlafzimmer und 2 reguläre Schlafplätze sowie 1 Zusatzbett. Zur Ausstattung gehören Terrasse und Balkon, Meer- und Gartenblick, Klimaanlage, eine ausgestattete Küche, ein eigenes Bad und TV/SAT. WLAN und Privatparkplätze sind kostenlos."},"amenities":{"terrace":true,"balcony":true,"aircon":true,"tv":true,"fridge":true,"washingMachine":false,"microwave":false,"kettle":true,"stove":true,"freezer":true,"grill":true,"dishwasher":false,"seaView":true,"terraceOrBalcony":true,"parking":true,"wifi":true,"kitchen":true,"privateBathroom":true,"gardenView":true},"seasons":[{"to":"2026-07-01","nightly":70,"minNights":1,"from":"2026-06-01"},{"to":"2026-09-01","nightly":80,"minNights":1,"from":"2026-07-01"},{"to":"2026-10-01","nightly":70,"minNights":1,"from":"2026-09-01"},{"to":"2027-07-01","nightly":70,"minNights":1,"from":"2027-06-01"},{"to":"2027-09-01","nightly":80,"minNights":1,"from":"2027-07-01"},{"to":"2027-10-01","nightly":70,"minNights":1,"from":"2027-09-01"}]},"a-4":{"name":"A-4","guests":"4","rooms":2,"area":60,"minNights":1,"petFee":10,"description":{"hr":"Apartman A-4 ima 60 m² i dvije spavaće sobe. Na raspolaganju su 4 osnovna ležaja. Apartman ima terasu i balkon, pogled na more i vrt, klimatizaciju, opremljenu kuhinju, vlastitu kupaonicu i TV/SAT. Wi-Fi i privatni parking su besplatni.","en":"Apartment A-4 offers 60 m², 2 bedrooms and 4 standard beds. Enjoy a terrace and balcony, sea and garden views, air conditioning, an equipped kitchen, a private bathroom and TV/SAT. Wi-Fi and private parking are free.","de":"Apartment A-4 bietet 60 m², 2 Schlafzimmer und 4 reguläre Schlafplätze. Zur Ausstattung gehören Terrasse und Balkon, Meer- und Gartenblick, Klimaanlage, eine ausgestattete Küche, ein eigenes Bad und TV/SAT. WLAN und Privatparkplätze sind kostenlos."},"amenities":{"terrace":true,"balcony":true,"aircon":true,"tv":true,"fridge":true,"washingMachine":false,"microwave":true,"kettle":true,"stove":true,"freezer":true,"grill":true,"dishwasher":true,"seaView":true,"terraceOrBalcony":true,"parking":true,"wifi":true,"kitchen":true,"privateBathroom":true,"gardenView":true},"seasons":[{"to":"2026-07-01","nightly":70,"minNights":1,"from":"2026-06-01"},{"to":"2026-09-01","nightly":110,"minNights":1,"from":"2026-07-01"},{"to":"2026-10-01","nightly":70,"minNights":1,"from":"2026-09-01"},{"to":"2027-07-01","nightly":70,"minNights":1,"from":"2027-06-01"},{"to":"2027-09-01","nightly":110,"minNights":1,"from":"2027-07-01"},{"to":"2027-10-01","nightly":70,"minNights":1,"from":"2027-09-01"}]},"a-9":{"name":"A-9","guests":"4","rooms":2,"area":60,"minNights":1,"petFee":10,"description":{"hr":"Apartman A-9 ima 60 m² i dvije spavaće sobe. Na raspolaganju su 4 osnovna ležaja. Apartman ima terasu i balkon, pogled na more i vrt, klimatizaciju, opremljenu kuhinju, vlastitu kupaonicu i TV/SAT. Wi-Fi i privatni parking su besplatni.","en":"Apartment A-9 offers 60 m², 2 bedrooms and 4 standard beds. Enjoy a terrace and balcony, sea and garden views, air conditioning, an equipped kitchen, a private bathroom and TV/SAT. Wi-Fi and private parking are free.","de":"Apartment A-9 bietet 60 m², 2 Schlafzimmer und 4 reguläre Schlafplätze. Zur Ausstattung gehören Terrasse und Balkon, Meer- und Gartenblick, Klimaanlage, eine ausgestattete Küche, ein eigenes Bad und TV/SAT. WLAN und Privatparkplätze sind kostenlos."},"amenities":{"terrace":true,"balcony":true,"aircon":true,"tv":true,"fridge":true,"washingMachine":false,"microwave":true,"kettle":true,"stove":true,"freezer":true,"grill":true,"dishwasher":true,"seaView":true,"terraceOrBalcony":true,"parking":true,"wifi":true,"kitchen":true,"privateBathroom":true,"gardenView":true},"seasons":[{"to":"2026-07-01","nightly":70,"minNights":1,"from":"2026-06-01"},{"to":"2026-09-01","nightly":110,"minNights":1,"from":"2026-07-01"},{"to":"2026-10-01","nightly":70,"minNights":1,"from":"2026-09-01"},{"to":"2027-07-01","nightly":70,"minNights":1,"from":"2027-06-01"},{"to":"2027-09-01","nightly":110,"minNights":1,"from":"2027-07-01"},{"to":"2027-10-01","nightly":70,"minNights":1,"from":"2027-09-01"}]},"a-13":{"name":"A-13","guests":"4","rooms":2,"area":60,"minNights":1,"petFee":10,"description":{"hr":"Apartman A-13 ima 60 m² i dvije spavaće sobe. Na raspolaganju su 4 osnovna ležaja. Apartman ima terasu i balkon, pogled na more i vrt, klimatizaciju, opremljenu kuhinju, vlastitu kupaonicu i TV/SAT. Wi-Fi i privatni parking su besplatni.","en":"Apartment A-13 offers 60 m², 2 bedrooms and 4 standard beds. Enjoy a terrace and balcony, sea and garden views, air conditioning, an equipped kitchen, a private bathroom and TV/SAT. Wi-Fi and private parking are free.","de":"Apartment A-13 bietet 60 m², 2 Schlafzimmer und 4 reguläre Schlafplätze. Zur Ausstattung gehören Terrasse und Balkon, Meer- und Gartenblick, Klimaanlage, eine ausgestattete Küche, ein eigenes Bad und TV/SAT. WLAN und Privatparkplätze sind kostenlos."},"amenities":{"terrace":true,"balcony":true,"aircon":true,"tv":true,"fridge":true,"washingMachine":false,"microwave":false,"kettle":true,"stove":true,"freezer":true,"grill":true,"dishwasher":false,"seaView":true,"terraceOrBalcony":true,"parking":true,"wifi":true,"kitchen":true,"privateBathroom":true,"gardenView":true},"seasons":[{"to":"2026-07-01","nightly":70,"minNights":1,"from":"2026-06-01"},{"to":"2026-09-01","nightly":110,"minNights":1,"from":"2026-07-01"},{"to":"2026-10-01","nightly":70,"minNights":1,"from":"2026-09-01"},{"to":"2027-07-01","nightly":70,"minNights":1,"from":"2027-06-01"},{"to":"2027-09-01","nightly":110,"minNights":1,"from":"2027-07-01"},{"to":"2027-10-01","nightly":70,"minNights":1,"from":"2027-09-01"}]}}};
Object.assign(window.SITE,propertySpecification.site);
window.SITE.apartments=window.SITE.apartments.map(a=>({...a,...propertySpecification.apartments[a.slug]}));

window.SITE.faq=window.SITE.faq.map(f=>{
 if(f.question.hr==='Kada su prijava i odjava?')return {...f,answer:{hr:'Prijava je od 15:00, a odjava do 10:00. Dolazak je moguć bilo kojim danom.',en:'Check-in is from 15:00 and check-out is by 10:00. Arrival is possible on any day.',de:'Anreise ab 15:00 Uhr, Abreise bis 10:00 Uhr. Anreise ist an jedem Wochentag möglich.'}};
 if(f.question.hr==='Jesu li kućni ljubimci dopušteni?')return {...f,answer:{hr:'Kućni ljubimci su dopušteni uz doplatu 10 € dnevno.',en:'Pets are welcome for an additional €10 per day.',de:'Haustiere sind gegen einen Aufpreis von 10 € pro Tag erlaubt.'}};
 return f;
});
window.SITE.faq.push({question:{hr:'Koliko je plaža udaljena?',en:'How far is the beach?',de:'Wie weit ist der Strand entfernt?'},answer:{hr:'More je udaljeno 10 m, a plaža 200 m od objekta.',en:'The sea is 10 m away and the beach is 200 m from the property.',de:'Das Meer ist 10 m und der Strand 200 m von der Unterkunft entfernt.'}},{question:{hr:'Što je uključeno u cijenu?',en:'What is included in the price?',de:'Was ist im Preis enthalten?'},answer:{hr:'Uključeni su Wi-Fi, privatni parking, posteljina, ručnici i boravišna pristojba. Za ljubimce se dodatno naplaćuje 10 € dnevno.',en:'Wi-Fi, private parking, bed linen, towels and tourist tax are included. Pets cost an additional €10 per day.',de:'WLAN, Privatparkplätze, Bettwäsche, Handtücher und Kurtaxe sind inklusive. Haustiere kosten zusätzlich 10 € pro Tag.'}});
