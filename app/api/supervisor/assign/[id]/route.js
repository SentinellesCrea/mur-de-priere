import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import PrayerRequest from "@/models/PrayerRequest";
import { getToken } from "@/lib/auth";

export async function PUT(_, { params }) {
  try {
    await dbConnect();
    const user = await getToken("supervisor");
    if (!user) return NextResponse.json({ message: "Non autorisé" }, { status: 401 });

    const prayer = await PrayerRequest.findByIdAndUpdate(params.id, { assignedTo: user._id }, { new: true });
    if (!prayer) return NextResponse.json({ message: "Prière introuvable" }, { status: 404 });

    return NextResponse.json({ message: "Mission assignée avec succès" });
  } catch (error) {
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}
