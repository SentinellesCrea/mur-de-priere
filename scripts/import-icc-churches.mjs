import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config({ path: ".env.local" });
dotenv.config();

const APPLY = process.argv.includes("--apply");
const VERIFY_ONLY = process.argv.includes("--verify");
const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/PrayerWallDB";
const DB_NAME = "PrayerWallDB";
const ICC_API_URL = "https://impactcentrechretien.com/api.php?zones=true";
const ICC_NETWORK_NAME = "Impact Centre Chrétien";
const REQUEST_DELAY_MS = 1100;

const COUNTRY_ALIASES = {
  "Angleterre": { name: "Royaume-Uni", code: "GB" },
  "Centrafrique": { name: "République centrafricaine", code: "CF" },
  "Congo-Brazzaville": { name: "République du Congo", code: "CG" },
  "République démocratique du Congo": {
    name: "République démocratique du Congo",
    code: "CD",
  },
  "Saint-Pierre": { name: "Martinique", code: "MQ" },
  "États-Unis": { name: "États-Unis", code: "US" },
};

const wait = (milliseconds) =>
  new Promise((resolve) => setTimeout(resolve, milliseconds));

function normalizeText(value) {
  return String(value || "").trim();
}

function normalizeCountry(country, countryCode) {
  return (
    COUNTRY_ALIASES[country] || {
      name: country,
      code: /^[A-Z]{2}$/.test(countryCode || "") ? countryCode : "",
    }
  );
}

function normalizeCampus(campus) {
  const country =
    campus.slug === "brazzaville"
      ? { name: "République du Congo", code: "CG" }
      : normalizeCountry(campus.country, campus.countryCode);

  return {
    ...campus,
    country: country.name,
    countryCode: country.code,
    adresse: normalizeText(campus.adresse),
    codePostal: normalizeText(campus.codePostal),
    ville: normalizeText(campus.ville),
    phone: normalizeText(campus.phone),
    email: normalizeText(campus.email),
    responsable: normalizeText(campus.responsable),
  };
}

function completenessScore(campus) {
  return [
    campus.adresse,
    campus.codePostal,
    campus.ville,
    campus.phone,
    campus.email,
    campus.responsable,
    campus.description,
    campus.cultes?.length,
  ].filter(Boolean).length;
}

function mergeDuplicateCampuses(items) {
  const sorted = [...items].sort(
    (a, b) =>
      Number(b.id || 0) - Number(a.id || 0) ||
      completenessScore(b) - completenessScore(a)
  );
  const merged = { ...sorted[0] };

  for (const campus of sorted.slice(1)) {
    for (const key of [
      "adresse",
      "codePostal",
      "ville",
      "phone",
      "email",
      "responsable",
      "description",
      "facebook",
      "instagram",
      "twitter",
      "youtube",
      "pageUrl",
    ]) {
      if (!merged[key] && campus[key]) merged[key] = campus[key];
    }
    if ((!merged.cultes || merged.cultes.length === 0) && campus.cultes?.length) {
      merged.cultes = campus.cultes;
    }
  }

  return normalizeCampus(merged);
}

function extractCampuses(payload) {
  const rows = (payload.zones || []).flatMap((zone) =>
    (zone.pays || []).flatMap((country) =>
      (country.eglises || []).map((church) => ({
        ...church,
        region: zone.name,
        country: country.name,
        countryCode: country.code,
      }))
    )
  );

  const physical = rows.filter(
    (campus) =>
      campus.slug !== "icconline" &&
      campus.countryCode !== "iccel" &&
      campus.type?.code === "el" &&
      campus.name?.trim()
  );
  const groups = new Map();
  for (const campus of physical) {
    const key = normalizeText(campus.slug || campus.name).toLocaleLowerCase("fr");
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(campus);
  }

  return [...groups.values()]
    .map(mergeDuplicateCampuses)
    .sort((a, b) =>
      `${a.country} ${a.name}`.localeCompare(`${b.country} ${b.name}`, "fr")
    );
}

async function fetchJson(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      Accept: "application/json",
      "User-Agent": "PrayerWall church directory importer",
      ...options.headers,
    },
  });
  if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
  return response.json();
}

async function fetchOfficialCampuses() {
  const payload = await fetchJson(ICC_API_URL);
  return {
    announcedChurches: Number(payload.nbEglises || 0),
    announcedCountries: Number(payload.nbPays || 0),
    campuses: extractCampuses(payload),
  };
}

function postalCodeFor(campus) {
  const value = campus.codePostal;
  if (!value) return "";

  const patterns = [
    /\b[A-Z]\d[A-Z][ -]?\d[A-Z]\d\b/i,
    /\b[A-Z]{1,2}\d[A-Z\d]?[ -]?\d[A-Z]{2}\b/i,
    /\b\d{5}(?:-\d{4})?\b/,
    /\b\d{4,6}\b/,
  ];
  for (const pattern of patterns) {
    const match = value.match(pattern);
    if (match) return match[0].toUpperCase();
  }
  return value.slice(0, 20);
}

