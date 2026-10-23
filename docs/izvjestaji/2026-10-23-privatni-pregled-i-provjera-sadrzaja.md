# CMS — privatni pregled nacrta i provjera sadržaja

Datum: 23. listopada 2026.

Ovaj izvještaj obuhvaća nove funkcije dodane u ovom krugu rada. Nadovezuju se na postojeće automatsko spremanje nacrta, koš i pregled razlika prije objave.

## Što je dodano

### 1. Pregled nacrta kao stvarne web stranice

U administraciji je dostupan gumb **Pregledaj nacrt**. Otvara privatni prikaz koji koristi iste komponente, fotografije, identitet i stilove kao javna stranica.

Administrator može izabrati:

- mobitel širine 390 px, tablet 768 px ili računalo 1440 px;
- hrvatski, engleski, njemački ili češki jezik;
- veličinu fonta 100 %, 115 %, 130 % ili 150 %;
- naslovnicu, popis apartmana, pojedini objavljeni apartman, O nama, galeriju, vodič, dolazak, česta pitanja ili kontakt.

Širina prikaza ostaje stvarna. Na manjem zaslonu širi se prikaz može pomicati vodoravno. Zatvaranje pregleda vraća administratora u uređivanje.

Pregled se može otvoriti i iz dijaloga pregleda promjena prije objave. Tako administrator može provjeriti izgled bez napuštanja postupka pripreme objave.

### 2. Provjera sadržaja prije objave

Dodani su gumb **Provjeri sadržaj** i odjeljak **Provjera sadržaja** u administratorskom izborniku.

Provjera prikazuje odvojeno:

- **Pogreške**, koje treba ispraviti prije objave: primjerice nedostajući naziv objekta, nepostojeća naslovna fotografija apartmana, nepotpuni datumi ili preklapanje sezona te ostali neispravni podaci koje provjerava postojeća validacija.
- **Upozorenja**, koja ne sprječavaju objavu: nedostajući kontakt ili adresa, opisi apartmana i sadržaji vodiča/čestih pitanja koji nisu ispunjeni na svim jezicima, apartman bez cjenika, praznine između sezona, fotografija bez hrvatskog opisa i nepotpuni zadani SEO opisi.

Praznina između sezona može biti namjerna, primjerice izvan sezone. Zato se prikazuje kao upozorenje, a ne pogreška. Skrivenim apartmanima ne traži se potpunost javnih opisa i cjenika; njihovi neispravni podaci i dalje prolaze obveznu validaciju.

Gumb **Uredi** otvara odgovarajući odjeljak i, za nalaze vezane uz određeno polje, fokusira to polje. Kod apartmana otvara se odgovarajući apartman, a kod fotografije njezina grupa. Zatvoreni odjeljci potrebni za uređivanje automatski se otvaraju.

### 3. Povezivanje provjera s objavom

Prije objave automatski se provjerava sadržaj. Pogreške vraćaju administratora na dijagnostiku. Upozorenja se prikazuju u pregledu promjena, uz mogućnost pregleda svih upozorenja ili otvaranja vizualnog pregleda nacrta.

Postojeća konačna potvrda objave ostaje obvezna. Samo otvaranje pregleda ili provjere ne objavljuje sadržaj.

### 4. Privatnost i ponašanje pregleda

- Nacrt se prenosi između administracije i ugrađenog pregleda samo u memoriji preglednika.
- Provjeravaju se podrijetlo poruke, prozor pošiljatelja i jedinstvena oznaka sesije pregleda.
- URL ne sadrži tekst nacrta, pristupne podatke ni podatke gostiju. Kopirani URL sam po sebi ne daje drugoj osobi pristup nacrtu.
- Za prikaz se koriste validirani podaci stranice; upiti gostiju, privatne bilješke i prijavni tokeni nisu dio prijenosa.
- Pregled ne učitava javni sadržaj preko nacrta i ne pokreće administratorsku prijavu.
- Slanje kontaktne forme je isključeno; vanjske poveznice i prelazak na privatne stranice blokirani su unutar pregleda.
- Adrese s oznakom CMS pregleda dobivaju `noindex, nofollow` i u početnom serverskom HTML-u.
- Odabir veličine fonta u pregledu ne mijenja spremljenu korisničku postavku veličine fonta javne stranice.

