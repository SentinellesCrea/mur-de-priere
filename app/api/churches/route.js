import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Church from "@/models/Church";
import { enforceRateLimit, isValidEmail } from "@/lib/apiSecurity";
import sanitizeHtml from "sanitize-html";
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

const PUBLIC_CHURCH_FIELDS =
  "name address city postalCode country phone website tradition denomination languages " +
  "networkName campusName aliases region countryCode serviceTimes description accessibility " +
  "childrenWelcome coordinates";

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export async function GET(request) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || searchParams.get("name") || "";
    const address = searchParams.get("address") || "";
    const tradition = searchParams.get("tradition") || "";
    const denomination = searchParams.get("denomination") || "";
    const country = searchParams.get("country") || "";
    const countryCode = searchParams.get("countryCode") || "";
    const region = searchParams.get("region") || "";
    const language = searchParams.get("language") || "";
    const lat = searchParams.get("lat");
    const lng = searchParams.get("lng");
    const requestedRadius = parseFloat(searchParams.get("radius") || "");
    const radius = Number.isFinite(requestedRadius)
      ? Math.min(100, Math.max(1, requestedRadius))
      : null;
    const hasCoordinates =
      lat !== null &&
      lng !== null &&
      lat !== "" &&
      lng !== "" &&
      Number.isFinite(Number(lat)) && Number.isFinite(Number(lng));
    const page = parsePositiveInteger(searchParams.get("page"), 1, 100000);
    const limit = parsePositiveInteger(searchParams.get("limit"), 12, 50);
    const normalizedSearch = normalizeChurchSearchValue(search);
    const searchTokens = tokenizeChurchSearch(search);
    const addressRegex = escapeRegex(address.trim().slice(0, 300));
    const addressTokens = tokenizeChurchSearch(address);
    const baseFilters = {
      isValidated: true,
      status: "validated",
      archivedAt: null,
      disabledAt: null,
      ...(tradition && CHURCH_TRADITIONS.includes(tradition) ? { tradition } : {}),
      ...(denomination
        ? { denomination: { $regex: escapeRegex(denomination.slice(0, 100)), $options: "i" } }
        : {}),
      ...(country
        ? { country: { $regex: `^${escapeRegex(country.slice(0, 100))}$`, $options: "i" } }
        : {}),
      ...(countryCode
        ? { countryCode: countryCode.trim().slice(0, 2).toUpperCase() }
        : {}),
      ...(region
        ? { region: { $regex: escapeRegex(region.slice(0, 100)), $options: "i" } }
        : {}),
      ...(language
        ? { languages: { $regex: `^${escapeRegex(language.slice(0, 50))}$`, $options: "i" } }
        : {}),
      ...(searchTokens.length
        ? {
            $or: [
              { normalizedAliases: normalizedSearch },
              { searchTokens: { $all: searchTokens } },
            ],
          }
        : {}),
    };
    const filters = {
      ...baseFilters,
      ...(addressRegex && !radius && !hasCoordinates
        ? {
            $and: [
              {
                ...(addressTokens.length
                  ? { locationTokens: { $all: addressTokens } }
                  : { address: { $regex: addressRegex, $options: "i" } }),
              },
            ],
          }
        : {}),
    };

    let center = null;
    if (hasCoordinates) {
      center = { lat: Number(lat), lng: Number(lng) };
    } else if (address.trim() && radius) {
      center = await geocodeChurchAddress(address.trim().slice(0, 300));
      if (!center) {
        return NextResponse.json(
          { message: "Adresse de recherche introuvable" },
          { status: 400 }
        );
      }
    }

    let churches = [];
    let total = 0;

    // Recherche par position (adresse + rayon ou géolocalisation)
    if (center) {
      const effectiveRadius = radius || 10;
      const coordinates = [center.lng, center.lat];
      [churches, total] = await Promise.all([
        Church.find({
          ...baseFilters,
          coordinates: {
            $near: {
              $geometry: {
                type: "Point",
                coordinates,
              },
              $maxDistance: effectiveRadius * 1000,
            },
          },
        })
          .select(PUBLIC_CHURCH_FIELDS)
          .skip((page - 1) * limit)
          .limit(limit)
          .lean(),
        Church.countDocuments({
          ...baseFilters,
          coordinates: {
            $geoWithin: {
              $centerSphere: [coordinates, effectiveRadius / 6378.1],
            },
          },
        }),
      ]);
    } else {
      // Recherche textuelle exacte dans l’annuaire.
      [churches, total] = await Promise.all([
        Church.find(filters)
          .select(PUBLIC_CHURCH_FIELDS)
          .sort({ name: 1 })
          .skip((page - 1) * limit)
          .limit(limit)
          .lean(),
        Church.countDocuments(filters),
      ]);
    }

    let suggestions = [];
    if (total === 0 && address.trim() && !center) {
      try {
        center = await geocodeChurchAddress(address.trim().slice(0, 300));
      } catch (error) {
        console.warn("Suggestion géographique indisponible :", error.message);
      }
    }

    if (total === 0 && center) {
      const suggestionRadius = Math.min(
        100,
        Math.max(radius ? radius * 3 : 30, 30)
      );
      suggestions = await Church.find({
        ...baseFilters,
        coordinates: {
          $near: {
            $geometry: {
              type: "Point",
              coordinates: [center.lng, center.lat],
            },
            $maxDistance: suggestionRadius * 1000,
          },
        },
      })
        .select(PUBLIC_CHURCH_FIELDS)
        .limit(4)
        .lean();
    }

    return NextResponse.json({
      churches,
      total,
      page,
      limit,
      totalPages: Math.max(1, Math.ceil(total / limit)),
      center,
      suggestions,
    });
  } catch (error) {
    console.error("❌ Erreur GET /api/churches :", error);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}



