import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import { getToken } from "@/lib/auth";
import PrayerRequest from "@/models/PrayerRequest"; // ou Mission si tu utilises une autre collection

export async function GET() {
  try {
    await dbConnect();

    const volunteer = await getToken("volunteer");
    if (!volunteer) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }
    const missions = await PrayerRequest.find({
      $or: [
        { reserveTo: volunteer._id },
        { assignedTo: volunteer._id }
      ],
      isAnswered: false,
    }).sort({ createdAt: -1 });

    return NextResponse.json(missions, { status: 200 });
  } catch (error) {
    console.error("Erreur dans GET /api/volunteers/missions:", error);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}
