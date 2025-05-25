import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import PrayerRequest from "@/models/PrayerRequest";
import sendNotification from "@/lib/sendNotification";
import sendVolunteerNotificationEmail from "@/lib/emails/sendVolunteerNotificationEmail";
import { Filter } from "bad-words";
import badWords from "@/data/badWordsList";

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
      return NextResponse.json({ message: "Champs requis manquants" }, { status: 400 });
    }

    if (containsBadWords(body.prayerRequest)) {
      return NextResponse.json(
        { message: "La demande contient un langage inapproprié, merci de la corriger." },
        { status: 400 }
      );
    }

    const newRequest = new PrayerRequest(body);
    await newRequest.save();

    // ✅ Envoi d’une notification si wantsVolunteer est coché
    if (newRequest.wantsVolunteer === true) {
      try {
        await sendVolunteerNotificationEmail({
          prenom: newRequest.nam || "Inconnu",
          email: newRequest.email || "",
          telephone: newRequest.phone || "",
          prayerRequest: newRequest.prayerRequest,
          isUrgent: newRequest.urgence || false,
        });
      } catch (err) {
        console.error("❌ Erreur notification bénévole :", err);
      }
    }

    return NextResponse.json({ message: "Demande de prière enregistrée" }, { status: 201 });
  } catch (error) {
    console.error("Erreur POST /prayerRequests :", error);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
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

    return NextResponse.json({ message: "Mise à jour réussie", nombrePriants: prayer.nombrePriants }, { status: 200 });
  } catch (error) {
    console.error("Erreur PUT /prayerRequests :", error);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}
