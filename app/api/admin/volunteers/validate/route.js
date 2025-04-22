// /app/api/admin/volunteers/validated.js
import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Volunteer from "@/models/Volunteer";
import { getToken } from "@/lib/auth";

export async function GET(req) {
  try {
    await dbConnect();

    // Vérifie que seul un admin peut effectuer cette action
    const admin = await getToken("admin", req);
    if (!admin) {
      return NextResponse.json({ message: "Non autorisé" }, { status: 401 });
    }

    // Récupérer tous les bénévoles validés
    const volunteers = await Volunteer.find({
      isValidated: true,
      status: "validated",
    });

    if (volunteers.length === 0) {
      return NextResponse.json({ message: "Aucun bénévole validé" }, { status: 404 });
    }

    return NextResponse.json(volunteers);  // Retourne les bénévoles validés
  } catch (err) {
    console.error("Erreur lors de la récupération des bénévoles :", err);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}