### 5. Popravak prikaza zaglavlja

Popravljeno je ponašanje duljeg naziva objekta pri povećanom fontu: naziv se može prelomiti, zaglavlje se prilagođava visinom, a navigacijske kontrole ostaju vidljive.

## Kako koristiti

1. Prijavite se u administraciju i uredite nacrt.
2. Kliknite **Provjeri sadržaj** i pregledajte nalaze.
3. Gumbom **Uredi** ispravite pogreške ili dopunite sadržaj.
4. Kliknite **Pregledaj nacrt** i provjerite potrebne stranice, jezike i uređaje.
5. Pokrenite objavu, pregledajte razlike i upozorenja te potvrdite objavu.

## Provjere

- Svih **168 automatiziranih testova** prolazi.
- Izgradnja projekta prolazi.
- U izoliranom Chrome pregledniku provjereni su identitet iz nacrta, sve tri širine, povećani font, promjena stranice i jezika, odbijanje pogrešne oznake poruke i blokiranje slanja upita.
- Provjereno je da pregled i dijagnostika ne mijenjaju javnu objavu.
- Provjereni su zaustavljanje objave zbog nepotpune sezone, fokus odgovarajućeg datuma te otvaranje pregleda i upozorenja iz dijaloga objave.
- Testiranje administratorskog toka koristi izolirani API i bazu u memoriji, bez izmjena produkcijskih rezervacija ili sadržaja gostiju.

## Granice ovog kruga

U ovom su krugu izvedene dvije prethodno preporučene prioritetne nadogradnje: stvarni pregled nacrta i provjere prije objave. Jedinstveni kalendar svih apartmana, ponude iz upita, dodatne funkcije biblioteke fotografija i prošireno upravljanje poviješću ostaju zasebne sljedeće nadogradnje. Postojeće funkcije tih odjeljaka ostaju dostupne.

## Naknadni popravak prijenosa fotografija

U produkcijskim zapisima potvrđena su tri neuspjela POST zahtjeva prema administrativnom API-ju, sa serverskom greškom 500 i izvornim kodom 404. Izravan upit Google Storage API-ju vraća `The specified bucket does not exist.` za `meleh-ce687.firebasestorage.app` i raniji zadani naziv `meleh-ce687.appspot.com`.

Dodano je:

- prikaz tijeka prijenosa uz album u koji se dodaju fotografije;
- jasna poruka kada Storage spremnik ne postoji ili servisni račun nema pristup;
- zadržavanje uspješno prenesenih fotografija kada druga datoteka u istom odabiru ne uspije;
- mogućnost ponovnog odabira iste datoteke nakon pogreške;
- provjera ograničenja broja fotografija i potvrde URL-a poslužitelja prije dodavanja stavke galerije;
- automatsko spremanje dodanih fotografija u privatni nacrt, uz postojeću odvojenu potvrdu javne objave.

Svih 173 automatiziranih testova prolazi. U izoliranom Chrome pregledniku dodatno je provjeren stvarni PNG koji se prilagođava u JPEG, prikaz Storage greške, ponovni pokušaj iste datoteke, dodavanje sličice i spremanje nacrta bez promjene javnog sadržaja.

### Preostala vanjska postavka

Prijenos na produkciju još zahtijeva aktivan Storage spremnik u postojećem Firebase projektu. Kod spremnika koji se razlikuje od zadanog treba uskladiti `FIREBASE_STORAGE_BUCKET`. Servisni račun `vercel-meleh-server@meleh-ce687.iam.gserviceaccount.com` treba pravo čitanja i stvaranja objekata u tom spremniku, primjerice ulogu `roles/storage.objectUser` ograničenu na taj spremnik.

Aktivacija Storagea ili naplate nije provedena. Za Firebase Storage potreban je Blaze plan: https://firebase.google.com/docs/storage/web/start . Prava spremnika opisana su na https://docs.cloud.google.com/storage/docs/access-control/iam-roles . Izravni javni zapis ostaje zabranjen; prijenos ide kroz zaštićeni administratorski API.
