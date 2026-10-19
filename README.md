# Meleh Apartmani

Glavni repozitorij: https://github.com/abrnjic/Meleh. Hosting: **Vercel**, [produkcijska stranica](https://meleh.vercel.app). Baza podataka, prijava i fotografije: **Firebase**. Slanje e-pošte: **Resend**, nakon naknadnog povezivanja i potvrde pošiljatelja.

## Pokretanje i provjera

Potrebni su Node.js 24 i npm.

```sh
npm ci --ignore-scripts
npm run build
npm run dev
npm test
npm run test:runtime
npm run smoke -- https://meleh.vercel.app
```

Lokalni frontend i API: `http://127.0.0.1:4174`. Varijabla `PORT` može promijeniti port. Dev skripta čita `.env.local`; nikada je ne dodavati u Git.

`npm run build` provjerava zadani sadržaj, izrađuje ulazne HTML stranice i serversku kopiju zadanog sadržaja. Vercel koristi `vercel.json`, instalira ovisnosti, pokreće build i poslužuje `dist` zajedno s API-jem. Nove apartmane iz administracije podržava rewrite `/apartmani/:slug`. Završne kose crte uklanjaju se kako API funkcije ne bi bile preusmjerene na nepostojeću putanju s kosom crtom.

## Što je dostupno

- Responzivna stranica s HR/EN/DE prijevodima, isključivo svijetlom temom te galerijom.
- `/vodic/`: filtrirani vodič kroz Crikvenicu s poveznicama na službene turističke izvore i karte.
- `/faq/`: česta pitanja; nepotvrđeni uvjeti objekta ne predstavljaju se kao stvarni podaci.
- `/dostupnost/` i stranice apartmana: kalendar zauzetosti, odabir mjeseca i datuma, sezonski cjenik i izračun cijene.
- `/admin/`: Google prijava ovlaštenog administratora putem Firebasea te odvojeni, jasno označeni lokalni ogledni panel.
- Panel uređuje podatke objekta, priču domaćina, apartmane i opise na tri jezika, cijene po sezonama, naslovne fotografije, galeriju, zauzeća, vodič i FAQ. Podržava izvoz i uvoz kopije sadržaja.
- Mobilna traka prikazuje upit i kalendar dok nema kontakata; stvarni telefon i WhatsApp pojavljuju se nakon unosa brojeva.
- Serverski tok upita: validacija → provjera termina i ograničenje učestalosti → Firestore zapis → zasebna e-poruka domaćinu i potvrda gostu. Neuspješna dostava vidi se u panelu i može se ponoviti.

## Ogledni panel bez servisa

Na `/admin/` odaberite **Otvori ogledni panel**. To ne daje pristup javnoj administraciji. Promjene se spremaju samo u lokalnu pohranu ovog preglednika, pod ključem `meleh-editor-preview-v1`, i utječu samo na lokalni pregled. Nakon osvježavanja ponovno otvorite ogledni panel kako biste učitali spremljeni pregled. Gumb za vraćanje početnog sadržaja uklanja ovu kopiju. Izvoz kopije ne uključuje osobne podatke upita.

Javna Firebase konfiguracija projekta `meleh-ce687` ugrađena je u aplikaciju. Serverski Firebase pristup koristi produkcijsku Vercel OIDC federaciju, bez servisnog privatnog ključa. Google prijava omogućuje se kada `/api/config` potvrdi stvarni pristup bazi i provjeri korisnika. Slanje e-pošte i Storage čekaju naknadnu aktivaciju; upit se može pripremiti/kopirati/preuzeti, a kalendar bez unesenih podataka navodi da dostupnost nije potvrđena. Ne prikazujemo lažnu potvrdu slanja ni sigurno slobodne termine.

## Povezivanje Firebasea i e-pošte

Detaljni koraci su u [SETUP.md](SETUP.md). `.env.example` sadrži samo nazive varijabli, bez stvarnih vrijednosti. Administratorski email lokalno je predviđen u privatnoj varijabli `ADMIN_EMAIL`; nije javni kontakt `SITE.email` niti se objavljuje u frontend.

