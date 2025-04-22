// app/api/volunteers/updateAvailability/route.js

import { getToken } from "@/lib/auth";  // Importation de la fonction getToken
import dbConnect from "@/lib/dbConnect";
import Volunteer from "@/models/Volunteer";

export async function PUT(req) {
  try {
    // Assurer la connexion à la base de données
    await dbConnect();

    // Récupérer le bénévole avec son token via la fonction getToken()
    const volunteer = await getToken("volunteer", req);

    if (!volunteer) {
      return new Response(JSON.stringify({ message: "Bénévole introuvable" }), { status: 404 });
    }

    // Extraire les données du corps de la requête (état de la disponibilité)
    const { isAvailable } = await req.json();

    // Mettre à jour la disponibilité du bénévole
    const updatedVolunteer = await Volunteer.findByIdAndUpdate(
      volunteer._id,
      { isAvailable },
      { new: true }
    );

    if (!updatedVolunteer) {
      return new Response(JSON.stringify({ message: "Erreur lors de la mise à jour de la disponibilité" }), { status: 500 });
    }

    // Renvoyer la réponse avec l'état mis à jour
    return new Response(JSON.stringify(updatedVolunteer), { status: 200 });
  } catch (error) {
    console.error("Erreur lors de la mise à jour de la disponibilité:", error);
    return new Response(JSON.stringify({ message: "Erreur lors de la mise à jour de la disponibilité" }), { status: 500 });
  }
}
