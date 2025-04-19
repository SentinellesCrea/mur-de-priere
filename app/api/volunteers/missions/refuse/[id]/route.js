import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import PrayerRequest from "@/models/PrayerRequest";
import { getToken } from "@/lib/auth";

export async function PUT(req, { params }) {
  await dbConnect();

  const volunteer = await getToken("volunteer", req);
  if (!volunteer) {
    return NextResponse.json({ message: "Non autorisé" }, { status: 401 });
  }

  const { id } = params;
  if (!id) return NextResponse.json({ message: "ID manquant" }, { status: 400 });

  try {
    const updated = await PrayerRequest.findByIdAndUpdate(
      id,
      { assignedTo: null, isAssigned: false },
      { new: true }
    );

    if (!updated) {
      return NextResponse.json({ message: "Demande non trouvée" }, { status: 404 });
    }

    return NextResponse.json({ message: "Mission refusée avec succès" });
  } catch (error) {
    console.error("❌ Refus mission :", error);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}
