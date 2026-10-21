# Meleh Apartmani

Višejezična web-stranica za predstavljanje i upravljanje smještajem **Meleh Apartmani** u Luci Dubravi na poluotoku Pelješcu. Projekt povezuje pregled šest apartmana, izračun cijene boravka, dostupnost i upite gostiju s administracijom sadržaja, rezervacija i SEO postavki.

[Radna web-stranica](https://meleh.vercel.app) · [Administracija](https://meleh.vercel.app/admin) · [Tehnička konfiguracija](SETUP.md)

> Domena `meleh.vercel.app` trenutačna je radna adresa. Prije konačnog lansiranja potrebno je povezati stvarnu produkcijsku domenu te uskladiti SEO, Google prijavu i verifikaciju vlasništva.

## Funkcionalnosti

### Za goste

- Hrvatski, engleski, njemački i češki jezik.
- Responzivan prikaz za mobitele, tablete i računala, uz prilagodbu veličine teksta.
- Katalog apartmana **A-3, A-4, A-9, A-13, A-8 i A-12**, s opisima, opremom, pravilima i fotografijama.
- Pretraživanje prema datumima, broju gostiju i željenim sadržajima te usporedba apartmana.
- Sezonski cjenici, izračun cijene boravka, kalendar zauzetosti i prijedlozi alternativnih termina.
- Kontaktni obrazac i WhatsApp upit s pripremljenim podacima o boravku.
- Galerija organizirana u albume apartmana, kuće i okućnice te lokacije i plaža.
- Vodič kroz Pelješac, plan dana i česta pitanja.
- Privatni digitalni vodič za potvrđene boravke, dostupan putem vremenski ograničene poveznice.

### Za administratore

- Google prijava uz provjeru ovlaštenih računa na poslužitelju.
- Uređivanje podataka objekta i apartmana, prijevoda, cijena, fotografija, sadržaja vodiča i čestih pitanja.
- Upravljanje zauzećima i iCal kalendarima, uz prikaz posljednje sinkronizacije.
- Pregled upita sa statusima **Novi**, **Ponuda poslana**, **Potvrđeno** i **Otkazano**, privatnim bilješkama i predlošcima ponude.
- Upravljanje privatnim vodičima za goste te izvoz i uvoz kopije sadržaja.
- Uređivanje SEO podataka po stranici i jeziku, s pregledom izgleda rezultata pretraživanja.

## Tehnologije

| Sloj | Tehnologija |
| --- | --- |
| Korisničko sučelje | HTML, CSS i JavaScript ES moduli |
| Poslužiteljski dio | Node.js 24 i Vercel Functions |
| Prijava | Firebase Authentication — Google |
| Baza podataka | Cloud Firestore |
| Pohrana prenesenih fotografija | Firebase Storage, uz zasebnu konfiguraciju |
| E-pošta | Resend, uz aktivaciju i verifikaciju pošiljatelja |
| Hosting i raspored sinkronizacije | Vercel i Vercel Cron |
| Provjere | Ugrađeni Node.js test runner i HTTP smoke provjere |

## Lokalno pokretanje

Potrebni su **Node.js 24** i npm.

```sh
git clone https://github.com/abrnjic/Meleh.git
cd Meleh
npm ci --ignore-scripts
cp .env.example .env.local
npm run build
npm run dev
```

Aplikacija i lokalni API dostupni su na `http://127.0.0.1:4174`. Port se može promijeniti varijablom `PORT`. Razvojni poslužitelj učitava konfiguraciju iz `.env.local`.

Javni sadržaj može se pregledavati lokalno; Google prijava, spremanje u bazu, prijenos fotografija i dostava e-pošte ovise o konfiguraciji odgovarajućih servisa.

### Dostupne naredbe

| Naredba | Namjena |
| --- | --- |
| `npm run dev` | Lokalni razvojni poslužitelj s API-jem |
| `npm run build` | Validacija sadržaja i priprema datoteka za objavu |
| `npm test` | Automatizirani testovi |
| `npm run test:runtime` | Testovi uz dodatnu provjeru kompatibilnosti modula |
| `npm run smoke -- https://meleh.vercel.app` | Osnovna HTTP provjera objavljene aplikacije |

Smoke provjera ne stvara rezervacije ni korisničke račune i ne šalje e-poruke.

## Konfiguracija servisa

Predložak varijabli nalazi se u [.env.example](.env.example), a detaljne upute u [SETUP.md](SETUP.md). Tajne vrijednosti postavljaju se lokalno u `.env.local`, odnosno u postavkama okruženja na Vercelu.

| Skupina | Konfiguracija |
| --- | --- |
| Administratori | `ADMIN_EMAIL` i `ADMIN_EMAILS` određuju dopuštene Google račune |
| Firebase | Projekt, spremnik i serverske vjerodajnice ili federacija identiteta |
| E-pošta | `RESEND_API_KEY`, `MAIL_FROM`, `INQUIRY_TO` i postavke ograničenja učestalosti upita |
| Pozadinska sinkronizacija | `CRON_SECRET` štiti zakazani poziv sinkronizacije |

Postojeća Vercel konfiguracija za serverski pristup Firebaseu koristi **OIDC i Google Workload Identity Federation**, bez dugotrajnog privatnog ključa servisnog računa. Podržana je i alternativna konfiguracija servisnim računom.

Dostava upita e-poštom zahtijeva aktivan Resend i verificiranog pošiljatelja. Prijenos novih fotografija kroz administraciju zahtijeva konfiguriran Storage. Sam unos varijabli nije zamjena za provjeru rada servisa.

**Ne dodavati `.env.local`, privatne ključeve, pristupne tokene ili privatne iCal poveznice u Git.** Javna Firebase konfiguracija služi inicijalizaciji web SDK-a; ovlasti za podatke provjerava poslužiteljski API.

## Sadržaj i fotografije

Podaci o objektu, opremi i sezonskim cijenama temelje se na dokumentaciji domaćina. Službeni naziv projekta i objekta ostaje **Meleh Apartmani**. Normalizirana specifikacija nalazi se u [config/property-specification.json](config/property-specification.json).

Administracija služi za daljnje uređivanje objavljenog sadržaja. Spremanje koristi revizije i transakcije, a migracije početnih podataka čuvaju naknadne administratorske izmjene.

### Priprema fotografija iz lokalnih mapa

Izvorne fotografije nalaze se izvan repozitorija, u susjednoj mapi `../Fotke`. Pridruživanje apartmanima i kolekcijama određuje [config/photo-folders.json](config/photo-folders.json); neoznačene mape ne pridružuju se automatski.

Za obradu je potreban Python 3 s bibliotekom Pillow:

```sh
python3 scripts/prepare-photos.py
npm run build
```

Skripta čuva originale i izrađuje optimizirane WebP datoteke do 1600 px, bez EXIF metapodataka. Nakon pripreme potrebno je uključiti izmijenjene datoteke iz `dist/assets`, biblioteku `dist/photo-library-data.js` i povezane rezultate builda u objavu.

Fotografije apartmana, kuće, okućnice i plaže dostavio je domaćin. Izvori i licence dodatnih fotografija šire destinacije navedeni su u uvjetima korištenja na stranici `/uvjeti`.

## Dostupnost i sinkronizacija kalendara

Zauzeće se računa od datuma dolaska do datuma odlaska; dan odlaska dostupan je za sljedeći dolazak. Model provjerava preklapanja, kapacitet i pravila minimalnog boravka. Za razdoblja bez unesenog cjenika aplikacija ne pretpostavlja cijenu.

Podržani su iCal uvoz i izvoz te automatska pozadinska sinkronizacija svakih **15 minuta**, prema rasporedu u `vercel.json`. Za stvarno povezivanje vanjskih kalendara potrebno je unijeti njihove iCal poveznice u administraciji. Ažuriranja nisu trenutačna; prikazuje se vrijeme posljednje sinkronizacije.

## SEO i produkcijska domena

Administratorski odjeljak **SEO i tražilice** omogućuje uređivanje naslova, metaopisa, slike za dijeljenje i postavke indeksiranja za svaki podržani jezik. Globalne postavke uključuju primarnu domenu, zadane vrijednosti i kodove za verifikaciju Googlea i Binga.

Poslužitelj isporučuje aktualne metapodatke u početnom HTML-u. Promjene spremljene kroz administraciju primjenjuju se bez nove objave koda. Implementirani su:

- kanonske poveznice i jezične alternative `hreflang`;
- Open Graph i Twitter metapodaci;
- strukturirani podaci JSON-LD za objekt, stranice, apartmane i česta pitanja;
- dinamički `sitemap.xml` i `robots.txt`;
- isključivanje administracije i privatnih vodiča iz indeksiranja.

Pri prelasku na konačnu domenu potrebno je:

1. Povezati domenu s Vercel projektom i provjeriti HTTPS.
2. Dodati domenu među dopuštene domene Firebase Google prijave.
3. U SEO postavkama unijeti stvarnu produkcijsku HTTPS adresu.
4. Verificirati vlasništvo te domene u Google Search Consoleu i, prema potrebi, Bing Webmaster Toolsu.
5. Poslati sitemap s konačne domene i provjeriti preusmjeravanja i kanonske poveznice.

Verifikacija radne Vercel adrese ne zamjenjuje verifikaciju buduće produkcijske domene.

## Sigurnost i privatnost

API provjerava valjanost i opoziv Firebase ID tokena, Google pružatelja prijave, potvrđenu adresu e-pošte i pripadnost administratorskom popisu. Provjera u korisničkom sučelju nije jedina zaštita.

Firestore i Storage pravila ograničavaju izravan klijentski pristup. Administratorski podaci prolaze kroz zaštićeni API. Javna dostupnost ne otkriva osobne podatke gostiju ni privatne bilješke. Privatni vodiči koriste poveznice koje se mogu opozvati i kojima se može ograničiti trajanje.

## Struktura repozitorija

```text
api/                  Ulazna točka Vercel API-ja
config/               Specifikacija objekta i mapiranje fotografija
dist/                 Frontend, stilovi, sadržaj i optimizirani mediji
scripts/              Razvoj, build, priprema fotografija i smoke provjere
server/               Firebase, upiti, kalendari i serverski SEO
tests/                Automatizirani testovi i izdvojeni testni podaci
.env.example          Predložak konfiguracije
SETUP.md              Upute za povezivanje servisa
vercel.json           Objavljivanje, usmjeravanje i Cron raspored
```

## Provjera i objavljivanje

Prije objave promjena aplikacije pokrenuti:

```sh
npm run build
npm test
npm run test:runtime
```

Testovi pokrivaju cijene, datume, kapacitete, autorizaciju, spremanje sadržaja, iCal obradu, privatne vodiče i SEO. Nakon objave provjeriti javne stranice, prijavu i relevantne administratorske radnje u konfiguriranom okruženju.

Povezani Vercel projekt automatski objavljuje promjene s grane `main`. Postavke okruženja i vanjskih servisa održavaju se zasebno od izvornog koda.
