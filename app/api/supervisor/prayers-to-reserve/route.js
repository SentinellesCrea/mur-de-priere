import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import PrayerRequest from "@/models/PrayerRequest";
import { getToken } from "@/lib/auth";

export async function GET(req) {
  try {
    await dbConnect();

    // ✅ Lecture correcte du token depuis les headers
    const supervisor = await getToken("supervisor", req);
    if (!supervisor) {
      return NextResponse.json({ message: "Accès réservé aux superviseurs" }, { status: 403 });
    }

    // ✅ Récupère les prières non assignées
    const prayers = await PrayerRequest.find({ assignedTo: null }).sort({ datePublication: -1 });

    return NextResponse.json(prayers, { status: 200 });

  } catch (error) {
    console.error("❌ Erreur dans GET /supervisor/prayers :", error);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}
