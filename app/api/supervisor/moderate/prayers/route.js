import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import PrayerRequest from "@/models/PrayerRequest";
import { getToken } from "@/lib/auth";

export async function GET() {
  try {
    await dbConnect();
    const user = await getToken("supervisor");
    if (!user) return NextResponse.json({ message: "Non autorisé" }, { status: 401 });

    const prayers = await PrayerRequest.find({ isModerated: false });
    return NextResponse.json(prayers);
  } catch (error) {
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}
