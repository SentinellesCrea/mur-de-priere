import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import PrayerRequest from "@/models/PrayerRequest";
import { requireAuth } from "@/lib/auth";

export async function GET(req) {
  try {
    await dbConnect();
    const volunteer = await requireAuth("volunteer", req);

    if (!volunteer || !volunteer._id) {
      return NextResponse.json({ message: "Non autorisé" }, { status: 401 });
    }

    const urgentCount = await PrayerRequest.countDocuments({
      wantsVolunteer: true,
      isUrgent: true,
      assignedTo: null,
      reserveTo: null,
      isAnswered: false,
      isModerated: { $ne: false },
      rejectedAt: { $exists: false },
    });

    return NextResponse.json({ urgentCount });
  } catch (error) {
    console.error("Erreur API /urgent-prayers-count:", error);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}
