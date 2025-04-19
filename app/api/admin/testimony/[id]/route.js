// 🔒 /api/admin/testimony/[id]
import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Testimony from "@/models/Testimony";
import { getToken } from "@/lib/auth";

export const DELETE = async (req, context) => {
  try {
    await dbConnect();

    // Vérification du token admin
    const admin = await getToken("admin", req);
    if (!admin) {
      return NextResponse.json({ message: "Non autorisé" }, { status: 401 });
    }

    // Récupérer l'ID de l'URL dynamique
    const { id } = context.params; // Utiliser `context.params` pour obtenir l'ID de manière asynchrone

    // Supprimer le témoignage par son ID
    const deleted = await Testimony.findByIdAndDelete(id);

    if (!deleted) {
      return NextResponse.json({ message: "Témoignage introuvable" }, { status: 404 });
    }

    return NextResponse.json({ message: "Témoignage supprimé" }, { status: 200 });
  } catch (err) {
    console.error("Erreur DELETE témoignage :", err);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
};
