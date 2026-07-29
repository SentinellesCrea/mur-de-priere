import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config({ path: ".env.local" });
dotenv.config();

const APPLY = process.argv.includes("--apply");
const VERIFY_ONLY = process.argv.includes("--verify");
const REFRESH_ADDRESSES = process.argv.includes("--refresh-addresses");
const NORMALIZE_CITIES = process.argv.includes("--normalize-cities");
const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/PrayerWallDB";
const DB_NAME = "PrayerWallDB";
const BORDEAUX_METROPOLE_SIREN = "243300316";
const OVERPASS_ENDPOINTS = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
];

const excludedDenominations = new Set([
  "jehovahs_witness",
  "latter_day_saints",
]);
const excludedNames = [
  /^presbytère$/i,
  /^maison paroissiale\b/i,
  /^salles? paroissiales?\b/i,
  /^salle georges guérin$/i,
  /^aumônerie\b/i,
  /^maison saint-louis beaulieu$/i,
];

function coordinatesFor(element) {
  const point = element.center || element;
  return [point.lon, point.lat];
}

function firstValue(tags, keys) {
  for (const key of keys) {
    if (tags[key]?.trim()) return tags[key].trim();
  }
  return "";
}

function normalizeCity(value = "") {
  const aliases = new Map([
    ["arlac", "Mérignac"],
    ["bordeaux caudéran", "Bordeaux"],
    ["merignac", "Mérignac"],
  ]);
  return aliases.get(value.trim().toLowerCase()) || value.trim();
}

function mapTradition(denomination = "", name = "") {
  const value = denomination.toLowerCase();
  const label = `${name} ${value}`.toLowerCase();

  if (value.includes("orthodox") || label.includes("orthodox")) {
    return { tradition: "Orthodoxe", denomination: "Orthodoxe" };
  }
  if (
    ["evangelical", "pentecostal", "baptist", "assemblies_of_god"].some(
      (item) => value.includes(item)
    ) ||
    label.includes("évangéli")
  ) {
    const denominationLabels = {
      assemblies_of_god: "Assemblées de Dieu",
      baptist: "Baptiste",
      pentecostal: "Pentecôtiste",
    };
    return {
      tradition: "Évangélique",
      denomination: denominationLabels[value] || "Évangélique",
    };
  }
  if (
    ["protestant", "reformed", "lutheran", "methodist", "adventist"].some(
      (item) => value.includes(item)
    ) ||
    label.includes("temple protestant")
  ) {
    return { tradition: "Protestante", denomination: "Protestante" };
  }
  if (
    ["catholic", "roman_catholic"].some((item) => value.includes(item)) ||
    /basilique|cathédrale|abbatiale|notre-dame|saint(?:e)?(?:-| )|assomption/.test(
      label
    )
  ) {
    return { tradition: "Catholique", denomination: "Catholique" };
  }
  return { tradition: "Autre", denomination: "Chrétienne" };
}

function addressFromTags(tags) {
  const line = firstValue(tags, ["addr:full"]) || [
    tags["addr:housenumber"],
    tags["addr:street"],
  ]
    .filter(Boolean)
    .join(" ");

  return {
    address: line,
    postalCode: tags["addr:postcode"] || "",
    city: normalizeCity(tags["addr:city"]),
    country: tags["addr:country"] || "France",
  };
}

async function fetchJson(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      Accept: "application/json",
      "User-Agent": "PrayerWall church directory (contact: admin@prayerwall.fr)",
      ...options.headers,
    },
  });
  if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
  return response.json();
}

