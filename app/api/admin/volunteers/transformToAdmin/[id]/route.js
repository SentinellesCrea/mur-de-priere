// /app/api/admin/volunteer/transformToAdmin/[id].js
import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Volunteer from "@/models/Volunteer";
import { getToken } from "@/lib/auth";

export const PUT = async (req, { params }) => {
  try {
    await dbConnect();

    // Vérifier que l'admin est authentifié via le token
    const admin = await getToken("admin", req);
    if (!admin) {
      return NextResponse.json({ message: "Non autorisé" }, { status: 401 });
    }

    const { id } = params;  // L'ID du bénévole à transformer en admin

    // Trouver le bénévole par ID
    const volunteer = await Volunteer.findById(id);
    if (!volunteer) {
      return NextResponse.json({ message: "Bénévole introuvable" }, { status: 404 });
    }

    // Mettre à jour le rôle du bénévole pour en faire un admin
    volunteer.role = "admin";  // Changer le rôle en admin
    await volunteer.save();  // Sauvegarder les modifications

    return NextResponse.json({ message: "Bénévole transformé en admin", volunteer });
  } catch (err) {
    console.error("Erreur de transformation du bénévole en admin :", err);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
};
