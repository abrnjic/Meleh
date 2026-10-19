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
    {slug:'more',name:'More',guests:'2',rooms:1,baths:1,area:35,floor:'2',image:'terrace',tag:'Vaš mali bijeg',type:'couple',price:null}
  ],
  photos: [
    {key:'hero',file:'coast.jpg',alt:'Mediteranska obala i tirkizno more',category:'location'},
    {key:'room',file:'room.jpg',alt:'Prozračan dnevni boravak u neutralnim tonovima',category:'maslina'},
    {key:'bedroom',file:'bedroom.jpg',alt:'Spavaća soba u toplim tonovima',category:'lavanda'},
    {key:'terrace',file:'terrace.jpg',alt:'Ilustrativna kuća za odmor s bazenom',category:'more'},
    {key:'house',file:'house.jpg',alt:'Suvremeni interijer s blagovaonicom',category:'house'},
    {key:'detail',file:'detail.jpg',alt:'Topli detalji interijera',category:'house'}
  ]
};
