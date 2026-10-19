// Centralno mjesto za unos potvrđenih podataka. null = podatak još nije dostavljen.
window.SITE = {
  name: 'Meleh Apartmani', demo: true, location: null, address: null,
  email: null, phone: null, whatsapp: null, viber: null,
  mapEmbed: null, mapsUrl: null, instagram: null, facebook: null,
  checkIn: null, checkOut: null, pets: null, smoking: null, quietHours: null,
  distances: {beach:null, center:null, shop:null, restaurant:null, airport:null},
  reviews: [],
  apartments: [
    {slug:'maslina',name:'Maslina',guests:'2 + 2',rooms:1,baths:1,area:45,floor:'1',image:'room',tag:'Za lagana jutra',type:'couple',price:null},
    {slug:'lavanda',name:'Lavanda',guests:'4 + 1',rooms:2,baths:1,area:65,floor:'1',image:'bedroom',tag:'Mjesto za cijelu obitelj',type:'family',price:null},
    {slug:'more',name:'More',guests:'2',rooms:1,baths:1,area:35,floor:'2',image:'house',tag:'Vaš mali bijeg',type:'couple',price:null}
  ],
  photoCredits: [
    {file:'crikvenica-plaza.jpg',title:'Beach - Crikvenica (8)',author:'Elekes Andor',source:'https://commons.wikimedia.org/wiki/File:Beach_-_Crikvenica_(8).jpg',license:'CC BY-SA 4.0',licenseUrl:'https://creativecommons.org/licenses/by-sa/4.0/'},
    {file:'crikvenica-obala.jpg',title:'Crikvenica, beach',author:'Zoran Kurelić Rabko',source:'https://commons.wikimedia.org/wiki/File:Crikvenica,_beach_-_panoramio.jpg',license:'CC BY-SA 3.0',licenseUrl:'https://creativecommons.org/licenses/by-sa/3.0/'},
    {file:'crikvenica-more.jpg',title:'Beach - Crikvenica (9)',author:'Elekes Andor',source:'https://commons.wikimedia.org/wiki/File:Beach_-_Crikvenica_(9).jpg',license:'CC BY-SA 4.0',licenseUrl:'https://creativecommons.org/licenses/by-sa/4.0/'}
  ],
  photos: [
    {key:'hero',file:'crikvenica-plaza.jpg',alt:'Borovi i more u večernjem svjetlu na plaži u Crikvenici',altEn:'Pine trees by the sea in the evening light in Crikvenica',altDe:'Pinien am Meer im Abendlicht in Crikvenica',category:'location'},
    {key:'room',file:'room.jpg',alt:'Prozračan dnevni boravak u neutralnim tonovima',category:'maslina'},
    {key:'bedroom',file:'bedroom.jpg',alt:'Spavaća soba u toplim tonovima',category:'lavanda'},
    {key:'house',file:'house.jpg',alt:'Ogledni suvremeni interijer s blagovaonicom',category:'more'},
    {key:'beach',file:'crikvenica-obala.jpg',alt:'Šljunčana plaža Balustrada u Crikvenici',altEn:'Balustrada pebble beach in Crikvenica',altDe:'Kieselstrand Balustrada in Crikvenica',category:'location'},
    {key:'sunset',file:'crikvenica-more.jpg',alt:'Zalazak sunca na plaži Crni Molo u Crikvenici',altEn:'Sunset at Crni Molo beach in Crikvenica',altDe:'Sonnenuntergang am Strand Crni Molo in Crikvenica',category:'location'},
    {key:'detail',file:'detail.jpg',alt:'Topli detalji interijera',category:'house'}
  ]
};
