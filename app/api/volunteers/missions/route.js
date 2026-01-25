import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import { requireAuth } from "@/lib/auth";
import PrayerRequest from "@/models/PrayerRequest";

export async function GET(req) {
  try {
    await dbConnect();

    const volunteer = await requireAuth("volunteer", req);
    if (!volunteer) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    const volunteerId = volunteer._id;

    const missions = await PrayerRequest.find({
      $or: [
        { reserveTo: volunteerId },
        { assignedTo: volunteerId, isAssigned: true }
      ],
      isAnswered: false,

    }).sort({ createdAt: -1 });

    return NextResponse.json(missions, { status: 200 });
  } catch (error) {
    console.error("Erreur dans GET /api/volunteers/missions:", error);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}
