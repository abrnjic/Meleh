# Naknadno povezivanje servisa

Javna web konfiguracija projekta `meleh-ce687` spremljena je u `server/firebase-web.json` i dostupna klijentu preko `/api/config`. Serverski pristup, prijava i slanje e-pošte čekaju aktivaciju servisa i privatne varijable. Kontaktni podaci ostaju za kasnije.

## Firebase

Status postavljanja (19. listopada 2026.): Google prijava je aktivirana, a Email/Password isključen. Firestore `(default)` postoji u `europe-west3` (Frankfurt), u Production načinu s blokiranim izravnim pristupom. Na Vercelu su postavljeni privatni `ADMIN_EMAIL` i identifikator servisnog računa `FIREBASE_CLIENT_EMAIL`; privatni ključ još čeka korisnikov unos. Firebase Storage još nije aktiviran jer konzola traži nadogradnju plana.

1. U projektu `meleh-ce687` uključite Authentication, Firestore u Native načinu i Storage.
2. U Authentication koristite Google pružatelja; prijava lozinkom je isključena. Za produkciju dopustite samo domenu `meleh.vercel.app` (domena je dodana u konzoli). Google zahtijeva javni naziv aplikacije i odobreni kontakt podrške. Administratorski Google račun ne treba unaprijed izrađivati niti mu postavljati posebnu lozinku: Firebase ga stvara pri prvom uspješnom Google ulasku. Server dopušta pristup samo ako je token iz Google prijave (`firebase.sign_in_provider === 'google.com'`), email potvrđen i jednak privatnom `ADMIN_EMAIL`. Ostali Google računi mogu dovršiti identifikaciju kod pružatelja, ali dobivaju zabranu pristupa svim administratorskim API rutama.
3. Postavite privatne Vercel varijable za odabrano okruženje: `ADMIN_EMAIL`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`. Projekt, Storage bucket i web API ključ već imaju javne zadane vrijednosti; `FIREBASE_PROJECT_ID`, `FIREBASE_STORAGE_BUCKET` i `FIREBASE_API_KEY` služe kao neobavezne zamjene. Pri promjeni projekta postavite sve tri zamjene zajedno.
4. Privatni ključ i serverski email servisnog računa držite u privatnim Vercel varijablama. `FIREBASE_PRIVATE_KEY` može sadržavati stvarne nove retke ili doslovni `\n`; server oba oblika podržava. Ne objavljivati ih u repozitoriju ili mapi `dist`.
5. Nakon provjere ciljanog projekta primijenite priložena `firestore.rules` i `storage.rules` pravila, primjerice Firebase CLI naredbom `firebase deploy --only firestore:rules,storage --project meleh-ce687`. Ne primjenjivati ih na projekt s drugim aplikacijama bez pregleda postojećih pravila jer zamjenjuju izravni klijentski pristup.
6. Prijavite se kroz `/admin/`. Prvi unos sadržaja stvara dokument `site/public`; prvo zauzeće stvara `site/calendar`. Dok kalendar nema potvrđen zapis, javna stranica ga označava nepotvrđenim.

Serverski SDK provjerava Firebase ID token s provjerom opoziva, Google pružatelja, `email_verified` i podudaranjem privatnog administratorskog emaila. Firebase Admin SDK koristi povlašteni pristup; zato se klijentu ne daju servisni ključevi i svaki zaštićeni API zahtjev zasebno provjerava.

## E-pošta

1. Povežite Resend račun i potvrdite domenu pošiljatelja. Nema troška ni slanja iz ove aplikacije dok se servis ne konfigurira.
2. Postavite `RESEND_API_KEY`, `MAIL_FROM`, privatni primatelj `INQUIRY_TO` i nasumični `INQUIRY_RATE_LIMIT_SALT` od najmanje 32 znaka.
3. Domaćin u panelu mora dovršiti stvarne podatke i isključiti oznaku ogledne verzije. Samo postavljanje ključa ne aktivira slanje dok je sadržaj ogledan.
4. Napravite novi Vercel deployment nakon promjene varijabli. Provjerite da `/api/config` vraća spremne servise, bez izlaganja privatnih vrijednosti.
5. Pošaljite jedan izričito odobren probni upit na vlastite testne adrese, provjerite Firestore zapis, e-poštu domaćinu i potvrdu gostu. Provjera primitka u sandučiću razlikuje se od prihvata poruke kod pružatelja dostave.

Upit se prvo trajno sprema u `inquiries/{uuid}`. E-pošta domaćinu i gostu imaju zasebne statuse i Resend idempotency ključeve. Kada jedan korak ne uspije, panel prikazuje status i omogućuje ponavljanje neuspješne dostave. Idempotency zaštita pružatelja ima vremenski prozor; pri ponavljanju starih neizvjesnih poruka prvo provjerite zapis pružatelja. Aplikacija ne tvrdi da je poruka pročitana ili dostavljena u sandučić samo zato što ju je API prihvatio.

## Podaci i zaštita

- `site/public`: javni sadržaj i revizija za sprečavanje prepisivanja novijih promjena.
- `site/calendar`: zauzeti intervali i privatne bilješke; javni API izostavlja bilješke.
- `inquiries`: osobni podaci upita; čita ih isključivo ovlašteni administratorski API.
- `rateLimits`: HMAC identifikatori, broj zahtjeva i `expiresAt`; postavite Firestore TTL na polje `expiresAt` za automatsko čišćenje. Sirove IP adrese ne spremamo.
- Storage `photos/`: samo provjerene fotografije; API poslužuje samo dopuštene nazive slika.

Javni obrazac ima provjeru datuma, kapaciteta, privole i zauzeća, skriveno polje protiv osnovnih botova, minimalno vrijeme ispunjavanja te trajno ograničenje broja zahtjeva po adresi i IP identifikatoru. Za napad velikog razmjera treba dodatno podesiti Vercel Firewall ili odgovarajuću zaštitu od botova.

Lokalni ogledni panel nema pristup ovim podacima niti ovlasti za serversko spremanje. Njegove se promjene čuvaju samo u korisnikovu pregledniku.

## Provjere nakon aktivacije

- Potvrđen administratorski račun može pristupiti; drugi i nepotvrđeni računi dobivaju odbijanje.
- Dva istodobna urednika ne prepisuju tiho noviju reviziju.
- Preklapajuća zauzeća odbijaju se, a odlazak i novi dolazak istog dana dopušteni su.
- Privatne bilješke i upiti nisu u javnom sadržaju, kalendaru niti statičkim datotekama.
- Prijenos fotografije, javni prikaz, cjenik i računanje preko više sezona rade na stvarnom projektu.
- Upit ne stvara automatski rezervaciju; konačan dogovor potvrđuje domaćin.
- Pravila privatnosti, rokove čuvanja i uvjete rezervacije treba uskladiti sa stvarnim poslovanjem vlasnika prije primanja stvarnih upita.

## Izvori za integraciju

- [Firebase Admin setup](https://firebase.google.com/docs/admin/setup)
- [Verify Firebase ID tokens](https://firebase.google.com/docs/auth/admin/verify-id-tokens)
- [Firebase Auth REST API](https://firebase.google.com/docs/reference/rest/auth)
- [Firestore transactions](https://firebase.google.com/docs/firestore/manage-data/transactions)
- [Resend send-email API](https://resend.com/docs/api-reference/emails/send-email)
- [Vercel Node.js Functions](https://vercel.com/docs/functions/runtimes/node-js)

## Kompatibilnost runtimea

Firebase Admin SDK vezan je na verziju 13.10.0. Firebase Admin 14.x uvodi `jwks-rsa` 4 i ESM-only `jose` 6, što je na ovom Vercel runtimeu uzrokovalo `ERR_REQUIRE_ESM` pri pokretanju, iako je build prolazio. Kompatibilna 13.x grana izbjegava taj loader problem bez promjene provjere potpisa tokena.

Prije nadogradnje pokrenite `npm run test:runtime`, a nakon deploya `npm run smoke -- https://meleh.vercel.app`. Prvi testira učitavanje bez eksperimentalnog CommonJS → ESM require interopa, a drugi stvarnu mrežnu rutu i odgovor funkcije. Uspješan build sam po sebi ne potvrđuje ispravnost runtimea.
