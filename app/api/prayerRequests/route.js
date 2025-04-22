import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import PrayerRequest from "@/models/PrayerRequest";
import sendNotification from "@/lib/sendNotification";
import { Filter } from "bad-words";  // Importation de la bibliothèque bad-words
import badWords from "@/data/badWordsList";

const filter = new Filter();  // Initialisation du filtre

const containsBadWords = (text) => {
  const normalizedText = text
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // Supprimer les accents
    .replace(/\s+/g, " "); // Normaliser les espaces

  // Vérification avec expression régulière pour un mot entier
  for (let word of badWords) {
    const regex = new RegExp(`\\b${word}\\b`, 'i');  // Utilisation des bornes de mot pour ne pas détecter les sous-mots
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
    console.log("Body reçu :", body);  // Ajoute ceci pour vérifier les données reçues

    // Validation minimale
    if (!body.name || !body.prayerRequest || !body.category) {
      console.log("Champs requis manquants !");
      return NextResponse.json({ message: "Champs requis manquants" }, { status: 400 });
    }

    // Vérification du langage vulgaire
    if (containsBadWords(body.prayerRequest)) {
      console.log("Langage inapproprié détecté dans la prière");
      return NextResponse.json(
        { message: "La demande contient un langage inapproprié, merci de la corriger." },
        { status: 400 }
      );
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
