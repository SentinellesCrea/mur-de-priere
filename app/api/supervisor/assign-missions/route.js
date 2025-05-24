import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import PrayerRequest from "@/models/PrayerRequest";
import Volunteer from "@/models/Volunteer";
import { getToken } from "@/lib/auth";

export async function PUT(req, { params }) {
  try {
    await dbConnect();

    // ✅ Vérifie que c’est un superviseur
    const supervisor = await getToken("supervisor", req);
    if (!supervisor) {
      return NextResponse.json({ message: "Accès non autorisé" }, { status: 401 });
    }

    const { id } = params;
    if (!id) {
      return NextResponse.json({ message: "ID de prière requis" }, { status: 400 });
    }

    // ✅ Récupère l'ID du bénévole ciblé dans le body
    const { volunteerId } = await req.json();
    if (!volunteerId) {
      return NextResponse.json({ message: "ID du bénévole requis" }, { status: 400 });
    }

    // ✅ Vérifie que le bénévole existe et est validé
    const volunteer = await Volunteer.findById(volunteerId);
    if (!volunteer || !volunteer.isValidated) {
      return NextResponse.json({ message: "Bénévole invalide ou introuvable" }, { status: 404 });
    }

    // ✅ Assigne la prière
    const prayer = await PrayerRequest.findByIdAndUpdate(
      id,
      { assignedTo: volunteer._id },
      { new: true }
    );

    if (!prayer) {
      return NextResponse.json({ message: "Prière introuvable" }, { status: 404 });
    }

    return NextResponse.json({ message: "Mission assignée avec succès", prayer });

  } catch (error) {
    console.error("❌ Erreur API assignation superviseur :", error);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}
