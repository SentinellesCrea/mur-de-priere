import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import PrayerRequest from "@/models/PrayerRequest";
import { getToken } from "@/lib/auth";

export async function GET() {
  try {
    // Connexion à MongoDB
    await dbConnect();

    // Récupérer le bénévole connecté via le cookie sécurisé
    const volunteer = await getToken("volunteer");
    if (!volunteer) {
      return NextResponse.json({ message: "Non autorisé" }, { status: 401 });
    }

    // Chercher les missions terminées par ce bénévole
    const completedMissions = await PrayerRequest.find({
      finishedBy: volunteer._id,
      isAnswered: true,
    });

    // Renvoyer un tableau vide si aucune mission trouvée
    return NextResponse.json(completedMissions, { status: 200 });
  } catch (error) {
    console.error("Erreur GET /api/volunteers/completedMissions:", error);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}
