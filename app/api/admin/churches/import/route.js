import { NextResponse } from "next/server";
import sanitizeHtml from "sanitize-html";
import dbConnect from "@/lib/dbConnect";
import { requireAuth } from "@/lib/auth";
import Church from "@/models/Church";
import { isValidEmail } from "@/lib/apiSecurity";
import { CHURCH_TRADITIONS } from "@/data/churchOptions";
import { buildChurchSearchFields } from "@/lib/churchDirectory";

const MAX_BATCH_SIZE = 500;

function clean(value, limit = 500) {
  return sanitizeHtml(String(value || ""), {
    allowedTags: [],
    allowedAttributes: {},
  })
    .trim()
    .slice(0, limit);
}

function parseCoordinates(record) {
  const rawCoordinates = record.coordinates?.coordinates;
  const lng = Number(
    Array.isArray(rawCoordinates) ? rawCoordinates[0] : record.lng
  );
  const lat = Number(
    Array.isArray(rawCoordinates) ? rawCoordinates[1] : record.lat
  );

  if (
    !Number.isFinite(lat) ||
    !Number.isFinite(lng) ||
    lat < -90 ||
    lat > 90 ||
    lng < -180 ||
    lng > 180
  ) {
    return null;
  }

  return { type: "Point", coordinates: [lng, lat] };
}

function prepareChurch(record, source, publish, adminId) {
  const aliases = Array.isArray(record.aliases)
    ? record.aliases.map((value) => clean(value, 80)).filter(Boolean).slice(0, 30)
    : [];
  const languages = Array.isArray(record.languages)
    ? record.languages
        .map((value) => clean(value, 50))
        .filter(Boolean)
        .slice(0, 10)
    : [];
  const coordinates = parseCoordinates(record);
  const church = {
    name: clean(record.name, 200),
    address: clean(record.address, 500),
    city: clean(record.city, 100),
    postalCode: clean(record.postalCode, 30),
    country: clean(record.country, 100),
    countryCode: clean(record.countryCode, 2).toUpperCase(),
    region: clean(record.region, 100),
    email: clean(record.email, 254).toLowerCase(),
    phone: clean(record.phone, 50),
    website: clean(record.website, 500),
    tradition: CHURCH_TRADITIONS.includes(record.tradition)
      ? record.tradition
      : "Autre",
    denomination: clean(record.denomination, 150),
    networkName: clean(record.networkName, 200),
    campusName: clean(record.campusName, 200),
    aliases,
    leaderName: clean(record.leaderName, 150),
    languages,
    serviceTimes: clean(record.serviceTimes, 500),
    description: clean(record.description, 1500),
    accessibility: record.accessibility === true,
    childrenWelcome: record.childrenWelcome === true,
    source,
    sourceId: clean(record.sourceId, 200),
    sourceUrl: clean(record.sourceUrl, 500),
    coordinates,
    lastVerifiedAt: record.lastVerifiedAt
      ? new Date(record.lastVerifiedAt)
      : new Date(),
    verificationStatus: record.verificationStatus === "outdated"
      ? "outdated"
      : "verified",
    isValidated: publish,
    status: publish ? "validated" : "pending",
    submittedBy: "admin",
    validatedAt: publish ? new Date() : undefined,
    validatedBy: publish ? adminId : undefined,
    disabledAt: undefined,
    archivedAt: undefined,
    rejectedAt: undefined,
  };

  Object.assign(church, buildChurchSearchFields(church));
  return church;
}

export async function POST(request) {
  try {
    await dbConnect();
    const admin = await requireAuth("admin", request);
    if (!admin) {
      return NextResponse.json({ message: "Non autorisé" }, { status: 401 });
    }

    const body = await request.json();
    const source = clean(body.source, 80).toLowerCase();
    const records = Array.isArray(body.churches) ? body.churches : [];
    const publish = body.publish === true;
    const dryRun = body.dryRun === true;

    if (!source || !/^[a-z0-9][a-z0-9._-]*$/.test(source)) {
      return NextResponse.json(
        { message: "La source doit être un identifiant stable (lettres, chiffres, point, tiret ou underscore)." },
        { status: 400 }
      );
    }
    if (records.length === 0 || records.length > MAX_BATCH_SIZE) {
      return NextResponse.json(
        { message: `Un lot doit contenir entre 1 et ${MAX_BATCH_SIZE} églises.` },
        { status: 400 }
      );
    }

    const rejected = [];
    const preparedBySourceId = new Map();

    records.forEach((record, index) => {
      const church = prepareChurch(record, source, publish, admin._id);
      const problems = [];
      if (!church.sourceId) problems.push("sourceId requis");
      if (!church.name) problems.push("nom requis");
      if (!church.address) problems.push("adresse requise");
      if (!church.coordinates) problems.push("coordonnées valides requises");
      if (church.email && !isValidEmail(church.email)) problems.push("email invalide");
      if (church.lastVerifiedAt && Number.isNaN(church.lastVerifiedAt.getTime())) {
        problems.push("date de vérification invalide");
      }

      if (problems.length > 0) {
        rejected.push({ index, sourceId: church.sourceId || null, problems });
        return;
      }
      preparedBySourceId.set(church.sourceId, church);
    });

    const prepared = [...preparedBySourceId.values()];
    if (dryRun || prepared.length === 0) {
      return NextResponse.json({
        dryRun,
        source,
        received: records.length,
        valid: prepared.length,
        rejected,
      });
    }

    const now = new Date();
    const result = await Church.bulkWrite(
      prepared.map((church) => ({
        updateOne: {
          filter: { source, sourceId: church.sourceId },
          update: {
            $set: { ...church, updatedAt: now },
            $setOnInsert: { createdAt: now },
          },
          upsert: true,
        },
      })),
      { ordered: false }
    );

    return NextResponse.json({
      source,
      received: records.length,
      accepted: prepared.length,
      rejected,
      matched: result.matchedCount,
      modified: result.modifiedCount,
      inserted: result.upsertedCount,
      published: publish,
    });
  } catch (error) {
    console.error("Erreur POST /admin/churches/import :", error);
    return NextResponse.json(
      { message: error?.code === 11000 ? "Identifiant de source dupliqué" : "Erreur serveur" },
      { status: error?.code === 11000 ? 409 : 500 }
    );
  }
}
