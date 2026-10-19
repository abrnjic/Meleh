# Meleh Apartmani

Glavni repozitorij: https://github.com/abrnjic/Meleh. Hosting: Vercel. Ako uvedemo bazu podataka, koristimo Firebase.

Responzivna statička web stranica na hrvatskom, engleskom i njemačkom jeziku. Za rad stranice nisu potrebne ovisnosti.

## Lokalni pregled

Iz ovog direktorija: `python3 -m http.server 4173 --directory dist`, zatim otvorite `http://localhost:4173`.

## Unos podataka

Uredite `dist/content.js`: naziv, lokaciju, adresu, e-mail, telefon, WhatsApp/Viber brojeve u međunarodnom formatu, Google Maps embed URL i poveznicu za upute, društvene mreže, kućni red i udaljenosti. Podaci koji nedostaju imaju vrijednost `null`. Koristite samo provjerene poveznice.

Tri apartmana i fotografije su ogledni primjeri. Zamijenite fotografije u `dist/assets/`, podatke u `SITE.apartments` i tekstove u `dist/app.js`. Za svaki novi apartman dodajte pripadajuću mapu s kopijom `dist/index.html`, kao kod postojećih apartmana. `app.js` bira stranicu prema putanji. Pri promjeni zajedničkog HTML zaglavlja osvježite kopije index.html u podmapama. Tekstovi i prijevodi su u pozivima `t(hr,en,de)`.

## Fotografije

Prizori destinacije su stvarne fotografije Crikvenice, preuzete s Wikimedia Commonsa. Autor, izvor, licenca i prilagodbe navedeni su na javnoj stranici `/fotografije/` i u `SITE.photoCredits`. Fotografije su smanjene na širinu 1600 px i u pojedinim sekcijama prikazane kroz CSS izrez i zatamnjenje. Izmijenjeni prikazi dostupni su pod izvornom licencom.

- `crikvenica-plaza.jpg`: Elekes Andor, Beach - Crikvenica (8), CC BY-SA 4.0.
- `crikvenica-obala.jpg`: Zoran Kurelić Rabko, Crikvenica, beach - panoramio, CC BY-SA 3.0.
- `crikvenica-more.jpg`: Elekes Andor, Beach - Crikvenica (9), CC BY-SA 4.0.

Četiri fotografije interijera s Unsplasha ostaju jasno označene kao ogledne i ne prikazuju apartmane Meleh. Fotografije destinacije nisu fotografije objekta i ne potvrđuju njegovu točnu lokaciju. Fotografije se poslužuju lokalno. Fontovi se učitavaju s Google Fonts, uz sistemske zamjene.

## Svijetla i tamna tema

Prekidač s ikonom sunca/mjeseca nalazi se u zaglavlju svih stranica, uz izbornik jezika. Pri prvom posjetu slijedi sistemsku postavku `prefers-color-scheme`. Ručni izbor sprema se lokalno pod ključem `meleh-theme` i vrijedi pri navigaciji, osvježavanju i u drugim karticama. Bez ručnog izbora tema prati promjene postavke uređaja. Ako lokalna pohrana nije dostupna, prekidač i dalje radi u trenutnoj stranici.

`dist/theme.js` učitava se prije CSS-a kako bi se izbjegao bljesak pogrešne teme. Boje obiju tema definirane su CSS varijablama u `dist/style.css`.

## Upiti

Obrazac provjerava obavezna polja, datume i broj gostiju prema odabranom apartmanu. Podaci se obrađuju u pregledniku, bez slanja na poslužitelj i bez pohrane osobnih podataka. Pripremljeni upit može se kopirati ili preuzeti kao tekst. Kada je unesen `SITE.email`, pojavljuje se poveznica za otvaranje korisnikove aplikacije za e-poštu s pripremljenim upitom. Korisnik poruku šalje iz te aplikacije. Za automatsku dostavu treba naknadno povezati servis za slanje e-pošte.

## Prije objave za goste

Potvrdite sve podatke o apartmanima, sadržajima, cijenama, udaljenostima i kućnom redu. Zamijenite ogledne tekstove i fotografije, dodajte potvrđene recenzije s izvorom i dovršite privatnost te uvjete poslovanja stvarnim podacima vlasnika. Tada uklonite demo obavijesti iz `app.js`. Vrijednost `SITE.demo` samo je urednička oznaka i sama ne skriva obavijesti.

## Struktura

- `dist/index.html`: ulazni dokument
- `dist/style.css`: responzivni stilovi
- `dist/app.js`: stranice, prijevodi i interakcije
- `dist/content.js`: podaci vlasnika i apartmana te izvori fotografija
- `dist/theme.js`: inicijalizacija i pamćenje teme
- `dist/assets/`: fotografije i favicon
- `vercel.json`: Vercel konfiguracija za posluživanje mape `dist`

## GitHub i Vercel

Repozitorij treba biti povezan s postojećim Vercel projektom `meleh`. Postavke: Root Directory = korijen repozitorija; Framework Preset = Other; Build Command i Install Command bez naredbe; Output Directory = `dist`. Te vrijednosti deklarirane su u `vercel.json`. Stranica nema build korak ni npm ovisnosti. Glavna grana je `main`; radne grane mogu koristiti Vercel preview deployment.

Ne prenosimo Sites identitet, konfiguraciju ni repozitorij u ovaj projekt. Stari Sites pregled je zasebna ogledna objava.

## Firebase

Trenutno nije potreban i nije konfiguriran. Ako uvedemo trajno spremanje upita, administraciju ili kalendar zauzetosti, koristimo Firebase. U tom koraku dodaju se autentikacija, ograničenja pristupa i potrebna pravila. Ne spremati privatne servisne ključeve u frontend ili Git. Varijable i konfiguraciju uvodimo tek s konkretnom funkcionalnosti.

## Administrator

Administratorski email postavlja se privatnom varijablom `ADMIN_EMAIL`, odvojeno od javnog kontakta `SITE.email`. Lokalna vrijednost nalazi se u `.env.local`, koji je izuzet iz Gita. `.env.example` sadrži samo predložak bez adrese. Za hosting se ova vrijednost postavlja u Vercel Environment Variables; ne koristiti javni frontend prefiks niti kopirati stvarnu vrijednost u `dist`.

Administratorska prijava i autorizacija još nisu implementirane. Pri uvođenju administracije povezati ovaj identitet s provjerenim Firebase Auth računom i provoditi autorizaciju na poslužitelju odnosno u Firebase pravilima. Sam zapis emaila ne daje pristup niti stvara korisnički račun. Trenutna statička stranica ne učitava ovu varijablu.
