# Odvojeni CMS prostor u postojećem Firebase projektu

Projekt ostaje `meleh-ce687`. Razvoj nove CMS aplikacije koristi kolekcije pod dokumentom `cmsDevelopment/next`, primjerice `cmsDevelopment/next/site/public` i `cmsDevelopment/next/properties/{id}`.

API zahtjev odabire taj prostor isključivo vrijednošću `workspace=cms-next-dev`. Proizvoljni nazivi prostora odbijaju se. Postojeći zahtjevi bez te oznake nastavljaju koristiti postojeće produkcijske podatke.

## Izolacija podataka

- Pri prvom ovlaštenom administratorskom zahtjevu kopira se samo javni katalog Meleha u razvojni prostor, s vlastitom početnom revizijom.
- Produkcijske rezervacije, upiti, privatne bilješke i vodiči ne kopiraju se.
- Skice, novi objekti, njihove objave, URL oznake i povijest ostaju unutar razvojnog prostora.
- Slanje e-pošte i zakazani zadatak kalendara isključeni su za razvojni prostor.
- Google prijava i serverska provjera dopuštenih administratora ostaju iste. Klijentu se ne daju servisne vjerodajnice.
- Prijenos slika koristi postojeći Storage API i nove UUID nazive datoteka; ne zamjenjuje postojeće fotografije. Za prijenos je potreban aktivan Storage.

Razvojni prostor dijeli projekt, IAM servisni račun, potrošnju i kvote s produkcijom. Izolacija je provedena API usmjeravanjem, a ne zasebnim Firebase projektom. Firestore i Storage klijentska pravila i dalje zabranjuju izravan pristup.

## Sigurno povezivanje Next.js aplikacije

Lokalna Next.js aplikacija može koristiti postojeći objavljeni API bez lokalnog privatnog ključa. U njezinom privatnom `.env.local` postaviti:

```dotenv
CMS_ENABLE_FIREBASE=true
CMS_API_ORIGIN=https://meleh.vercel.app
```

Prije prosljeđivanja bilo kojeg zahtjeva veza provjerava da `/api/config?workspace=cms-next-dev` vraća `cmsWorkspaceVersion: 1` i podržani razvojni prostor. API bez te potvrde ne prima zahtjeve za spremanje. To je važno jer bi starija verzija API-ja ignorirala nepoznati parametar i mogla spremati u produkciju.

Poveznica prosljeđuje Google ID token samo odobrenoj Meleh aplikaciji, prisilno postavlja razvojni prostor, ne prenosi kolačiće i ne prati preusmjeravanja za operativne zahtjeve. Stvarne tajne i ID tokeni ne spremaju se u Git.

## Provjera

Nakon prijave dopuštenim Google računom provjeriti spremanje skice, novu objavu i vraćanje prethodne verzije. Zatim provjeriti da produkcijski javni sadržaj i postojeće rezervacije ostaju nepromijenjeni.

Objavljeni razvojni sadržaj može se čitati kroz razvojne javne API rute. Privatne skice i povijest dostupne su samo ovlaštenim administratorima. Razvojne stranice ostaju označene `noindex`.
