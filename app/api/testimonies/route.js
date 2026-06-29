import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Testimony from "@/models/Testimony";
import { moderateText } from "@/lib/moderation";
import sanitizeHtml from "sanitize-html";
import { enforceRateLimit } from "@/lib/apiSecurity";

export async function POST(req) {
  await dbConnect();

  try {
    const limited = enforceRateLimit(req, {
      key: "create-testimony",
      limit: 5,
      windowMs: 60 * 60 * 1000,
    });
    if (limited) return limited;
    const { firstName, testimony } = await req.json();

    /* ================= VALIDATION BASIQUE ================= */
    if (
      typeof firstName !== "string" ||
      typeof testimony !== "string" ||
      firstName.trim() === "" ||
      testimony.trim() === ""
    ) {
      return NextResponse.json(
        { message: "Champs requis manquants ou vides" },
        { status: 400 }
      );
    }

    /* ================= MODÉRATION IA ================= */
    const safeFirstName = sanitizeHtml(firstName.trim(), {
      allowedTags: [],
      allowedAttributes: {},
    }).slice(0, 80);
    const safeTestimony = sanitizeHtml(testimony.trim(), {
      allowedTags: [],
      allowedAttributes: {},
    }).slice(0, 5000);
    const moderation = await moderateText(safeTestimony);

    const forbiddenCategories = [
      "sexual",
      "sexual_minors",
      "hate",
      "hate_threatening",
      "violence",
      "violence_graphic",
    ];

    // ⚠️ On vérifie UNIQUEMENT si la modération a bien eu lieu
    if (!moderation.rateLimited) {
      const hasForbiddenContent = forbiddenCategories.some(
        (category) => moderation.categories?.[category] === true
      );

      if (hasForbiddenContent) {
        return NextResponse.json(
          {
            message:
              "Le témoignage contient un contenu inapproprié et ne peut pas être publié.",
          },
          { status: 400 }
        );
      }
    }

    /* ================= CRÉATION DU TÉMOIGNAGE ================= */
    const newTestimony = new Testimony({
      firstName: safeFirstName,
      testimony: safeTestimony,
      date: new Date(),
      isNewTestimony: true,
      isModerate: false,

      // 🔍 À revoir si modération absente OU signal faible
      needsReview:
        moderation.rateLimited ||
        (moderation.flagged && safeTestimony.length > 120),
    });

    await newTestimony.save();

    return NextResponse.json(
      {
        message:
          "Merci pour votre témoignage. Il sera visible après validation.",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Erreur API testimonies :", error);
    return NextResponse.json(
      { message: "Erreur serveur" },
      { status: 500 }
    );
  }
}


/* ================= GET ================= */

export async function GET() {
  await dbConnect();

  try {
    const testimonies = await Testimony.find({ isModerate: true, isNewTestimony: false })
      .select("firstName testimony date likes createdAt")
      .sort({ date: -1 });

    return NextResponse.json(testimonies, { status: 200 });
  } catch (error) {
    console.error("Erreur API testimonies :", error);
    return NextResponse.json(
      { message: "Erreur serveur" },
      { status: 500 }
    );
  }
}
