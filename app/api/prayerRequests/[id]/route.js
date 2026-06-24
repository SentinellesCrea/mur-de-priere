import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import PrayerRequest from "@/models/PrayerRequest";
import { cookies } from "next/headers";
import sanitizeHtml from "sanitize-html";
import { moderateText } from "@/lib/moderation";
import { deletePrayerById } from "@/lib/deletePrayer";

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

    if (prayer.authorToken !== token) {
      return NextResponse.json(
        { message: "Accès refusé" },
        { status: 403 }
      );
    }


    /* 🔒 Limite 48h */

    const now = new Date();
    const publishedAt = new Date(prayer.datePublication);

    const diffHours = (now - publishedAt) / (1000 * 60 * 60);

    if (diffHours > 48) {
      return NextResponse.json(
        { message: "Modification impossible après 48h." },
        { status: 403 }
      );
    }

    if (body.prayerRequest) {
      const safeText = sanitizeHtml(String(body.prayerRequest), {
        allowedTags: [],
        allowedAttributes: {},
      }).trim();
      if (!safeText || safeText.length > 5000) {
        return NextResponse.json({ message: "Texte invalide" }, { status: 400 });
      }
      const moderation = await moderateText(safeText);
      if (moderation.rateLimited || moderation.flagged) {
        return NextResponse.json({ message: "Modification soumise à vérification" }, { status: 400 });
      }
      prayer.prayerRequest = safeText;
    }
    prayer.category = body.category || prayer.category;
    prayer.subcategory = body.subcategory || prayer.subcategory;

    await prayer.save();

    return NextResponse.json({
      message: "Prière modifiée",
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

    await deletePrayerById(id);

    return NextResponse.json({
      message: "Prière supprimée",
    });

  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { message: "Erreur serveur" },
      { status: 500 }
    );
  }
}