async function fetchChurches() {
  const query = `[out:json][timeout:90];
rel["boundary"="local_authority"]["ref:FR:SIREN"="${BORDEAUX_METROPOLE_SIREN}"]->.metro;
.metro map_to_area->.bordeauxMetropole;
nwr["amenity"="place_of_worship"]["religion"="christian"](area.bordeauxMetropole);
out center tags;`;

  let lastError;
  for (const endpoint of OVERPASS_ENDPOINTS) {
    try {
      const url = new URL(endpoint);
      url.searchParams.set("data", query);
      const result = await fetchJson(url);
      if (result.elements?.length) return result.elements;
    } catch (error) {
      lastError = error;
      console.warn(`Serveur Overpass indisponible (${endpoint}): ${error.message}`);
    }
  }
  throw lastError || new Error("Aucune donnée OpenStreetMap reçue.");
}

const wait = (milliseconds) =>
  new Promise((resolve) => setTimeout(resolve, milliseconds));

async function reverseAddress([longitude, latitude]) {
  const url = new URL("https://nominatim.openstreetmap.org/reverse");
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("lat", latitude);
  url.searchParams.set("lon", longitude);
  url.searchParams.set("addressdetails", "1");
  url.searchParams.set("accept-language", "fr");

  const result = await fetchJson(url);
  const details = result.address || {};
  const road =
    details.road ||
    details.pedestrian ||
    details.square ||
    details.footway ||
    details.neighbourhood ||
    "";
  const address = [details.house_number, road].filter(Boolean).join(" ");

  return {
    address: address || result.name || result.display_name?.split(",")[0] || "Bordeaux",
    postalCode: details.postcode || "",
    city: normalizeCity(
      details.city ||
      details.town ||
      details.village ||
      details.municipality ||
      "Bordeaux"
    ),
    country: details.country || "France",
  };
}

function shouldImport(element) {
  const tags = element.tags || {};
  if (!tags.name?.trim()) return { import: false, reason: "sans nom" };
  if (excludedDenominations.has(tags.denomination)) {
    return { import: false, reason: "hors périmètre confessionnel" };
  }
  if (excludedNames.some((pattern) => pattern.test(tags.name.trim()))) {
    return { import: false, reason: "bâtiment annexe" };
  }
  return { import: true };
}

