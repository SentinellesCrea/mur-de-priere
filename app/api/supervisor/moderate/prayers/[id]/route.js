import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import PrayerRequest from "@/models/PrayerRequest";
import { getToken } from "@/lib/auth";

export async function PUT(_, { params }) {
  try {
    await dbConnect();
    const user = await getToken("supervisor");
    if (!user) return NextResponse.json({ message: "Non autorisé" }, { status: 401 });

    await PrayerRequest.findByIdAndUpdate(params.id, { isModerated: true });
    return NextResponse.json({ message: "Prière validée" });
  } catch (error) {
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}
