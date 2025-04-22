// app/api/volunteers/getAvailability/route.js

import { getToken } from "@/lib/auth";  // Utilisation de la fonction getToken
import dbConnect from "@/lib/dbConnect";
import Volunteer from "@/models/Volunteer";

export async function GET(req) {
  try {
    // Assurer la connexion à la base de données
    await dbConnect();

    // Récupérer le bénévole avec son token via la fonction getToken()
    const volunteer = await getToken("volunteer", req);

    if (!volunteer) {
      return new Response(JSON.stringify({ message: "Bénévole introuvable" }), { status: 404 });
    }

    // Trouver les informations du bénévole dans la base de données
    const volunteerData = await Volunteer.findById(volunteer._id);

    if (!volunteerData) {
      return new Response(JSON.stringify({ message: "Bénévole introuvable dans la base de données" }), { status: 404 });
    }

    // Retourner la disponibilité du bénévole
    return new Response(JSON.stringify({ isAvailable: volunteerData.isAvailable }), { status: 200 });
  } catch (error) {
    console.error("Erreur lors de la récupération de la disponibilité:", error);
    return new Response(JSON.stringify({ message: "Erreur lors de la récupération de la disponibilité" }), { status: 500 });
  }
}
