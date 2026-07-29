import { NextResponse } from "next/server";
import mongoose from "mongoose";
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

function clean(value, limit = 500) {
  return sanitizeHtml(String(value || ""), {
    allowedTags: [],
    allowedAttributes: {},
  })
    .trim()
    .slice(0, limit);
}

export async function PUT(req, { params }) {
  try {
    await dbConnect();
    const admin = await requireAuth("admin", req);
    if (!admin) return NextResponse.json({ message: "Non autorisé" }, { status: 401 });

    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ message: "ID invalide" }, { status: 400 });
    }

    const church = await Church.findById(id);
    if (!church) return NextResponse.json({ message: "Église introuvable" }, { status: 404 });

    const body = await req.json();
    const { action } = body;

    if (action === "validate") {
      church.isValidated = true;
      church.status = "validated";
      church.validatedAt = new Date();
      church.validatedBy = admin._id;
      church.rejectedAt = undefined;
      church.archivedAt = undefined;
      church.disabledAt = undefined;
    } else if (action === "reject") {
      church.isValidated = false;
      church.status = "rejected";
      church.rejectedAt = new Date();
    } else if (action === "archive") {
      church.isValidated = false;
      church.status = "archived";
      church.archivedAt = new Date();
    } else if (action === "disable") {
      church.isValidated = false;
      church.status = "disabled";
      church.disabledAt = new Date();
    } else if (action === "activate") {
      church.isValidated = true;
      church.status = "validated";
      church.disabledAt = undefined;
      church.archivedAt = undefined;
      church.rejectedAt = undefined;
      church.validatedAt = new Date();
      church.validatedBy = admin._id;
    } else if (action === "restore") {
      church.isValidated = true;
      church.status = "validated";
      church.archivedAt = undefined;
      church.rejectedAt = undefined;
      church.disabledAt = undefined;
      church.validatedAt = new Date();
      church.validatedBy = admin._id;
    } else if (action === "update") {
      const previousAddress = buildChurchFullAddress(church);
      const languages = Array.isArray(body.languages)
        ? body.languages
        : String(body.languages || "").split(",");

      church.name = clean(body.name, 200);
      church.address = clean(body.address, 500);
      church.city = clean(body.city, 100);
      church.postalCode = clean(body.postalCode, 20);
      church.country = clean(body.country, 100);
      church.email = clean(body.email, 254).toLowerCase();
      church.phone = clean(body.phone, 30);
      church.website = clean(body.website, 500);
      church.tradition = CHURCH_TRADITIONS.includes(body.tradition)
        ? body.tradition
        : "Autre";
      church.denomination = clean(body.denomination, 100);
      church.languages = languages.map((item) => clean(item, 50)).filter(Boolean).slice(0, 10);
      church.serviceTimes = clean(body.serviceTimes, 500);
      church.description = clean(body.description, 1500);
      church.accessibility = body.accessibility === true;
      church.childrenWelcome = body.childrenWelcome === true;

      if (!church.name || !church.address) {
        return NextResponse.json({ message: "Nom et adresse requis" }, { status: 400 });
      }
      if (church.email && !isValidEmail(church.email)) {
        return NextResponse.json({ message: "Email invalide" }, { status: 400 });
      }

      const nextAddress = buildChurchFullAddress(church);
      if (nextAddress !== previousAddress) {
        const location = await geocodeChurchAddress(nextAddress);
        if (!location) {
          return NextResponse.json({ message: "Adresse introuvable" }, { status: 400 });
        }
        church.coordinates = {
          type: "Point",
          coordinates: [location.lng, location.lat],
        };
      }
    } else {
      return NextResponse.json({ message: "Action inconnue" }, { status: 400 });
    }

    await church.save();
    return NextResponse.json(church);
  } catch (error) {
    console.error("Erreur PUT /admin/churches/[id] :", error);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    await dbConnect();
    const admin = await requireAuth("admin", req);
    if (!admin) return NextResponse.json({ message: "Non autorisé" }, { status: 401 });

    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ message: "ID invalide" }, { status: 400 });
    }

    const church = await Church.findByIdAndDelete(id);
    if (!church) return NextResponse.json({ message: "Église introuvable" }, { status: 404 });

    return NextResponse.json({ message: "Église supprimée" });
  } catch (error) {
    console.error("Erreur DELETE /admin/churches/[id] :", error);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}
