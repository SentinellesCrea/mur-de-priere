import { NextResponse } from "next/server";
import sanitizeHtml from "sanitize-html";
import dbConnect from "@/lib/dbConnect";
import { requireAuth } from "@/lib/auth";
import Church from "@/models/Church";
import { isValidEmail } from "@/lib/apiSecurity";
import {
  buildChurchFullAddress,
  geocodeChurchAddress,
} from "@/lib/geocodeChurchAddress";
import { CHURCH_TRADITIONS } from "@/data/churchOptions";
import {
  normalizeChurchSearchValue,
  parsePositiveInteger,
  tokenizeChurchSearch,
} from "@/lib/churchDirectory";

function clean(value, limit = 500) {
  return sanitizeHtml(String(value || ""), {
    allowedTags: [],
    allowedAttributes: {},
  })
    .trim()
    .slice(0, limit);
}

function parseLanguages(value) {
  const values = Array.isArray(value) ? value : String(value || "").split(",");
  return values.map((item) => clean(item, 50)).filter(Boolean).slice(0, 10);
}

export async function GET(req) {
  try {
    await dbConnect();
    const admin = await requireAuth("admin", req);
    if (!admin) return NextResponse.json({ message: "Non autorisé" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const page = parsePositiveInteger(searchParams.get("page"), 1, 100000);
    const limit = parsePositiveInteger(searchParams.get("limit"), 12, 50);
    const status = searchParams.get("status") || "all";
    const search = clean(searchParams.get("search"), 100);
    const city = clean(searchParams.get("city"), 100);
    const tradition = clean(searchParams.get("tradition"), 50);
    const network = clean(searchParams.get("network"), 200);
    const origin = clean(searchParams.get("origin"), 80);
    const searchTokens = tokenizeChurchSearch(search);

    const statusFilters = {
      pending: { status: "pending" },
      validated: { status: "validated", isValidated: true },
      disabled: { status: { $in: ["disabled", "archived"] } },
      rejected: { status: "rejected" },
    };
    const filters = {
      ...(statusFilters[status] || {}),
      ...(city && city !== "all"
        ? { normalizedCity: normalizeChurchSearchValue(city) }
        : {}),
      ...(tradition && tradition !== "all" ? { tradition } : {}),
      ...(network && network !== "all" ? { networkName: network } : {}),
      ...(origin === "impactcentrechretien"
        ? { source: "impactcentrechretien" }
        : origin === "openstreetmap"
          ? { source: "openstreetmap" }
          : origin === "admin"
            ? {
                submittedBy: "admin",
                source: { $nin: ["impactcentrechretien", "openstreetmap"] },
              }
            : origin === "registration"
              ? {
                  submittedBy: { $ne: "admin" },
                  source: { $nin: ["impactcentrechretien", "openstreetmap"] },
                }
              : {}),
      ...(searchTokens.length
        ? {
            $or: [
              { normalizedAliases: normalizeChurchSearchValue(search) },
              { searchTokens: { $all: searchTokens } },
            ],
          }
        : {}),
    };

    const [
      churches,
      total,
      allCount,
      pendingCount,
      validatedCount,
      disabledCount,
      rejectedCount,
      networks,
    ] = await Promise.all([
      Church.find(filters)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Church.countDocuments(filters),
      Church.countDocuments({}),
      Church.countDocuments(statusFilters.pending),
      Church.countDocuments(statusFilters.validated),
      Church.countDocuments(statusFilters.disabled),
      Church.countDocuments(statusFilters.rejected),
      Church.distinct("networkName", { networkName: { $nin: [null, ""] } }),
    ]);

    return NextResponse.json({
      churches,
      total,
      page,
      limit,
      totalPages: Math.max(1, Math.ceil(total / limit)),
      counts: {
        all: allCount,
        pending: pendingCount,
        validated: validatedCount,
        disabled: disabledCount,
        rejected: rejectedCount,
      },
      facets: {
        networks: networks.sort((a, b) => a.localeCompare(b, "fr")),
      },
    });
  } catch (error) {
    console.error("Erreur GET /admin/churches :", error);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await dbConnect();
    const admin = await requireAuth("admin", req);
    if (!admin) return NextResponse.json({ message: "Non autorisé" }, { status: 401 });

    const body = await req.json();
    const churchData = {
      name: clean(body.name, 200),
      address: clean(body.address, 500),
      city: clean(body.city, 100),
      postalCode: clean(body.postalCode, 20),
      country: clean(body.country, 100),
      email: clean(body.email, 254).toLowerCase(),
      phone: clean(body.phone, 30),
      website: clean(body.website, 500),
      tradition: CHURCH_TRADITIONS.includes(body.tradition) ? body.tradition : "Autre",
      denomination: clean(body.denomination, 100),
      languages: parseLanguages(body.languages),
      serviceTimes: clean(body.serviceTimes, 500),
      description: clean(body.description, 1500),
      accessibility: body.accessibility === true,
      childrenWelcome: body.childrenWelcome === true,
    };

    if (!churchData.name || !churchData.address) {
      return NextResponse.json({ message: "Nom et adresse requis" }, { status: 400 });
    }
    if (churchData.email && !isValidEmail(churchData.email)) {
      return NextResponse.json({ message: "Email invalide" }, { status: 400 });
    }

    const location = await geocodeChurchAddress(buildChurchFullAddress(churchData));
    if (!location) {
      return NextResponse.json({ message: "Adresse introuvable" }, { status: 400 });
    }

    const church = await Church.create({
      ...churchData,
      coordinates: {
        type: "Point",
        coordinates: [location.lng, location.lat],
      },
      isValidated: true,
      status: "validated",
      submittedBy: "admin",
      validatedAt: new Date(),
      validatedBy: admin._id,
    });

    return NextResponse.json(church, { status: 201 });
  } catch (error) {
    console.error("Erreur POST /admin/churches :", error);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}
