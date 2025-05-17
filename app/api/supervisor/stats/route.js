import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import { getToken } from "@/lib/auth";
import Volunteer from "@/models/Volunteer";
import PrayerRequest from "@/models/PrayerRequest";
import Testimony from "@/models/Testimony";

export async function GET() {
  try {
    await dbConnect();

    const user = await getToken("supervisor");
    if (!user) {
      return NextResponse.json({ message: "Non autorisé" }, { status: 401 });
    }

    // 🟢 Bénévoles disponibles
    const totalVolunteers = await Volunteer.countDocuments({
      isValidated: true,
      isAvailable: true,
    });

    // 📤 Prières à attribuer (non assignées)
    const totalMissions = await PrayerRequest.countDocuments({
      assignedTo: null,
      reserveTo: null,
    });

    // 🙏 Prières à modérer
    const pendingPrayers = await PrayerRequest.countDocuments({
      isModerated: false,
    });

    // 🗣️ Témoignages à modérer
    const pendingTestimonies = await Testimony.countDocuments({
      isModerated: false,
    });

    return NextResponse.json({
      totalVolunteers,
      totalMissions,
      pendingPrayers,
      pendingTestimonies,
    });
  } catch (error) {
    console.error("Erreur API /supervisor/stats :", error.message);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}
