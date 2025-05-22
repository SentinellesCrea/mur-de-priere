import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import { getToken } from "@/lib/auth";
import PrayerRequest from "@/models/PrayerRequest";

export async function GET() {
  try {
    await dbConnect();

    const supervisor = await getToken("supervisor");
    if (!supervisor) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    const supervisorId = supervisor._id;

    const missions = await PrayerRequest.find({
      $or: [
        { reserveTo: supervisorId },
        { assignedTo: supervisorId, isAssigned: true }
      ],
      isAnswered: false,

    }).sort({ createdAt: -1 });

    return NextResponse.json(missions, { status: 200 });
  } catch (error) {
    console.error("Erreur dans GET /api/supervisor/missions:", error);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}
