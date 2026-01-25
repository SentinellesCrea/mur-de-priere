import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import PrayerRequest from "@/models/PrayerRequest";
import sendNotification from "@/lib/sendNotification";
import { sendEmail } from "@/lib/sendEmail";
import { Filter } from "bad-words";
import badWords from "@/data/badWordsList";
import nodemailer from "nodemailer"; // ✅ Ajout nécessaire

const filter = new Filter();

const containsBadWords = (text) => {
  const normalizedText = text
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ");

  for (let word of badWords) {
    const regex = new RegExp(`\\b${word}\\b`, 'i');
    if (regex.test(normalizedText)) {
      return true;
    }
  }
  return false;
};

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

    if (containsBadWords(body.prayerRequest)) {
      return NextResponse.json(
        { message: "La demande contient un langage inapproprié." },
        { status: 400 }
      );
    }

    const newRequest = new PrayerRequest(body);
    await newRequest.save();

    /* ============================================
       📩 EMAIL ADMIN — TOUJOURS ENVOYÉ
    ============================================ */

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
        <li><strong>Sous-catégorie :</strong> ${newRequest.subCategory || "—"}</li>
        <li><strong>Urgence :</strong> ${newRequest.urgence ? "Oui" : "Non"}</li>
        <li><strong>Date :</strong> ${new Date(
          newRequest.datePublication || newRequest.createdAt
        ).toLocaleString("fr-FR")}</li>
      </ul>

      <p><strong>Texte de prière :</strong></p>
      <p>${newRequest.prayerRequest}</p>
    `;

    await sendEmail({
      to: "sentinelles.crea@gmail.com",
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
          "Rassurez-vous, cela arrive parfois. Vous pouvez simplement réessayer en cliquant ci-dessous. Votre démarche compte beaucoup pour nous.",
        cta: {
          label: "Refaire une demande de prière",
          action: "retry",
        },
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
