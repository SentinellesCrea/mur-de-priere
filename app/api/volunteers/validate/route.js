import { NextResponse } from "next/server";
import Volunteer from "@/models/Volunteer";
import dbConnect from "@/lib/dbConnect";
import { getToken } from "@/lib/auth";

export async function POST(req) {
  try {
    await dbConnect();

    // 🔐 Vérifier que c’est bien un admin qui effectue l’action
    const admin = await getToken("admin", req);
    if (!admin) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { volunteerId } = await req.json();

    if (!volunteerId) {
      return NextResponse.json({ error: "ID du bénévole manquant" }, { status: 400 });
    }

    // ✅ Mise à jour du statut
    const updatedVolunteer = await Volunteer.findByIdAndUpdate(
      volunteerId,
      { isValidated: true },
      { new: true }
    );

    if (!updatedVolunteer) {
      return NextResponse.json({ error: "Bénévole non trouvé" }, { status: 404 });
    }

    return NextResponse.json({ message: "Bénévole validé avec succès" }, { status: 200 });

  } catch (error) {
    console.error("❌ Erreur serveur validation bénévole :", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
