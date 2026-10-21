# Konfiguracija i održavanje projekta

Ovaj dokument opisuje lokalno pokretanje, povezivanje servisa i provjeru objave projekta **Meleh Apartmani**. Pregled funkcionalnosti i strukture repozitorija nalazi se u [README.md](README.md).

## 1. Postojeće okruženje

| Komponenta | Konfiguracija projekta |
| --- | --- |
| GitHub | `abrnjic/Meleh`, grana `main` |
| Vercel | Projekt `meleh`, tim `proservers-projects` |
| Radna domena | `https://meleh.vercel.app` |
| Runtime | Node.js 24 |
| Firebase | Projekt `meleh-ce687` |
| Firestore | Baza `(default)`, regija `europe-west3` — Frankfurt |
| Prijava | Google putem Firebase Authenticationa |
| Serverski pristup | Vercel OIDC i Google Workload Identity Federation za produkcijsko okruženje |
| Kalendari | Pozadinski zadatak svakih 15 minuta |

Postojeću bazu i federaciju nije potrebno ponovno stvarati. Storage za nove prijenose fotografija i Resend za e-poštu zasebne su integracije; njihovu aktivnost treba provjeriti prije korištenja. Fotografije uključene u repozitorij poslužuju se bez Storagea.

**Vercelova domena trenutačna je radna adresa, a ne konačna domena objekta.** Postupak prelaska na stvarnu domenu nalazi se u odjeljku 8.

## 2. Lokalno pokretanje

Instalirati Node.js 24 i npm, zatim u korijenu repozitorija pokrenuti:

```sh
npm ci --ignore-scripts
cp .env.example .env.local
npm run build
npm run dev
```

Ako `.env.local` već postoji, dopuniti postojeću datoteku umjesto ponovnog kopiranja predloška. Lokalna adresa je `http://127.0.0.1:4174`; varijabla `PORT` mijenja port.

Javni sadržaj može se pregledavati bez serverskih vjerodajnica. Za prijavu i spremanje u bazu potrebno je konfigurirati Firebase. Produkcijska federacija namjerno se ne aktivira lokalno ni u Vercel Preview okruženju. Za razvoj s podacima koristiti zaseban Firebase projekt i odgovarajući servisni račun.

## 3. Varijable okruženja

Predložak je u [.env.example](.env.example). Vrijednosti spremati u `.env.local` ili u **Vercel → Project → Settings → Environment Variables**. Pri promjeni Vercel varijabli izraditi novi deployment za odgovarajuće okruženje.

| Varijabla | Namjena i uvjeti |
| --- | --- |
| `ADMIN_EMAIL` | Primarni dopušteni administratorski Google račun |
| `ADMIN_EMAILS` | Dodatni dopušteni računi, odvojeni zarezima |
| `FIREBASE_PROJECT_ID` | Zamjena javno konfiguriranog Firebase projekta |
| `FIREBASE_API_KEY` | Javni web API ključ odabranog projekta |
| `FIREBASE_STORAGE_BUCKET` | Naziv Storage spremnika odabranog projekta |
| `FIREBASE_FEDERATION_ENABLED` | `true` za produkcijsku OIDC federaciju |
| `FIREBASE_WORKLOAD_IDENTITY_PROVIDER` | Puna putanja Google Workload Identity providera |
| `FIREBASE_FEDERATED_SERVICE_ACCOUNT` | Servisni račun koji federacija predstavlja |
| `FIREBASE_CLIENT_EMAIL` | Servisni račun u alternativnoj konfiguraciji privatnim ključem |
| `FIREBASE_PRIVATE_KEY` | Privatni ključ tog servisnog računa |
| `RESEND_API_KEY` | Serverski ključ Resenda |
| `MAIL_FROM` | Pošiljatelj na verificiranoj domeni |
| `INQUIRY_TO` | Privatna adresa za primitak upita |
| `INQUIRY_RATE_LIMIT_SALT` | Nasumična tajna od najmanje 32 znaka za zaštitu identifikatora ograničenja upita |
| `CRON_SECRET` | Nasumična tajna od najmanje 32 znaka za pozadinski zadatak kalendara; dodaje se zasebno jer nije u predlošku |

`VERCEL_ENV` postavlja Vercel. Ne postavljati ga lokalno radi zaobilaženja ograničenja federacije. OIDC tokene pribavlja runtime; ne upisuju se u `.env` datoteke.

Javna web konfiguracija nalazi se u `server/firebase-web.json` i izlaže se kroz `/api/config`. Pri prelasku na drugi Firebase projekt zajedno uskladiti projekt, API ključ i spremnik; pregledati i `authDomain` te proxy `/__/auth/:path*` u `vercel.json`, koji trenutačno pokazuje na postojeći projekt.

