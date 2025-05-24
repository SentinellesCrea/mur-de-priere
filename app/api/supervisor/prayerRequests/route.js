import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import PrayerRequest from "@/models/PrayerRequest";


// 🔍 GET — Récupérer les demandes de prière qui veulent un bénévole
export async function GET() {
  try {
    await dbConnect();
    const requests = await PrayerRequest.find({
      wantsVolunteer: true,
      assignedTo: null,
      reserveTo: null,
    }).sort({ datePublication: -1 });

    console.log("🔹 Données récupérées :", requests);
    return NextResponse.json(requests);
  } catch (error) {
    console.error("❌ Erreur API /prayerRequests :", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