async function searchLocation(query, countryCode) {
  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("limit", "1");
  url.searchParams.set("addressdetails", "1");
  url.searchParams.set("accept-language", "fr");
  url.searchParams.set("q", query);
  if (countryCode) url.searchParams.set("countrycodes", countryCode.toLowerCase());

  const results = await fetchJson(url);
  await wait(REQUEST_DELAY_MS);
  return results[0] || null;
}

function campusCity(campus) {
  const aliases = {
    "cotonoucentre-sion": "Cotonou",
    "cotonoucentre-ville": "Cotonou",
    "cergy": "Puiseux-Pontoise",
    "icccasablanca": "Casablanca",
    "pointe-noire-centre-ville": "Pointe-Noire",
    "pointe-noire-siafoumou": "Pointe-Noire",
    "pointe-noire-nkouikou": "Pointe-Noire",
    "pointe-à-pitre": "Pointe-à-Pitre",
    "saint-pierre": "Saint-Pierre",
    "agoé-logopé": "Agoè-Nyivé",
  };
  return aliases[campus.slug] || campus.ville || campus.name;
}

function distanceKm(first, second) {
  const toRadians = (value) => (Number(value) * Math.PI) / 180;
  const lat1 = toRadians(first.lat);
  const lat2 = toRadians(second.lat);
  const deltaLat = lat2 - lat1;
  const deltaLng = toRadians(Number(second.lon) - Number(first.lon));
  const value =
    Math.sin(deltaLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLng / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(value), Math.sqrt(1 - value));
}

async function searchWithCountryFallback(query, countryCode) {
  let result = await searchLocation(query, countryCode);
  if (!result && countryCode) result = await searchLocation(query, "");
  return result;
}

async function geocodeCampus(campus) {
  const city = campusCity(campus);
  const preciseQuery = [
    campus.adresse,
    campus.codePostal,
    city,
    campus.country,
  ]
    .filter(Boolean)
    .join(", ");
  const cityQuery = [city, campus.country].filter(Boolean).join(", ");

  let location = await searchWithCountryFallback(
    preciseQuery,
    campus.countryCode
  );
  let cityLocation = null;

  if (!campus.ville || !location) {
    cityLocation = await searchWithCountryFallback(cityQuery, campus.countryCode);
  }
  if (!location) location = cityLocation;
  if (location && cityLocation && distanceKm(location, cityLocation) > 60) {
    location = cityLocation;
  }
  if (!location) return null;

  return {
    coordinates: [Number(location.lon), Number(location.lat)],
    city,
    postalCode: postalCodeFor(campus) || location.address?.postcode || "",
  };
}

function sourceUrlFor(campus) {
  return (
    normalizeText(campus.pageUrl) ||
    `https://impactcentrechretien.com/egliselocale?church=${encodeURIComponent(
      campus.slug
    )}`
  );
}

function toChurch(campus, location) {
  const address =
    campus.adresse || "Adresse précise non publiée dans l’annuaire officiel ICC";
  const serviceTimes = Array.isArray(campus.cultes)
    ? campus.cultes.map(normalizeText).filter(Boolean).join("\n")
    : "";

  return {
    name: `${ICC_NETWORK_NAME} — ${campus.name}`,
    networkName: ICC_NETWORK_NAME,
    campusName: campus.name,
    address,
    city: location.city || campus.ville || campus.name,
    postalCode: location.postalCode,
    country: campus.country,
    countryCode: campus.countryCode,
    region: campus.region,
    email: campus.email.toLowerCase(),
    phone: campus.phone,
    website: sourceUrlFor(campus),
    tradition: "Évangélique",
    denomination: ICC_NETWORK_NAME,
    languages: ["Français"],
    serviceTimes,
    description: normalizeText(campus.description),
    leaderName: campus.responsable,
    accessibility: false,
    childrenWelcome: false,
    socialLinks: {
      facebook: normalizeText(campus.facebook),
      instagram: normalizeText(campus.instagram),
      youtube: campus.youtube
        ? `https://youtube.com/channel/${normalizeText(campus.youtube)}`
        : "",
      others: [normalizeText(campus.twitter), normalizeText(campus.whatsappLink)].filter(
        Boolean
      ),
    },
    coordinates: { type: "Point", coordinates: location.coordinates },
    isValidated: true,
    status: "validated",
    submittedBy: "admin",
    validatedAt: new Date(),
    source: "impactcentrechretien",
    sourceId: normalizeText(campus.slug || campus.id),
    sourceUrl: sourceUrlFor(campus),
    lastVerifiedAt: new Date(),
  };
}

