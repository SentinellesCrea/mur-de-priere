import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Testimony from "@/models/Testimony";
import { moderateText } from "@/lib/moderation";

export async function POST(req) {
  await dbConnect();

  try {
    const { firstName, testimony } = await req.json();

    /* ================= VALIDATION BASIQUE ================= */
    if (
      !firstName ||
      !testimony ||
      firstName.trim() === "" ||
      testimony.trim() === ""
    ) {
      return NextResponse.json(
        { message: "Champs requis manquants ou vides" },
        { status: 400 }
      );
    }

    /* ================= MODÉRATION IA ================= */
    const moderation = await moderateText(testimony);

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
      firstName,
      testimony,
      date: new Date(),
      isNewTestimony: true,

      // 🔍 À revoir si modération absente OU signal faible
      needsReview:
        moderation.rateLimited ||
        (moderation.flagged && testimony.length > 120),
    });

    await newTestimony.save();

    return NextResponse.json(newTestimony, { status: 201 });
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
    const testimonies = await Testimony.find({})
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
