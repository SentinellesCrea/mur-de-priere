import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import PrayerRequest from "@/models/PrayerRequest";
import { getToken } from "@/lib/auth";

export async function PUT(req, { params }) {
  try {
    await dbConnect();

    const volunteer = await getToken("volunteer", req); // Vérifie que c'est bien un bénévole
    if (!volunteer) {
      return NextResponse.json({ message: "Non autorisé" }, { status: 401 });
    }

    const { id } = params;

    // Récupère la prière
    const prayerRequest = await PrayerRequest.findById(id);

    if (!prayerRequest) {
      return NextResponse.json({ message: "Demande de prière introuvable" }, { status: 404 });
    }

    // Vérifie que la prière est bien réservée au bénévole actuel
    if (!prayerRequest.reserveTo || prayerRequest.reserveTo.toString() !== volunteer._id.toString()) {
      return NextResponse.json({ message: "Cette prière n'est pas réservée pour vous" }, { status: 403 });
    }

    // Libère la réservation
    prayerRequest.reserveTo = null;
    await prayerRequest.save();

    return NextResponse.json({ message: "Mission refusée avec succès" }, { status: 200 });
  } catch (error) {
    console.error("❌ Erreur dans PUT /volunteers/missions/refuse/[id]:", error);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}
