// /app/api/volunteers/mark-prayer-done/route.js

import { NextResponse } from 'next/server';
import dbConnect from "@/lib/dbConnect";
import PrayerRequest from "@/models/PrayerRequest";
import { getToken } from "@/lib/auth";

export async function PUT(req) {
  try {
    await dbConnect();

    const supervisor = await getToken("supervisor");
    if (!supervisor) {
      return NextResponse.json({ message: "Non autorisé" }, { status: 401 });
    }

    const { prayerRequestId } = await req.json(); // On récupère seulement l'ID de la prière

    const prayerRequest = await PrayerRequest.findById(prayerRequestId);
    if (!prayerRequest) {
      return NextResponse.json({ message: "Prière non trouvée" }, { status: 404 });
    }

    // Marquer la prière comme terminée
    prayerRequest.finishedBy = supervisor._id;
    prayerRequest.isAnswered = true;
    await prayerRequest.save();

    return NextResponse.json({ message: "Prière marquée comme terminée", prayer: prayerRequest }, { status: 200 });
  } catch (error) {
    console.error("Erreur de mise à jour de la prière :", error);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}
