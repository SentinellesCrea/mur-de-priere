// /app/api/volunteers/reserve-prayer/route.js
import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import PrayerRequest from "@/models/PrayerRequest";
import { getToken } from "@/lib/auth";

export async function PUT(req) {
  try {
    await dbConnect();

    const volunteer = await getToken("volunteer", req);
    if (!volunteer) {
      return NextResponse.json({ message: "Non autorisé" }, { status: 401 });
    }

    const { id } = await req.json();
    if (!id) {
      return NextResponse.json({ message: "ID manquant" }, { status: 400 });
    }

    const updated = await PrayerRequest.findByIdAndUpdate(
      id,
      { assignedTo: volunteer._id },
      { new: true }
    );

    if (!updated) {
      return NextResponse.json({ message: "Demande non trouvée" }, { status: 404 });
    }

    return NextResponse.json({ message: "Réservée avec succès", prayer: updated });
  } catch (err) {
    console.error("❌ Erreur assignation bénévole :", err);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}
