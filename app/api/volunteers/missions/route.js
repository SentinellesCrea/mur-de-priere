import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import { getToken } from "@/lib/auth";
import PrayerRequest from "@/models/PrayerRequest"; // ou Mission si tu utilises une autre collection

export async function GET(req) {
  await dbConnect();

  const volunteer = await getToken("volunteer", req); // ✅ NE PAS oublier req ici

  if (!volunteer) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }

  // 👉 C'est cette ligne :
  const missions = await PrayerRequest.find({ assignedTo: volunteer._id, isAssigned: true }).sort({ createdAt: -1 });

  return NextResponse.json(missions); // ✅ Assure-toi de renvoyer un tableau ici
}

