import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import PrayerRequest from "@/models/PrayerRequest";
import { requireAuth } from "@/lib/auth";


// 🔍 GET — Récupérer les demandes de prière qui veulent un bénévole
export async function GET(req) {
  try {
    await dbConnect();
    const supervisor = await requireAuth("supervisor", req);
    if (!supervisor) {
      return NextResponse.json({ message: "Non autorisé" }, { status: 401 });
    }
    const requests = await PrayerRequest.find({
      wantsVolunteer: true,
      assignedTo: null,
      reserveTo: null,
      $and: [
        { $or: [{ isAnswered: false }, { isAnswered: { $exists: false } }] },
        { $or: [{ isModerated: true }, { isModerated: { $exists: false } }] },
        { $or: [{ rejectedAt: { $exists: false } }, { rejectedAt: null }] },
      ],
    })
      .select("name email phone prayerRequest category subcategory isUrgent datePublication")
      .sort({ datePublication: -1 });

    return NextResponse.json(requests);
  } catch (error) {
    console.error("❌ Erreur API /prayerRequests :", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