Za administratorski pristup API provjerava potpis, opoziv i trajanje Firebase ID tokena, Google pružatelja prijave, potvrđen email i točno podudaranje s privatnim `ADMIN_EMAIL`. Firebase web SDK koristi isključivo memorijsku pohranu; obnavlja ID token i briše sesiju pri odjavi. Osvježavanje stranice zahtijeva novu prijavu. Firestore i Storage pravila onemogućuju izravni klijentski pristup; podaci prolaze kroz zaštićeni API. Nemojte koristiti e-mail podudaranje samo u klijentu kao zaštitu.

## Stvarni sadržaj kasnije

Početne podatke možete urediti u `dist/content.js`, a nakon povezivanja u administratorskom panelu. Nazivi apartmana, površine, kapaciteti i interijeri i dalje su ogledni. Adresa, kontakt, točne udaljenosti i pravila čekaju unos. Cijene nisu izmišljene: bez unesenih sezona prikazuje se „cijena na upit”.

Gostu se objavljuju samo datumi zauzetosti, bez privatnih bilježaka. Intervali su od dolaska do odlaska, uz slobodan dan odlaska za promjenu gostiju. Preklapajuća zauzeća i sezone odbijaju se. Brisanje ili promjena oznake apartmana s postojećim zauzećima odbija se dok se termini ne urede.

Prije pravog primanja upita dovršite podatke vlasnika, privatnost, uvjete rezervacije, kontakt i potvrđene cijene. U panelu isključite oznaku ogledne verzije tek kad sadržaj bude spreman. Serversko slanje upita dodatno je blokirano dok je `demo` uključen.

## Fotografije

Prizori destinacije prikazuju Crikvenicu. Autori, izvori, licence i prilagodbe navedeni su na javnoj stranici `/fotografije/` i u `SITE.photoCredits`.

- `crikvenica-plaza.jpg`: Elekes Andor, Beach - Crikvenica (8), CC BY-SA 4.0.
- `crikvenica-obala.jpg`: Zoran Kurelić Rabko, Crikvenica, beach - panoramio, CC BY-SA 3.0.
- `crikvenica-more.jpg`: Elekes Andor, Beach - Crikvenica (9), CC BY-SA 4.0.

Fotografije su smanjene i u pojedinim prikazima koriste CSS izrez i zatamnjenje; prilagođeni prikazi dostupni su pod istom licencom. Fotografije interijera s Unsplasha su ilustrativne i ne prikazuju apartmane Meleh. Nove fotografije prolaze provjeru formata, prilagodbu veličine i, u javnom načinu, autentikaciju prije spremanja u Firebase Storage.

## Struktura

- `dist/app.js`, `dist/style.css`: javna stranica, postojeći sadržaj i stilovi.
- `dist/features.js`: vodič, FAQ, kalendar, cijene, mobilni kontakti i panel.
- `dist/model.js`: zajednička validacija i izračuni u pregledniku i na serveru.
- `dist/theme.js`: prelazak ranije spremljenih postavki na isključivo svijetli izgled.
- `api/index.js`: zajednički Vercel Functions API ulaz.
- `server/firebase.js`, `server/mail.js`: administratorska provjera, pohrana i dostava e-pošte.
- `server/default-site.json`: zadani sadržaj generiran buildom.
- `tests/`: datumi, cijene, kapacitet, neispravan sadržaj, zaštita API-ja i djelomične greške e-pošte.

## Provjera i ograničenja

Automatizirani testovi pokrivaju datume i promjene gostiju, preklapanja, cijene preko sezona, kapacitete, opasan sadržaj i URL-ove, neprijavljeni pristup, privole te neuspješnu i ponovljenu dostavu poruka. U pregledniku je provjeren tok oglednog uređivanja → spremanje cjenika i zauzeća → prikaz gostu i izračun cijene.

Google prijava i Firestore koriste produkcijsku federaciju; prvi ulazak stvarnog administratora dovršava se njegovim Google računom. Storage i stvarna dostava e-pošte zahtijevaju naknadnu aktivaciju i provjeru. Test dostave koristi kontrolirani zamjenski HTTP odgovor i ne šalje stvarne poruke.
