import dbConnect from "@/lib/dbConnect";
import PrayerRequest from "@/models/PrayerRequest";
import { getToken } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    await dbConnect();

    const admin = await getToken("admin", req);
    if (!admin) {
      return NextResponse.json({ message: "Non autorisé" }, { status: 401 });
    }

    const { requestId, volunteerId } = await req.json();

    if (!requestId || !volunteerId) {
      return NextResponse.json({ message: "Données manquantes" }, { status: 400 });
    }

    const updatedRequest = await PrayerRequest.findByIdAndUpdate(
      requestId,
      {
        assignedTo: volunteerId, // ✅ Correction ici
        isAssigned: true,        // ✅ on confirme que la mission est acceptée
      },
      { new: true }
    );

    if (!updatedRequest) {
      return NextResponse.json({ message: "Demande non trouvée" }, { status: 404 });
    }

    return NextResponse.json({
      message: "Demande assignée avec succès",
      request: updatedRequest,
    }, { status: 200 });
  } catch (error) {
    console.error("❌ Erreur assignation prière :", error);
    return NextResponse.json({ message: "Erreur serveur", error: error.message }, { status: 500 });
  }
}
