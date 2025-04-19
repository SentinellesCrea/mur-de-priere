import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import PrayerRequest from "@/models/PrayerRequest";
import { getToken } from "@/lib/auth";

export async function DELETE(req) {
  try {
    // Connexion à la base de données
    await dbConnect();

    // Récupérer le token de l'admin à partir des cookies
    const admin = await getToken("admin", req); // Vérifier que l'utilisateur est un admin
    if (!admin) {
      return NextResponse.json({ message: "Non autorisé" }, { status: 401 });
    }

    // Extraire l'ID de la requête
    const url = new URL(req.url);
    const id = url.pathname.split("/").pop(); // Extraction de l'ID depuis l'URL

    // Supprimer la demande de prière en fonction de l'ID
    const deleted = await PrayerRequest.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json({ message: "Demande non trouvée" }, { status: 404 });
    }

    // Réponse en cas de succès
    return NextResponse.json({ message: "Demande supprimée" }, { status: 200 });
  } catch (error) {
    console.error("Erreur DELETE /admin/prayer-request/[id]:", error);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}
