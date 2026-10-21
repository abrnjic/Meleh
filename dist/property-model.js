import { validateSeasons } from "./model.js";
// Independent object model. Drafts may be incomplete; publication is validated separately.
const fail = (message) => Object.assign(new Error(message), { status: 400 });
const langs = ["hr", "en", "de", "cs"];
const clean = (v, max = 5000) => {
  if (v == null) return "";
  if (
    typeof v !== "string" ||
    v.length > max ||
    /[<>\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(v)
  )
    throw fail("Tekst sadrži nedopuštene znakove ili je predugačak.");
  return v.trim();
};
const localized = (v) =>
  Object.fromEntries(langs.map((l) => [l, clean(v?.[l])]));
const slug = (v) => {
  if (typeof v !== "string" || !/^[a-z][a-z0-9-]{0,49}$/.test(v))
    throw fail(
      "URL oznaka mora početi slovom i sadržavati mala slova, brojeve ili crtice.",
    );
  return v;
};
const id = (v) => {
  if (typeof v !== "string" || !/^[a-f0-9-]{36}$/.test(v))
    throw fail("Neispravna oznaka stavke.");
  return v;
};
const bounded = (v, min, max) => {
  if (v === "" || v == null) return null;
  const n = Number(v);
  if (!Number.isFinite(n) || n < min || n > max)
    throw fail("Broj je izvan dopuštenog raspona.");
  return n;
};
const unique = (rows, key) => {
  if (new Set(rows.map((r) => r[key])).size !== rows.length)
    throw fail("Oznake stavki moraju biti jedinstvene.");
  return rows;
};
const photoKey = (v) => {
  if (!/^[a-z][a-z0-9-]{0,70}$/.test(v || ""))
    throw fail("Neispravna oznaka fotografije.");
  return v;
};
export const SECTION_TYPES = [
  "hero",
  "text",
  "gallery",
  "units",
  "map",
  "contact",
];
export function emptyProperty(name, urlSlug, type = "apartments") {
  return {
    schemaVersion: 1,
    name,
    slug: urlSlug,
    type,
    location: "",
    address: "",
    phone: "",
    description: Object.fromEntries(langs.map((l) => [l, ""])),
    units: [],
    photos: [],
    branding: {
      theme: "classic",
      accent: "#066b9b",
      logoKey: "",
      font: "classic",
    },
    pages: [],
  };
}
function contrastOnWhite(hex) {
  const rgb = hex
    .slice(1)
    .match(/../g)
    .map((v) => parseInt(v, 16) / 255)
    .map((v) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 1.05 / (rgb[0] * 0.2126 + rgb[1] * 0.7152 + rgb[2] * 0.0722 + 0.05);
}
export function normalizeProperty(input) {
  if (!input || typeof input !== "object" || Array.isArray(input))
    throw fail("Neispravan objekt.");
  const name = clean(input.name, 150);
  if (!name) throw fail("Naziv objekta je obavezan.");
  if (!["apartments", "house", "villa"].includes(input.type))
    throw fail("Odaberite vrstu objekta.");
  const rows = (value, max) => {
    if (!Array.isArray(value) || value.length > max)
      throw fail("Previše stavki ili neispravan popis.");
    return value;
  };
  const photos = unique(
    rows(input.photos || [], 150).map((p) => {
      const file = clean(p.file, 120),
        url = clean(p.url, 300);
      if (file && !/^[a-zA-Z0-9_.-]+\.(?:jpg|jpeg|png|webp)$/.test(file))
        throw fail("Neispravna fotografija.");
      if (
        url &&
        !/^\/api\/photo\?id=[a-f0-9-]{36}\.(?:jpg|png|webp)$/.test(url)
      )
        throw fail("Fotografiju dodajte putem medijske biblioteke.");
      if (!file && !url) throw fail("Nedostaje datoteka fotografije.");
      return {
        key: photoKey(p.key),
        file: file || null,
        url: url || null,
        alt: localized(typeof p.alt === "string" ? { hr: p.alt } : p.alt),
      };
    }),
    "key",
  );
  const keys = new Set(photos.map((p) => p.key));
  const image = (v) => {
    if (!v) return "";
    if (!keys.has(v))
      throw fail("Odabrana fotografija više nije u biblioteci objekta.");
    return v;
  };
  const units = unique(
    rows(input.units || [], 50).map((u) => {
      const guests = bounded(u.guests, 1, 40),
        rooms = bounded(u.rooms, 0, 20);
      if (
        (guests !== null && !Number.isInteger(guests)) ||
        (rooms !== null && !Number.isInteger(rooms))
      )
        throw fail("Kapacitet i broj soba moraju biti cijeli brojevi.");
      return {
        id: id(u.id),
        slug: slug(u.slug),
        name: clean(u.name, 150),
        description: localized(u.description),
        guests,
        rooms,
        area: bounded(u.area, 5, 2000),
        image: image(u.image),
        seasons: validateSeasons(u.seasons || []),
      };
    }),
    "id",
  );
  unique(units, "slug");
  const color = input.branding?.accent || "#066b9b";
  if (!/^#[a-f0-9]{6}$/i.test(color) || contrastOnWhite(color) < 4.5)
    throw fail(
      "Odaberite naglasnu boju s dovoljnim kontrastom prema bijelom tekstu.",
    );
  const pages = unique(
    rows(input.pages || [], 30).map((page) => ({
      id: id(page.id),
      slug: slug(page.slug),
      title: localized(page.title),
      sections: unique(
        rows(page.sections || [], 30).map((section) => {
          if (!SECTION_TYPES.includes(section.type))
            throw fail("Nepodržana vrsta sekcije.");
          return {
            id: id(section.id),
            type: section.type,
            visible: section.visible !== false,
            title: localized(section.title),
            body: localized(section.body),
            photoKeys: rows(section.photoKeys || [], 30).map(image),
            align: section.align === "center" ? "center" : "left",
            surface: section.surface === "blue" ? "blue" : "white",
          };
        }),
        "id",
      ),
    })),
    "id",
  );
  unique(pages, "slug");
  const phone = clean(input.phone, 40);
  if (phone && !/^\+?[\d\s()-]{5,40}$/.test(phone))
    throw fail("Provjerite telefonski broj.");
  const result = {
    schemaVersion: 1,
    name,
    slug: slug(input.slug),
    type: input.type,
    location: clean(input.location, 250),
    address: clean(input.address, 500),
    phone,
    description: localized(input.description),
    units,
    photos,
    branding: {
      theme: input.branding?.theme === "adria" ? "adria" : "classic",
      font: input.branding?.font === "modern" ? "modern" : "classic",
      accent: color,
      logoKey: image(input.branding?.logoKey),
    },
    pages,
  };
  if (new TextEncoder().encode(JSON.stringify(result)).length > 300000)
    throw fail("Sadržaj objekta je prevelik. Smanjite broj ili duljinu unosa.");
  return result;
}
export function publicationIssues(input) {
  const p = normalizeProperty(input),
    issues = [];
  if (!p.location) issues.push("Unesite lokaciju objekta.");
  if (!p.description.hr)
    issues.push("Unesite opis objekta na hrvatskom jeziku.");
  if (!p.units.length)
    issues.push("Dodajte najmanje jednu smještajnu jedinicu.");
  for (const u of p.units) {
    if (
      !u.name ||
      !u.guests ||
      u.rooms === null ||
      !u.area ||
      !u.description.hr ||
      !u.image
    )
      issues.push(
        "Dovršite naziv, kapacitet, sobe, površinu, opis i naslovnicu jedinice " +
          (u.name || u.slug) +
          ".",
      );
  }
  if (!p.photos.length) issues.push("Dodajte fotografije objekta.");
  return issues;
}