Privatni ključevi, administratorski popis, Resend ključevi i privatne kalendarske poveznice ne pripadaju repozitoriju ni direktoriju `dist`.

## 4. Firebase i administratorska prijava

### Google Authentication

1. U Firebase konzoli odabrati postojeći projekt i **Authentication → Sign-in method → Google**.
2. Provjeriti naziv aplikacije i odobreni kontakt podrške. Prijava Email/Password ostaje isključena.
3. Među dopuštene domene dodati domenu na kojoj se aplikacija koristi. Za lokalno razvojno okruženje provjeriti i dopuštenje za korišteni lokalni hostname.
4. Postaviti `ADMIN_EMAIL` i, prema potrebi, `ADMIN_EMAILS` isključivo na poslužitelju.
5. Otvoriti `/admin` i prijaviti se dopuštenim Google računom.

Firebase stvara zapis korisnika pri prvom uspješnom Google ulasku. Aplikacija ne koristi posebnu administratorsku lozinku. API zasebno provjerava potpis, trajanje i opoziv ID tokena, Google pružatelja, potvrđenu adresu e-pošte i pripadnost dopuštenom popisu. Drugi Google račun nema pristup administratorskim podacima ni ako dovrši Google identifikaciju.

`GET /api/config` vraća `firebaseConfigured`, `adminReady` i `mailReady`, bez privatnih vrijednosti. `adminReady` uključuje provjeru pristupa Firestoreu i Authentication API-ju; ne potvrđuje rad Storagea ni dostavu e-pošte.

### Produkcijski pristup bez privatnog ključa

Postojeća veza koristi pool `meleh-vercel-production`, provider `vercel` i servisni račun `vercel-meleh-server@meleh-ce687.iam.gserviceaccount.com`.

- Izdavatelj: `https://oidc.vercel.com/proservers-projects`.
- Audience: `https://vercel.com/proservers-projects`.
- Pristup je ograničen na produkcijski identitet projekta `meleh`, uz provjere identiteta tima i projekta.
- Servisni račun koristi `roles/datastore.user` za podatke i `roles/firebaseauth.viewer` za provjeru korisnika.
- `roles/iam.workloadIdentityUser` omogućuje predstavljanje računa samo dopuštenom federiranom identitetu.

U Vercel **Production** okruženju postaviti:

```dotenv
FIREBASE_FEDERATION_ENABLED=true
FIREBASE_WORKLOAD_IDENTITY_PROVIDER=projects/PROJECT_NUMBER/locations/global/workloadIdentityPools/meleh-vercel-production/providers/vercel
FIREBASE_FEDERATED_SERVICE_ACCOUNT=vercel-meleh-server@meleh-ce687.iam.gserviceaccount.com
```

`PROJECT_NUMBER` zamijeniti stvarnim brojem Google Cloud projekta. `FIREBASE_CLIENT_EMAIL` i `FIREBASE_PRIVATE_KEY` nisu potrebni kada se koristi federacija. Postojeća prava za Firestore i Authentication ne daju automatski pravo prijenosa u Storage.

### Alternativni pristup servisnim ključem

Za zasebno razvojno okruženje moguće je postaviti `FIREBASE_CLIENT_EMAIL` i `FIREBASE_PRIVATE_KEY` uz pripadajući projekt. Ključ podržava stvarne nove retke ili doslovne znakove `\n`. Čuvati ga kao tajnu i dodijeliti samo potrebna prava; ne koristiti produkcijski ključ kao razvojni primjer.

### Firestore i Storage pravila

Datoteke `firestore.rules` i `storage.rules` blokiraju izravan klijentski pristup. Operacije prolaze kroz API, koji provjerava ovlasti; serverski SDK koristi IAM prava.

Pri namjernoj izmjeni pravila prvo provjeriti projekt i pregledati razlike. Firebase CLI iz korijena repozitorija omogućuje odvojenu primjenu:

```sh
firebase deploy --only firestore:rules --project meleh-ce687
firebase deploy --only storage --project meleh-ce687
```

Storage naredbu koristiti tek kada spremnik postoji. Primjena zamjenjuje pravila ciljanog projekta, pa treba provjeriti koristi li isti projekt još neka aplikacija.

### Prijenos fotografija

Za administrativni prijenos potrebno je aktivirati spremnik, uskladiti `FIREBASE_STORAGE_BUCKET` i dodijeliti servisnom računu potrebna prava čitanja i zapisivanja objekata u tom spremniku. Ne uključivati javni izravan zapis u pravilima.

