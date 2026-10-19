# Meleh Apartmani

Glavni repozitorij: https://github.com/abrnjic/Meleh. Hosting: Vercel. Ako uvedemo bazu podataka, koristimo Firebase.

Responzivna statička web stranica na hrvatskom, engleskom i njemačkom jeziku. Za rad stranice nisu potrebne ovisnosti.

## Lokalni pregled

Iz ovog direktorija: `python3 -m http.server 4173 --directory dist`, zatim otvorite `http://localhost:4173`.

## Unos podataka

Uredite `dist/content.js`: naziv, lokaciju, adresu, e-mail, telefon, WhatsApp/Viber brojeve u međunarodnom formatu, Google Maps embed URL i poveznicu za upute, društvene mreže, kućni red i udaljenosti. Podaci koji nedostaju imaju vrijednost `null`. Koristite samo provjerene poveznice.

Tri apartmana i fotografije su ogledni primjeri. Zamijenite fotografije u `dist/assets/`, podatke u `SITE.apartments` i tekstove u `dist/app.js`. Za svaki novi apartman dodajte pripadajuću mapu s kopijom `dist/index.html`, kao kod postojećih apartmana. `app.js` bira stranicu prema putanji. Pri promjeni zajedničkog HTML zaglavlja osvježite kopije index.html u podmapama. Tekstovi i prijevodi su u pozivima `t(hr,en,de)`.

Fotografije su ilustrativne fotografije s Unsplasha; ne prikazuju stvarni objekt. Izvori: photo-1533105079780-92b9be482077, photo-1600210492486-724fe5c67fb0, photo-1611892440504-42a792e24d32, photo-1613490493576-7fde63acd811, photo-1600607687920-4e2a09cf159d, photo-1600210491892-03d54c0aaf87. Fotografije se poslužuju lokalno. Fontovi se učitavaju s Google Fonts, uz sistemske zamjene.

## Upiti

Obrazac provjerava obavezna polja, datume i broj gostiju prema odabranom apartmanu. Podaci se obrađuju u pregledniku, bez slanja na poslužitelj i bez pohrane osobnih podataka. Pripremljeni upit može se kopirati ili preuzeti kao tekst. Kada je unesen `SITE.email`, pojavljuje se poveznica za otvaranje korisnikove aplikacije za e-poštu s pripremljenim upitom. Korisnik poruku šalje iz te aplikacije. Za automatsku dostavu treba naknadno povezati servis za slanje e-pošte.

## Prije objave za goste

Potvrdite sve podatke o apartmanima, sadržajima, cijenama, udaljenostima i kućnom redu. Zamijenite ogledne tekstove i fotografije, dodajte potvrđene recenzije s izvorom i dovršite privatnost te uvjete poslovanja stvarnim podacima vlasnika. Tada uklonite demo obavijesti iz `app.js`. Vrijednost `SITE.demo` samo je urednička oznaka i sama ne skriva obavijesti.

## Struktura

- `dist/index.html`: ulazni dokument
- `dist/style.css`: responzivni stilovi
- `dist/app.js`: stranice, prijevodi i interakcije
- `dist/content.js`: podaci vlasnika i apartmana
- `dist/assets/`: fotografije i favicon
- `vercel.json`: Vercel konfiguracija za posluživanje mape `dist`

## GitHub i Vercel

Repozitorij treba biti povezan s postojećim Vercel projektom `meleh`. Postavke: Root Directory = korijen repozitorija; Framework Preset = Other; Build Command i Install Command bez naredbe; Output Directory = `dist`. Te vrijednosti deklarirane su u `vercel.json`. Stranica nema build korak ni npm ovisnosti. Glavna grana je `main`; radne grane mogu koristiti Vercel preview deployment.

Ne prenosimo Sites identitet, konfiguraciju ni repozitorij u ovaj projekt. Stari Sites pregled je zasebna ogledna objava.

## Firebase

Trenutno nije potreban i nije konfiguriran. Ako uvedemo trajno spremanje upita, administraciju ili kalendar zauzetosti, koristimo Firebase. U tom koraku dodaju se autentikacija, ograničenja pristupa i potrebna pravila. Ne spremati privatne servisne ključeve u frontend ili Git. Varijable i konfiguraciju uvodimo tek s konkretnom funkcionalnosti.
