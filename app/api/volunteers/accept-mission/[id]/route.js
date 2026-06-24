// /app/api/volunteers/accept-mission/[id]/route.js

import { NextResponse } from 'next/server';
import dbConnect from "@/lib/dbConnect";
import { requireAuth } from "@/lib/auth";
import PrayerRequest from "@/models/PrayerRequest";

export async function PUT(req, context) {
  try {
    await dbConnect();

    const { id } = await context.params;

    const volunteer = await requireAuth("volunteer", req);
    if (!volunteer) {
      return NextResponse.json({ message: "Non autorisé" }, { status: 401 });
    }

    const prayerRequest = await PrayerRequest.findById(id);
    if (!prayerRequest) {
      return NextResponse.json({ message: "Mission non trouvée" }, { status: 404 });
    }

    if (String(prayerRequest.assignedTo || "") !== String(volunteer._id)) {
      return NextResponse.json({ message: "Cette mission ne vous est pas attribuée" }, { status: 403 });
    }

    // Accepter la mission
    prayerRequest.isAssigned = true;
    await prayerRequest.save();

    return NextResponse.json({
      message: "Mission acceptée avec succès",
      prayerRequest,
    }, { status: 200 });

  } catch (error) {
    console.error("Erreur lors de l'acceptation de la mission :", error);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}