API prihvaća JPG, PNG i WebP do 2 MB, provjerava potpis datoteke i sprema je u `photos/`. Javne fotografije poslužuju se kroz `/api/photo`. Lokalna priprema optimiziranih fotografija iz mapa opisana je u [README.md](README.md#priprema-fotografija-iz-lokalnih-mapa).

## 5. Upiti i e-pošta

1. U Resendu verificirati domenu pošiljatelja i pripadajuće DNS zapise.
2. Postaviti `RESEND_API_KEY`, `MAIL_FROM`, `INQUIRY_TO` i `INQUIRY_RATE_LIMIT_SALT`.
3. Provjeriti podatke objekta, pravila, cijene i kontaktni obrazac. Serverska zaštita zahtijeva da spremljeni sadržaj ima `demo: false`; produkcijski sadržaj ne treba prikazivati oznake ogledne verzije.
4. Nakon deploymenta provjeriti `mailReady` kroz `/api/config`.
5. Kontroliranim probnim upitom provjeriti Firestore zapis te primitak poruke domaćinu i potvrde gostu.

Upit se prvo sprema u `inquiries/{uuid}`. Poruke domaćinu i gostu imaju odvojene statuse i idempotency ključeve. Neuspješnu dostavu moguće je ponoviti iz administracije; prije ponavljanja stare poruke s neizvjesnim ishodom provjeriti zapis pružatelja.

Prihvat poruke kod Resenda nije potvrda primitka u sandučić. Upit također nije automatska potvrda rezervacije. Bez aktivne dostave aplikacija ne smije prikazivati lažnu potvrdu slanja.

## 6. Kalendari i privatni vodiči

### iCal i pozadinska sinkronizacija

U administraciji dodati odgovarajuću iCal poveznicu uz svaki apartman i pokrenuti početnu sinkronizaciju. Izvoznu poveznicu aplikacije moguće je zatim povezati s vanjskim servisom. Privatne URL-ove tretirati kao pristupne podatke.

`vercel.json` već definira raspored `*/15 * * * *` za `GET /api/calendar-background`. Za aktivaciju u produkcijskom okruženju potrebno je:

1. Postaviti `CRON_SECRET` od najmanje 32 znaka i objaviti novu verziju konfiguracije.
2. Provjeriti da je Cron zadatak omogućen na Vercelu.
3. Unijeti vanjske iCal poveznice; bez njih nema kalendara za uvoz.
4. Provjeriti posljednje izvršavanje na Vercelu i status sinkronizacije u administraciji.

Endpoint zahtijeva `Authorization: Bearer <CRON_SECRET>` i odbija Vercel okruženja izvan produkcije. Pregledavanje URL-a bez tog zaglavlja treba vratiti odbijanje pristupa.

Sinkronizacija nije trenutačna ni u jednom smjeru: vanjski servisi imaju vlastiti raspored osvježavanja. Pogrešku ili zastarjelo stanje treba provjeriti u panelu. Ručna zauzeća i uvezena zauzeća koriste se zajedno; datum odlaska ostaje dostupan za sljedeći dolazak.

### Digitalni vodič za goste

Unijeti privatne upute za dolazak, parking, prijavu, Wi-Fi, pravila i kontakt na podržanim jezicima. Poveznica se izrađuje za postojeće zauzeće ili potvrđeni upit, može se opozvati i istječe nakon završetka boravka. U bazi se čuva sažetak tokena, a privatni sadržaj nije dio javne stranice ni sitemapa.

## 7. Sadržaj i podaci

Službeni naziv ostaje **Meleh Apartmani**. Katalog sadrži A-3, A-4, A-9, A-13, A-8 i A-12. Podaci iz dokumentacije domaćina preneseni su u `config/property-specification.json`; fotografije se pridružuju kroz `config/photo-folders.json`.

Daljnje uređivanje javnih podataka, cijena i prijevoda obavlja se u administraciji. Promjene SEO sadržaja spremaju se istim zaštićenim tokom. Revizije sprječavaju tiho prepisivanje tuđih izmjena; pri sukobu osvježiti panel prije ponovnog uređivanja.

| Zapis ili kolekcija | Namjena |
| --- | --- |
| `site/public` | Javni sadržaj, SEO i revizija |
| `site/calendar` | Ručna zauzeća i privatne bilješke |
| `site/calendarBackground` | Status pozadinskog zadatka |
| `site/guestGuide` | Privatne upute za goste |
| `calendarFeeds` | Privatne iCal veze i uvezena zauzeća |
| `calendarExports` | Pristupni zapisi izvoznih kalendara |
| `guestLinks` | Zapisi privatnih poveznica |
| `inquiries` | Upiti, statusi, bilješke i dostava |
| `rateLimits` | HMAC identifikatori i ograničenja učestalosti |

Za automatsko čišćenje `rateLimits` konfigurirati Firestore TTL na polju `expiresAt`. Javne rute izostavljaju osobne podatke gostiju i privatne bilješke. Izvoz sadržaja kroz administraciju nije potpuna sigurnosna kopija Firestore baze; zasebno planirati backup i rokove čuvanja poslovnih podataka.

## 8. SEO i konačna produkcijska domena

U odjeljku **SEO i tražilice** urediti naslov, metaopis, sliku za dijeljenje i indeksiranje svake stranice na hrvatskom, engleskom, njemačkom i češkom jeziku. Promjene spremljene u bazu poslužuju se u početnom HTML-u bez novog deploymenta koda.

Za prelazak s radne Vercel adrese na konačnu domenu:

1. Povezati stvarnu domenu s Vercel projektom, uskladiti DNS i provjeriti HTTPS.
2. Dodati stvarnu domenu u Firebase Authentication dopuštene domene i provjeriti Google prijavu. Ako Googleova OAuth konfiguracija zahtijeva dodatne domene ili preusmjeravanja, uskladiti ih s korištenim auth tokom.
3. U globalnim SEO postavkama unijeti konačnu HTTPS adresu kao primarnu domenu.
4. Administrator koji upravlja vlasništvom treba u Google Search Consoleu dodati **stvarnu produkcijsku domenu**. Za Domain svojstvo koristiti DNS verifikaciju; za URL-prefix svojstvo moguće je koristiti HTML metaoznaku i odgovarajuće polje u SEO panelu.
5. Prema potrebi unijeti i Bing verifikacijski kod. Sama objava koda ne dovršava verifikaciju; potvrditi je u odgovarajućem servisu.
6. Provjeriti `/sitemap.xml`, `/robots.txt`, canonical i `hreflang` poveznice na konačnoj domeni te predati sitemap tražilicama.
7. Uskladiti preusmjeravanje radne adrese na konačnu domenu i provjeriti da javne stranice namijenjene indeksiranju nisu postavljene na `noindex`.

Verifikacija `meleh.vercel.app` ne prenosi se na novu domenu. Administracija, privatni vodiči i Vercel Preview stranice ostaju isključeni iz indeksiranja.

## 9. Build i objava

```sh
npm run build
npm test
npm run test:runtime
```

Vercel instalira ovisnosti naredbom `npm ci --ignore-scripts`, pokreće build i objavljuje `dist` s funkcijom `api/index.js`. Promjene na grani `main` pokreću povezanu objavu.

Javne HTML stranice, sitemap i robots na Vercelu poslužuju se kroz serverske rute. Build zato u Vercel okruženju uklanja odgovarajuće statičke kopije kako ne bi zaobišle dinamički SEO. Sačuvati `server/page-template.html` u `includeFiles` i postojeće rewrite rute. Lokalni razvojni poslužitelj također podržava serverski prikaz; običan statički poslužitelj koristi samo zadnji rezultat builda.

Verzije serverskih ovisnosti zaključane su u `package-lock.json`. Pri nadogradnji Firebase Admina, Google Autha ili Firestore klijenta provjeriti zajedničku kompatibilnost, učitavanje modula i testove formata autorizacijskih zaglavlja federacije. Uspješan build sam po sebi ne potvrđuje rad funkcije.

## 10. Provjera nakon promjena

```sh
npm run smoke -- https://meleh.vercel.app
```

Nakon prelaska na konačnu domenu koristiti njezinu adresu. Smoke provjera je osnovna HTTP provjera i ne šalje e-poštu niti stvara korisnike ili rezervacije.

Dodatno provjeriti:

- dopušteni Google račun može pristupiti administraciji, a nedopušteni račun nema pristup zaštićenim API rutama;
- spremanje sadržaja i SEO promjena ostaje vidljivo nakon ponovnog učitavanja;
- istodobne izmjene ne prepisuju noviju reviziju bez upozorenja;
- cijene preko više sezona, kapaciteti i minimalni boravak odgovaraju unosu;
- preklapajuća zauzeća odbijaju se, a novi dolazak na dan odlaska dopušten je;
- kalendari prikazuju posljednju uspješnu sinkronizaciju;
- prijenos fotografija i dostava upita rade ako su njihove integracije aktivne;
- privatne bilješke, upiti i Wi-Fi upute nisu dostupni kroz javni sadržaj;
- sve četiri jezične verzije te mobilni, tabletni i računalni prikaz rade s povećanim fontom;
- konačna domena ima ispravne metapodatke, sitemap i potvrđeno vlasništvo u tražilicama.

Pri dijagnostici zapisivati kod i vrijeme pogreške te naziv rute. U javne issueove, logove i dokumentaciju ne kopirati tokene, privatne ključeve, sadržaj upita ili privatne kalendarske poveznice.
