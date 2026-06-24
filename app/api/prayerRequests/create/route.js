import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import PrayerRequest from "@/models/PrayerRequest";
import { sendEmail } from "@/lib/sendEmail";
import { moderateText } from "@/lib/moderation";
import crypto from "crypto";                 // ✅ AJOUT
import { cookies } from "next/headers";      // ✅ AJOUT
import sanitizeHtml from "sanitize-html";
import { enforceRateLimit, isValidEmail } from "@/lib/apiSecurity";




// ✨ POST — Créer une nouvelle demande de prière
export async function POST(req) {
  try {
    await dbConnect();
    const limited = enforceRateLimit(req, {
      key: "create-prayer",
      limit: 5,
      windowMs: 60 * 60 * 1000,
    });
    if (limited) return limited;

    const body = await req.json();

    if (!body.name || !body.prayerRequest || !body.category) {
      return NextResponse.json(
        { message: "Champs requis manquants" },
        { status: 400 }
      );
    }

    const allowedCategories = new Set([
      "Famille", "Santé spirituelle", "Santé physique", "Relations", "Mariage",
      "Ministère", "Travail", "Finances", "Foi", "Autres",
    ]);
    if (!allowedCategories.has(body.category)) {
      return NextResponse.json({ message: "Catégorie invalide" }, { status: 400 });
    }

    const name = sanitizeHtml(String(body.name), { allowedTags: [], allowedAttributes: {} }).trim();
    const prayerText = sanitizeHtml(String(body.prayerRequest), {
      allowedTags: [],
      allowedAttributes: {},
    }).trim();
    const email = body.email ? String(body.email).trim().toLowerCase() : undefined;
    const phone = body.phone ? String(body.phone).trim() : undefined;

    if (!name || !prayerText || name.length > 100 || prayerText.length > 5000) {
      return NextResponse.json({ message: "Données invalides" }, { status: 400 });
    }
    if (email && !isValidEmail(email)) {
      return NextResponse.json({ message: "Email invalide" }, { status: 400 });
    }

    /* ================= MODÉRATION OPENAI ================= */
    const moderation = await moderateText(prayerText);

    const forbiddenCategories = [
      "sexual",
      "sexual_minors",
      "hate",
      "hate_threatening",
      "violence",
      "violence_graphic",
    ];

    if (!moderation.rateLimited) {
      const hasForbiddenContent = forbiddenCategories.some(
        (category) => moderation.categories?.[category] === true
      );

      if (hasForbiddenContent) {
        return NextResponse.json(
          {
            message:
              "La demande contient un contenu inapproprié et ne peut pas être publiée.",
          },
          { status: 400 }
        );
      }
    }

    /* ================= GÉNÉRATION AUTHOR TOKEN ================= */
    const authorToken = crypto.randomBytes(32).toString("hex");

    /* ================= CRÉATION PRIÈRE ================= */
    const needsReview =
      moderation.rateLimited ||
      (moderation.flagged && prayerText.length > 120);

    const newRequest = new PrayerRequest({
      name,
      email,
      phone,
      prayerRequest: prayerText,
      notify: body.notify === true,
      wantsVolunteer: body.wantsVolunteer === true,
      isUrgent: body.isUrgent === true,
      category: body.category,
      subcategory: body.subcategory ? String(body.subcategory).slice(0, 100) : undefined,
      allowComments: body.allowComments !== false,
      datePublication: new Date(),
      authorToken,
      needsReview,
      isModerated: !needsReview,
    });

    await newRequest.save();

    /* ================= SET COOKIE ================= */
    const cookieStore = await cookies();

    cookieStore.set(`prayerAuthorToken_${newRequest._id}`, authorToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30,
      path: "/",
    });
    cookieStore.set("prayerVisitorToken", authorToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 365,
      path: "/",
    });

    /* ================= EMAIL ADMIN ================= */
    const needsVolunteer = newRequest.wantsVolunteer === true;

    const subject = needsVolunteer
      ? "📩 Demande de prière – suivi bénévole requis"
      : "🙏 Nouvelle demande de prière";

    const html = `
      <h2>Nouvelle demande de prière</h2>

      ${needsVolunteer ? `
        <p style="color:#b91c1c;"><strong>⚠️ Un bénévole est requis</strong></p>
      ` : ""}

      <ul>
        <li><strong>Nom :</strong> ${newRequest.name || "Anonyme"}</li>
        <li><strong>Email :</strong> ${newRequest.email || "Non renseigné"}</li>
        <li><strong>Téléphone :</strong> ${newRequest.phone || "Non renseigné"}</li>
        <li><strong>Catégorie :</strong> ${newRequest.category}</li>
        <li><strong>Sous-catégorie :</strong> ${newRequest.subcategory || "—"}</li>
        <li><strong>Urgence :</strong> ${newRequest.isUrgent ? "Oui" : "Non"}</li>
        <li><strong>Date :</strong> ${new Date(
          newRequest.datePublication
        ).toLocaleString("fr-FR")}</li>
      </ul>

      <p><strong>Texte de prière :</strong></p>
      <p>${prayerText}</p>
    `;

    try {
      await sendEmail({
        to: process.env.GMAIL_USER,
        subject,
        html,
      });
    } catch (emailError) {
      console.error("Erreur notification de nouvelle prière :", emailError.message);
    }

    return NextResponse.json(
      {
        message: needsReview
          ? "Demande reçue et en attente de vérification"
          : "Demande de prière enregistrée",
        _id: newRequest._id,
        name: newRequest.name,
        prayerRequest: newRequest.prayerRequest,
        category: newRequest.category,
        subcategory: newRequest.subcategory,
        datePublication: newRequest.datePublication,
        nombrePriants: 0,
        allowComments: newRequest.allowComments,
      },
      { status: 201 }
    );

  } catch (error) {
    console.error("Erreur POST /prayerRequests :", error);
    return NextResponse.json(
      {
        message: "Nous n’avons pas pu recevoir votre demande de prière 🙏",
        description:
          "Rassurez-vous, cela arrive parfois. Vous pouvez simplement réessayer.",
      },
      { status: 500 }
    );
  }
}
