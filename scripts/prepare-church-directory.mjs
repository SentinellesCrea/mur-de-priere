import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const APPLY = process.argv.includes("--apply");
const BATCH_SIZE = 500;
const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/PrayerWallDB";

const NETWORK_ALIASES = {
  "impact centre chretien": ["ICC"],
  "impact christian centre": ["ICC"],
  "assemblee chretienne pour l evangelisation et le reveil": ["ACER"],
  "centre d evangelisation esprit et vie": ["CEEV"],
  "eglise martin luther king": ["MLK"],
  "porte ouverte chretienne": ["POC"],
};

function normalize(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, " ")
    .trim()
    .toLowerCase();
}

function prepareFields(church) {
  const names = [church.name, church.networkName, church.denomination].map(normalize);
  const inferred = Object.entries(NETWORK_ALIASES)
    .filter(([network]) =>
      names.some((value) => value === network || value.includes(network))
    )
    .flatMap(([, aliases]) => aliases);
  const aliases = [
    ...new Set(
      [...(Array.isArray(church.aliases) ? church.aliases : []), ...inferred]
        .map((value) => String(value || "").trim())
        .filter(Boolean)
    ),
  ].slice(0, 30);
  const searchTokens = [
    ...new Set(
      [
        church.name,
        church.address,
        church.city,
        church.postalCode,
        church.country,
        church.region,
        church.tradition,
        church.denomination,
        church.networkName,
        church.campusName,
        aliases,
      ]
        .flat(Infinity)
        .flatMap((value) => normalize(value).split(" "))
        .filter((token) => token.length >= 2)
    ),
  ].slice(0, 100);
  const locationTokens = [
    ...new Set(
      [
        church.address,
        church.city,
        church.postalCode,
        church.country,
        church.region,
      ]
        .flatMap((value) => normalize(value).split(" "))
        .filter((token) => token.length >= 2)
    ),
  ].slice(0, 100);

  return {
    aliases,
    normalizedName: normalize(church.name),
    normalizedCity: normalize(church.city),
    normalizedPostalCode: normalize(church.postalCode),
    normalizedCountry: normalize(church.country),
    normalizedAliases: aliases.map(normalize).filter(Boolean),
    searchTokens,
    locationTokens,
  };
}

async function createIndexes(collection) {
  await collection.createIndexes([
    { key: { coordinates: "2dsphere" }, name: "coordinates_2dsphere" },
    { key: { city: 1 }, name: "city_1" },
    { key: { postalCode: 1 }, name: "postalCode_1" },
    { key: { country: 1 }, name: "country_1" },
    { key: { countryCode: 1 }, name: "countryCode_1" },
    { key: { region: 1 }, name: "region_1" },
    { key: { searchTokens: 1 }, name: "searchTokens_1" },
    { key: { locationTokens: 1 }, name: "locationTokens_1" },
    { key: { normalizedAliases: 1 }, name: "normalizedAliases_1" },
    {
      key: { status: 1, normalizedCountry: 1, normalizedCity: 1, name: 1 },
      name: "status_country_city_name",
    },
    {
      key: { status: 1, tradition: 1, denomination: 1, name: 1 },
      name: "status_tradition_denomination_name",
    },
    {
      key: { status: 1, networkName: 1, name: 1 },
      name: "status_network_name",
    },
    {
      key: { "management.status": 1, status: 1 },
      name: "management_status_directory_status",
    },
    {
      key: {
        name: "text",
        aliases: "text",
        networkName: "text",
        campusName: "text",
        denomination: "text",
        city: "text",
      },
      name: "church_directory_text",
      default_language: "none",
      weights: {
        name: 10,
        aliases: 10,
        networkName: 8,
        campusName: 7,
        denomination: 5,
        city: 3,
      },
    },
    {
      key: { source: 1, sourceId: 1 },
      name: "source_1_sourceId_1",
      unique: true,
      partialFilterExpression: { sourceId: { $type: "string" } },
    },
  ]);
}

async function run() {
  await mongoose.connect(MONGODB_URI, { dbName: "PrayerWallDB" });
  const collection = mongoose.connection.collection("churches");
  const total = await collection.countDocuments({});

  if (!APPLY) {
    console.log(
      `${total} fiches détectées. Relancez avec --apply pour enrichir les champs de recherche et créer les index.`
    );
    return;
  }

  const cursor = collection.find({});
  let operations = [];
  let processed = 0;

  for await (const church of cursor) {
    operations.push({
      updateOne: {
        filter: { _id: church._id },
        update: { $set: prepareFields(church) },
      },
    });

    if (operations.length >= BATCH_SIZE) {
      await collection.bulkWrite(operations, { ordered: false });
      processed += operations.length;
      operations = [];
      console.log(`${processed}/${total} fiches préparées…`);
    }
  }

  if (operations.length > 0) {
    await collection.bulkWrite(operations, { ordered: false });
    processed += operations.length;
  }

  await createIndexes(collection);
  console.log(`${processed} fiches préparées et index de l’annuaire créés.`);
}

run()
  .catch((error) => {
    console.error("Échec de la préparation de l’annuaire :", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
