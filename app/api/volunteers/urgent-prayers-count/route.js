import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import PrayerRequest from "@/models/PrayerRequest";
import { getToken } from "@/lib/auth";

export async function GET(req) {
  try {
    await dbConnect();
    const volunteer = await getToken("volunteer", req);

    if (!volunteer || !volunteer._id) {
      return NextResponse.json({ message: "Non autorisé" }, { status: 401 });
    }

    const urgentCount = await PrayerRequest.countDocuments({
      wantsVolunteer: true,
      urgence: true,
       // 🔥 Seules les urgentes disponibles
    });

    return NextResponse.json({ urgentCount });
  } catch (error) {
    console.error("Erreur API /urgent-prayers-count:", error);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}
