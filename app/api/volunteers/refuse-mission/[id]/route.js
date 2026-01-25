// /app/api/volunteers/refuse-mission/[id]/route.js

import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import { requireAuth } from "@/lib/auth";
import PrayerRequest from "@/models/PrayerRequest";

export async function PUT(req, context) {
  try {
    await dbConnect();

    const { id } = await context.params;  // ID depuis l'URL

    const volunteer = await requireAuth("volunteer", req);
    if (!volunteer) {
      return NextResponse.json({ message: "Non autorisé" }, { status: 401 });
    }

    const prayerRequest = await PrayerRequest.findById(id);
    if (!prayerRequest) {
      return NextResponse.json({ message: "Mission non trouvée" }, { status: 404 });
    }

    // Si la mission n'est pas assignée, ou assignée à quelqu'un d'autre
    if (!prayerRequest.assignedTo || prayerRequest.assignedTo.toString() !== volunteer._id.toString()) {
      return NextResponse.json({ message: "Cette mission n'est pas assignée à vous" }, { status: 403 });
    }

    // Réinitialiser la mission
    prayerRequest.assignedTo = null;
    prayerRequest.isAssigned = false;
    await prayerRequest.save();

    return NextResponse.json({
      message: "Mission refusée avec succès",
      prayerRequest,
    }, { status: 200 });
  } catch (error) {
    console.error("Erreur lors du refus de la mission :", error);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}
