// /app/api/volunteers/reservePrayer/route.js

import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import PrayerRequest from "@/models/PrayerRequest";
import { getToken } from "@/lib/auth";

// Réserver une prière pour un bénévole
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

    return NextResponse.json({ message: "Réservée avec succès", prayer: updated }, { status: 200 });
  } catch (err) {
    console.error("❌ Erreur PUT /reserve-prayer:", err);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}

// Récupérer les prières réservées par le bénévole connecté
export async function GET() {
  try {
    await dbConnect();

    const volunteer = await getToken();
    if (!volunteer) {
      return NextResponse.json({ message: "Non autorisé" }, { status: 401 });
    }

    const reservedPrayers = await PrayerRequest.find({ reserveTo: volunteer._id });

    return NextResponse.json(reservedPrayers, { status: 200 });
  } catch (error) {
    console.error("❌ Erreur GET /reserve-prayer:", error);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}
