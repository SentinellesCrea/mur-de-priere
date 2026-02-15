import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import PrayerRequest from "@/models/PrayerRequest";
import sendNotification from "@/lib/sendNotification";
import { sendEmail } from "@/lib/sendEmail";
import nodemailer from "nodemailer";
import { moderateText } from "@/lib/moderation";
import crypto from "crypto";                 // ✅ AJOUT
import { cookies } from "next/headers";      // ✅ AJOUT




// 🔍 GET — Récupérer toutes les demandes de prière
export async function GET() {
  try {
    await dbConnect();
    const requests = await PrayerRequest.find().sort({ datePublication: -1 });
    return NextResponse.json(requests);
  } catch (error) {
    console.error("Erreur GET /prayerRequests :", error);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}



// ✨ POST — Créer une nouvelle demande de prière
export async function POST(req) {
  try {
    await dbConnect();
    const body = await req.json();

    if (!body.name || !body.prayerRequest || !body.category) {
      return NextResponse.json(
        { message: "Champs requis manquants" },
        { status: 400 }
      );
    }

    /* ================= MODÉRATION OPENAI ================= */
    const moderation = await moderateText(body.prayerRequest);

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
    const newRequest = new PrayerRequest({
      ...body,
      datePublication: new Date(),
      authorToken, // ✅ AJOUT

      needsReview:
        moderation.rateLimited ||
        (moderation.flagged && body.prayerRequest.length > 120),
    });

    await newRequest.save();

    /* ================= SET COOKIE ================= */
    cookies().set("prayerAuthorToken", authorToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30, // 30 jours
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
        <li><strong>Téléphone :</strong> ${newRequest.telephone || "Non renseigné"}</li>
        <li><strong>Catégorie :</strong> ${newRequest.category}</li>
        <li><strong>Sous-catégorie :</strong> ${newRequest.subcategory || "—"}</li>
        <li><strong>Urgence :</strong> ${newRequest.urgence ? "Oui" : "Non"}</li>
        <li><strong>Date :</strong> ${new Date(
          newRequest.datePublication
        ).toLocaleString("fr-FR")}</li>
      </ul>

      <p><strong>Texte de prière :</strong></p>
      <p>${newRequest.prayerRequest}</p>
    `;

    await sendEmail({
      to: "contact.murdepriere@gmail.com",
      subject,
      html,
    });

    return NextResponse.json(
      { message: "Demande de prière enregistrée" },
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



// 🙏 PUT — Incrémenter le nombre de priants
export async function PUT(req) {
  try {
    await dbConnect();
    const { id } = await req.json();

    if (!id) {
      return NextResponse.json({ message: "ID manquant" }, { status: 400 });
    }

    const prayer = await PrayerRequest.findById(id);
    if (!prayer) {
      return NextResponse.json({ message: "Demande non trouvée" }, { status: 404 });
    }

    prayer.nombrePriants = (prayer.nombrePriants || 0) + 1;
    await prayer.save();

    if (prayer.notify && prayer.email) {
      try {
        await sendNotification(prayer.email, prayer.name);
      } catch (err) {
        console.error("Erreur d'envoi de l'email :", err);
      }
    }

    return NextResponse.json(
      { message: "Mise à jour réussie", nombrePriants: prayer.nombrePriants },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erreur PUT /prayerRequests :", error);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}
