import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import PrayerRequest from "@/models/PrayerRequest";
import { getToken } from "@/lib/auth";

export async function GET(req) {
  try {
    await dbConnect();

    const supervisor = await getToken("supervisor", req);
    if (!supervisor) {
      return NextResponse.json({ message: "Accès non autorisé" }, { status: 401 });
    }

    const prayers = await PrayerRequest.find({ assignedTo: null }).sort({ datePublication: -1 });
    return NextResponse.json(prayers, { status: 200 });

  } catch (error) {
    console.error("❌ Erreur GET /api/supervisor/prayers :", error.message);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}
