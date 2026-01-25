// app/api/volunteers/reserved-prayers-count/route.js

import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import PrayerRequest from "@/models/PrayerRequest";
import { requireAuth } from "@/lib/auth";

export async function GET(req) {
  try {
    await dbConnect();

    // Récupérer le bénévole connecté via cookie
    const volunteer = await requireAuth("volunteer", req);
    if (!volunteer) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    // Compter les prières réservées à ce bénévole
    const reservedCount = await PrayerRequest.countDocuments({
      $or: [
        { reserveTo: volunteer._id },
        { assignedTo: volunteer._id, isAssigned: true }
      ],
      isAnswered: false, // On compte seulement celles qui ne sont pas encore terminées
    });

    return NextResponse.json({ reservedCount }, { status: 200 });
  } catch (error) {
    console.error("Erreur GET /reserved-prayers-count:", error);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}