async function buildChurch(element, reverseCache, existingChurch) {
  const tags = element.tags;
  const coordinates = coordinatesFor(element);
  let address = addressFromTags(tags);

  if (existingChurch && (!address.address || !address.city)) {
    address = {
      address: address.address || existingChurch.address || "",
      postalCode: address.postalCode || existingChurch.postalCode || "",
      city: address.city || existingChurch.city || "",
      country: address.country || existingChurch.country || "France",
    };
  }

  if (!address.address || !address.city) {
    const cacheKey = coordinates.join(",");
    if (!reverseCache.has(cacheKey)) {
      reverseCache.set(cacheKey, await reverseAddress(coordinates));
      await wait(1100);
    }
    const reverse = reverseCache.get(cacheKey);
    address = {
      address: address.address || reverse.address,
      postalCode: address.postalCode || reverse.postalCode,
      city: address.city || reverse.city,
      country: address.country || reverse.country,
    };
  }

  const classification = mapTradition(tags.denomination, tags.name);
  const sourceId = `${element.type}/${element.id}`;

  return {
    name: tags.name.trim(),
    ...address,
    email: firstValue(tags, ["contact:email", "email"]),
    phone: firstValue(tags, ["contact:phone", "phone"]),
    website: firstValue(tags, ["contact:website", "website"]),
    ...classification,
    languages: firstValue(tags, ["service:language", "language"])
      .split(/[;,]/)
      .map((value) => value.trim())
      .filter(Boolean),
    serviceTimes: firstValue(tags, ["service_times"]),
    description: firstValue(tags, ["description"]),
    accessibility: tags.wheelchair === "yes",
    childrenWelcome: false,
    coordinates: { type: "Point", coordinates },
    isValidated: true,
    status: "validated",
    submittedBy: "admin",
    validatedAt: new Date(),
    source: "openstreetmap",
    sourceId,
    sourceUrl: `https://www.openstreetmap.org/${sourceId}`,
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

async function main() {
  if (NORMALIZE_CITIES) {
    await mongoose.connect(MONGODB_URI, { dbName: DB_NAME });
    const collection = mongoose.connection.collection("churches");
    const corrections = [
      { from: "Arlac", to: "Mérignac" },
      { from: "Bordeaux Caudéran", to: "Bordeaux" },
      { from: "MERIGNAC", to: "Mérignac" },
    ];
    let modified = 0;
    for (const correction of corrections) {
      const result = await collection.updateMany(
        { source: "openstreetmap", city: correction.from },
        { $set: { city: correction.to, updatedAt: new Date() } }
      );
      modified += result.modifiedCount;
    }
    console.log(`${modified} libellé(s) de commune normalisé(s).`);
    await mongoose.disconnect();
    return;
  }

  if (VERIFY_ONLY) {
    await mongoose.connect(MONGODB_URI, { dbName: DB_NAME });
    const collection = mongoose.connection.collection("churches");
    const [total, validated, traditions, communes] = await Promise.all([
      collection.countDocuments({ source: "openstreetmap" }),
      collection.countDocuments({
        source: "openstreetmap",
        status: "validated",
        isValidated: true,
      }),
      collection
        .aggregate([
          { $match: { source: "openstreetmap" } },
          { $group: { _id: "$tradition", count: { $sum: 1 } } },
          { $sort: { _id: 1 } },
        ])
        .toArray(),
      collection.distinct("city", { source: "openstreetmap" }),
    ]);
    console.log(
      JSON.stringify(
        {
          total,
          validated,
          communeCount: communes.filter(Boolean).length,
          communes: communes.filter(Boolean).sort(),
          traditions,
        },
        null,
        2
      )
    );
    await mongoose.disconnect();
    return;
  }

  console.log(
    APPLY
      ? "Import des églises de Bordeaux Métropole…"
      : "Simulation uniquement (ajoutez --apply pour écrire en base)…"
  );

  const elements = await fetchChurches();
  const selected = [];
  const excluded = [];
  for (const element of elements) {
    const decision = shouldImport(element);
    if (decision.import) selected.push(element);
    else {
      excluded.push({
        name: element.tags?.name || `${element.type}/${element.id}`,
        reason: decision.reason,
      });
    }
  }

  console.log(
    `${elements.length} lieux trouvés, ${selected.length} églises retenues, ${excluded.length} exclus.`
  );
  for (const item of excluded) {
    console.log(`  Exclu: ${item.name} (${item.reason})`);
  }

  const reverseCache = new Map();
  let collection = null;
  const existingBySourceId = new Map();
  if (APPLY) {
    await mongoose.connect(MONGODB_URI, { dbName: DB_NAME });
    collection = mongoose.connection.collection("churches");
    const existingChurches = await collection
      .find({ source: "openstreetmap" })
      .toArray();
    for (const church of existingChurches) {
      existingBySourceId.set(church.sourceId, church);
    }
  }

  const churches = [];
  for (const [index, element] of selected.entries()) {
    const sourceId = `${element.type}/${element.id}`;
    const church = await buildChurch(
      element,
      reverseCache,
      REFRESH_ADDRESSES ? null : existingBySourceId.get(sourceId)
    );
    churches.push(church);
    console.log(
      `[${index + 1}/${selected.length}] ${church.name} — ${church.address}, ${church.city}`
    );
  }

  if (!APPLY) {
    console.log(`Simulation terminée: ${churches.length} fiches prêtes.`);
    return;
  }

  let inserted = 0;
  let updated = 0;

  for (const church of churches) {
    const existing = await collection.findOne({
      $or: [
        { source: church.source, sourceId: church.sourceId },
        {
          name: church.name,
          "coordinates.coordinates": church.coordinates.coordinates,
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
    `Import terminé: ${inserted} ajoutées, ${updated} mises à jour, ${churches.length} traitées.`
  );
  await mongoose.disconnect();
}

main().catch(async (error) => {
  console.error("Échec de l’import:", error.message);
  await mongoose.disconnect().catch(() => {});
  process.exitCode = 1;
});
