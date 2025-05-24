import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Volunteer from "@/models/Volunteer";
import { getToken } from "@/lib/auth";

export async function GET(req) {
  try {
    await dbConnect();

    // ✅ Vérification du rôle superviseur avec cookie
    const supervisor = await getToken("supervisor", req);
    if (!supervisor) {
      return NextResponse.json({ message: "Accès non autorisé" }, { status: 401 });
    }

    // ✅ Récupération des bénévoles disponibles
    const volunteers = await Volunteer.find({
      isValidated: true,
      isAvailable: true,
      role: "volunteer",
    }).select("-password"); // ✅ sécurité supplémentaire : on exclut le mot de passe

    return NextResponse.json(volunteers, { status: 200 });

  } catch (error) {
    console.error("❌ Erreur récupération bénévoles :", error);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}