export async function POST(request) {
  try {
    await dbConnect();
    const limited = enforceRateLimit(request, {
      key: "church-submission",
      limit: 3,
      windowMs: 60 * 60 * 1000,
    });
    if (limited) return limited;
    const body = await request.json();

    const clean = (value, limit = 500) =>
      sanitizeHtml(String(value || ""), {
        allowedTags: [],
        allowedAttributes: {},
      })
        .trim()
        .slice(0, limit);

    const name = clean(body.name, 200);
    const address = clean(body.address, 500);
    const city = clean(body.city, 100);
    const postalCode = clean(body.postalCode, 20);
    const country = clean(body.country, 100);
    const email = clean(body.email, 254).toLowerCase();
    const phone = clean(body.phone, 30);
    const website = clean(body.website, 500);
    const tradition = CHURCH_TRADITIONS.includes(body.tradition)
      ? body.tradition
      : "Autre";
    const denomination = clean(body.denomination, 100);
    const serviceTimes = clean(body.serviceTimes, 500);
    const description = clean(body.description, 1500);
    const languages = Array.isArray(body.languages)
      ? body.languages.map((language) => clean(language, 50)).filter(Boolean).slice(0, 10)
      : clean(body.languages, 300)
          .split(",")
          .map((language) => language.trim())
          .filter(Boolean)
          .slice(0, 10);

    if (!name || !address) {
      return NextResponse.json({ message: "Nom ou adresse invalide" }, { status: 400 });
    }
    if (email && !isValidEmail(email)) {
      return NextResponse.json({ message: "Email invalide" }, { status: 400 });
    }

    const fullAddress = buildChurchFullAddress({ address, postalCode, city, country });
    const location = await geocodeChurchAddress(fullAddress);
    if (!location) {
      return NextResponse.json({ message: "Adresse introuvable. Veuillez vérifier." }, { status: 400 });
    }

    const newChurch = new Church({
      name,
      address,
      city,
      postalCode,
      country,
      email,
      phone,
      website,
      tradition,
      denomination,
      languages,
      serviceTimes,
      description,
      accessibility: body.accessibility === true,
      childrenWelcome: body.childrenWelcome === true,
      coordinates: {
        type: "Point",
        coordinates: [location.lng, location.lat], // GeoJSON: [longitude, latitude]
      },
      isValidated: false,
      status: "pending",
      submittedBy: "church",
    });

    await newChurch.save();

    return NextResponse.json({ message: "Église enregistrée avec succès !" }, { status: 201 });
  } catch (error) {
    console.error("Erreur POST /api/churches :", error);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}
