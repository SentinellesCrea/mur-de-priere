import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import PrayerRequest from "@/models/PrayerRequest";
import { cookies } from "next/headers";
import sanitizeHtml from "sanitize-html";
import { hasForbiddenModerationCategory, moderateText } from "@/lib/moderation";
import { containsProfanity } from "@/lib/profanityFilter";
import { isValidEmail } from "@/lib/apiSecurity";

const PRAYER_EDIT_WINDOW_MS = 48 * 60 * 60 * 1000;
const ALLOWED_CATEGORIES = new Set([
  "Famille",
  "Santé spirituelle",
  "Santé physique",
  "Relations",
  "Mariage",
  "Ministère",
  "Travail",
  "Finances",
  "Foi",
  "Autres",
]);

function isEditWindowExpired(prayer) {
  const publishedAt = new Date(prayer.datePublication).getTime();
  return !Number.isFinite(publishedAt) || Date.now() - publishedAt > PRAYER_EDIT_WINDOW_MS;
}

export async function PUT(req, { params }) {
  try {
    await dbConnect();

    const { id } = await params;
    const body = await req.json();

    const cookieStore = await cookies();
    const token =
      cookieStore.get(`prayerAuthorToken_${id}`)?.value ||
      cookieStore.get("prayerAuthorToken")?.value;

    if (!token) {
      return NextResponse.json(
        { message: "Non autorisé" },
        { status: 401 }
      );
    }

    const prayer = await PrayerRequest.findById(id).select("+authorToken");

    if (!prayer) {
      return NextResponse.json(
        { message: "Prière introuvable" },
        { status: 404 }
      );
    }

    if (prayer.deletedByAuthorAt) {
      return NextResponse.json(
        { message: "Cette prière a déjà été supprimée." },
        { status: 410 }
      );
    }

    if (prayer.authorToken !== token) {
      return NextResponse.json(
        { message: "Accès refusé" },
        { status: 403 }
      );
    }


    /* 🔒 Limite 48h */

    if (isEditWindowExpired(prayer)) {
      return NextResponse.json(
        { message: "Modification impossible après 48h." },
        { status: 403 }
      );
    }

    const safeName = sanitizeHtml(String(body.name || ""), {
      allowedTags: [],
      allowedAttributes: {},
    }).trim();
    const wantsVolunteer = body.wantsVolunteer === true;
    const notify = body.notify === true;
    const email =
      wantsVolunteer || notify
        ? String(body.email || "").trim().toLowerCase()
        : "";
    const phone = wantsVolunteer ? String(body.phone || "").trim().slice(0, 30) : "";

    if (!safeName || safeName.length > 100 || containsProfanity(safeName)) {
      return NextResponse.json({ message: "Nom invalide" }, { status: 400 });
    }
    if ((wantsVolunteer || notify) && !isValidEmail(email)) {
      return NextResponse.json({ message: "Email invalide" }, { status: 400 });
    }

    if (body.prayerRequest) {
      const safeText = sanitizeHtml(String(body.prayerRequest), {
        allowedTags: [],
        allowedAttributes: {},
      }).trim();
      if (!safeText || safeText.length > 5000) {
        return NextResponse.json({ message: "Texte invalide" }, { status: 400 });
      }
      if (containsProfanity(safeText)) {
        return NextResponse.json(
          { message: "Merci de reformuler votre demande sans grossièretés." },
          { status: 400 }
        );
      }
      const moderation = await moderateText(safeText);
      if (hasForbiddenModerationCategory(moderation)) {
        return NextResponse.json(
          { message: "La demande contient un contenu inapproprié." },
          { status: 400 }
        );
      }
      prayer.needsReview = moderation.rateLimited || moderation.flagged;
      prayer.isModerated = true;
      prayer.prayerRequest = safeText;
    }

    if (body.category && !ALLOWED_CATEGORIES.has(body.category)) {
      return NextResponse.json({ message: "Catégorie invalide" }, { status: 400 });
    }

    prayer.category = body.category || prayer.category;
    prayer.subcategory =
      body.subcategory !== undefined
        ? sanitizeHtml(String(body.subcategory), {
            allowedTags: [],
            allowedAttributes: {},
          }).trim().slice(0, 100)
        : prayer.subcategory;
    prayer.name = safeName;
    prayer.email = email;
    prayer.phone = phone;
    prayer.notify = notify;
    prayer.wantsVolunteer = wantsVolunteer;
    prayer.isUrgent = wantsVolunteer && body.isUrgent === true;
    prayer.allowComments = body.allowComments !== false;

    await prayer.save();

    return NextResponse.json({
      message: "Prière modifiée",
      prayer: {
        _id: prayer._id,
        prayerRequest: prayer.prayerRequest,
        name: prayer.name,
        category: prayer.category,
        subcategory: prayer.subcategory,
        allowComments: prayer.allowComments,
        canEdit: true,
        editExpiresAt: new Date(
          new Date(prayer.datePublication).getTime() + PRAYER_EDIT_WINDOW_MS
        ),
        editableData: {
          name: prayer.name,
          email: prayer.email || "",
          phone: prayer.phone || "",
          prayerRequest: prayer.prayerRequest,
          notify: prayer.notify,
          wantsVolunteer: prayer.wantsVolunteer,
          isUrgent: prayer.isUrgent,
          category: prayer.category,
          subcategory: prayer.subcategory || "",
          allowComments: prayer.allowComments,
        },
      },
    });

  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { message: "Erreur serveur" },
      { status: 500 }
    );
  }
}




export async function DELETE(req, { params }) {
  try {
    await dbConnect();

    const { id } = await params;

    const cookieStore = await cookies();
    const token =
      cookieStore.get(`prayerAuthorToken_${id}`)?.value ||
      cookieStore.get("prayerAuthorToken")?.value;

    const prayer = await PrayerRequest.findById(id).select("+authorToken");

    if (!prayer) {
      return NextResponse.json(
        { message: "Prière introuvable" },
        { status: 404 }
      );
    }

    if (prayer.authorToken !== token) {
      return NextResponse.json(
        { message: "Accès refusé" },
        { status: 403 }
      );
    }

    if (isEditWindowExpired(prayer)) {
      return NextResponse.json(
        { message: "Suppression impossible après 48h." },
        { status: 403 }
      );
    }

    prayer.deletedByAuthorAt = new Date();
    await prayer.save();

    return NextResponse.json({
      message: "Prière supprimée et archivée",
    });

  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { message: "Erreur serveur" },
      { status: 500 }
    );
  }
}
