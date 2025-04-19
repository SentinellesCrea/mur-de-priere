import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import PrayerRequest from "@/models/PrayerRequest";
import sendNotification from "@/lib/sendNotification";


// 🔍 GET — Récupérer toutes les demandes de prière
export async function GET() {
  try {
    await dbConnect();
    const requests = await PrayerRequest.find().sort({ datePublication: -1 });
    console.log("🔹 Données récupérées :", requests);
    return NextResponse.json(requests);
  } catch (error) {
    console.error("❌ Erreur API /prayerRequests :", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// ✨ POST — Créer une nouvelle demande de prière
export async function POST(req) {
  try {
    await dbConnect();
    const body = await req.json();

    // Validation minimale
    if (!body.name || !body.prayerRequest || !body.category) {
      return NextResponse.json({ message: "Champs requis manquants" }, { status: 400 });
    }

    const newRequest = new PrayerRequest(body);
    await newRequest.save();

    console.log("✅ Nouvelle demande enregistrée :", newRequest);
    return NextResponse.json({ message: "Demande de prière enregistrée !" }, { status: 201 });
  } catch (error) {
    console.error("❌ Erreur POST /prayerRequests :", error);
    return NextResponse.json({ message: "Erreur lors de l'enregistrement", error: error.message }, { status: 500 });
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

    // ✅ Incrémenter le nombre de priants
    prayer.nombrePriants = (prayer.nombrePriants || 0) + 1;
    await prayer.save();

    // ✅ Notifier si l'option est activée
    if (prayer.notify && prayer.email) {
      try {
        await sendNotification(prayer.email, prayer.name);
        console.log(`📧 Email de notification envoyé à ${prayer.email}`);
      } catch (err) {
        console.error("❌ Erreur d'envoi d'email :", err);
      }
    }

    return NextResponse.json({
      message: "Mise à jour réussie",
      nombrePriants: prayer.nombrePriants,
    });
  } catch (error) {
    console.error("❌ Erreur PUT /prayerRequests :", error);
    return NextResponse.json({ message: "Erreur serveur", error: error.message }, { status: 500 });
  }
}
