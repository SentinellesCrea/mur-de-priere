import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import PrayerRequest from "@/models/PrayerRequest";
import { getToken } from "@/lib/auth";  // Utilisation de getToken pour récupérer l'ID du bénévole

export async function GET(req) {
  try {
    await dbConnect();  // Assure-toi que la connexion à la DB fonctionne

    // Récupérer le bénévole via le token
    const volunteer = await getToken("volunteer", req);
    console.log("Bénévole trouvé :", volunteer);  // Log pour vérifier le bénévole récupéré

    if (!volunteer) {
      return NextResponse.json({ message: "Non autorisé" }, { status: 401 });
    }

    // Rechercher les missions assignées au bénévole
    const missions = await PrayerRequest.find({ assignedTo: volunteer._id }).sort({ createdAt: -1 });
    console.log("Missions récupérées :", missions);  // Log pour vérifier les missions récupérées

    if (!missions || missions.length === 0) {
      return NextResponse.json({ message: "Aucune mission assignée" }, { status: 404 });
    }

    return NextResponse.json(missions);  // Retourner les missions trouvées avec un statut 200
  } catch (err) {
    console.error("Erreur lors de la récupération des missions assignées :", err);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });  // Utilisation de NextResponse pour l'erreur 500
  }
}