function withoutEmptyValues(church) {
  return Object.fromEntries(
    Object.entries(church).filter(([, value]) => {
      if (typeof value === "string") return value.trim().length > 0;
      if (Array.isArray(value)) return value.length > 0;
      return value !== undefined && value !== null;
    })
  );
}

async function verifyImport() {
  await mongoose.connect(MONGODB_URI, { dbName: DB_NAME });
  const collection = mongoose.connection.collection("churches");
  const [total, validated, networkAttached, countries, sourceIds, missingCoordinates] =
    await Promise.all([
    collection.countDocuments({ source: "impactcentrechretien" }),
    collection.countDocuments({
      source: "impactcentrechretien",
      status: "validated",
      isValidated: true,
    }),
    collection.countDocuments({
      source: "impactcentrechretien",
      networkName: ICC_NETWORK_NAME,
    }),
    collection.distinct("country", { source: "impactcentrechretien" }),
    collection.distinct("sourceId", { source: "impactcentrechretien" }),
    collection.countDocuments({
      source: "impactcentrechretien",
      "coordinates.coordinates.1": { $exists: false },
    }),
  ]);
  console.log(
    JSON.stringify(
      {
        total,
        validated,
        networkAttached,
        uniqueSourceIds: sourceIds.filter(Boolean).length,
        countryCount: countries.filter(Boolean).length,
        countries: countries.filter(Boolean).sort((a, b) => a.localeCompare(b, "fr")),
        missingCoordinates,
      },
      null,
      2
    )
  );
  await mongoose.disconnect();
}

async function main() {
  if (VERIFY_ONLY) {
    await verifyImport();
    return;
  }

  console.log(
    APPLY
      ? "Import mondial des campus Impact Centre Chrétien…"
      : "Simulation ICC uniquement (ajoutez --apply pour écrire en base)…"
  );
  const official = await fetchOfficialCampuses();
  console.log(
    `${official.announcedChurches} lignes officielles dans ${official.announcedCountries} pays ; ` +
      `${official.campuses.length} campus physiques uniques retenus.`
  );

  let collection = null;
  const existingBySourceId = new Map();
  if (APPLY) {
    await mongoose.connect(MONGODB_URI, { dbName: DB_NAME });
    collection = mongoose.connection.collection("churches");
    const existing = await collection
      .find({ source: "impactcentrechretien" })
      .toArray();
    for (const church of existing) existingBySourceId.set(church.sourceId, church);
  }

  const churches = [];
  const skipped = [];
  for (const [index, campus] of official.campuses.entries()) {
    const sourceId = normalizeText(campus.slug || campus.id);
    const existing = existingBySourceId.get(sourceId);
    const location = existing?.coordinates?.coordinates?.length === 2
      ? {
          coordinates: existing.coordinates.coordinates,
          city: existing.city,
          postalCode: existing.postalCode,
        }
      : await geocodeCampus(campus);

    if (!location) {
      skipped.push(`${campus.name} (${campus.country})`);
      console.warn(
        `[${index + 1}/${official.campuses.length}] Ignoré, position introuvable : ` +
          `${campus.name} (${campus.country})`
      );
      continue;
    }

    const church = toChurch(campus, location);
    churches.push(church);
    console.log(
      `[${index + 1}/${official.campuses.length}] ${church.campusName} — ` +
        `${church.city}, ${church.country}`
    );
  }

  if (!APPLY) {
    console.log(
      `Simulation terminée : ${churches.length} prêtes, ${skipped.length} ignorée(s).`
    );
    return;
  }

  let inserted = 0;
  let updated = 0;
  for (const church of churches) {
    const existing = await collection.findOne({
      $or: [
        { source: church.source, sourceId: church.sourceId },
        {
          networkName: ICC_NETWORK_NAME,
          campusName: church.campusName,
          country: church.country,
        },
      ],
    });
    const update = withoutEmptyValues(church);

    if (existing) {
      await collection.updateOne(
        { _id: existing._id },
        { $set: { ...update, updatedAt: new Date() } }
      );
      updated += 1;
    } else {
      await collection.insertOne({
        ...update,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      inserted += 1;
    }
  }

  await collection.createIndex({ coordinates: "2dsphere" });
  await collection.createIndex(
    { source: 1, sourceId: 1 },
    {
      unique: true,
      partialFilterExpression: { sourceId: { $type: "string" } },
    }
  );
  console.log(
    `Import terminé : ${inserted} ajoutés, ${updated} mis à jour, ` +
      `${skipped.length} ignoré(s).`
  );
  if (skipped.length) console.log(`À vérifier : ${skipped.join("; ")}`);
  await mongoose.disconnect();
}

main().catch(async (error) => {
  console.error("Échec de l’import ICC :", error.message);
  await mongoose.disconnect().catch(() => {});
  process.exitCode = 1;
});
