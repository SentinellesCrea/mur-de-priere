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
      { reserveTo: volunteer._id },
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

export async function GET(req) {
  await dbConnect();

  const volunteer = await getToken("volunteer", req); // ✅ NE PAS oublier req ici

  if (!volunteer) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }

  // 👉 C'est cette ligne :
  const missions = await PrayerRequest.find({ reserveTo: volunteer._id }).sort({ createdAt: -1 });

  return NextResponse.json(missions); // ✅ Assure-toi de renvoyer un tableau ici
}