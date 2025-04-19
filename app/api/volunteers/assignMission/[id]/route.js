import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import PrayerRequest from "@/models/PrayerRequest";
import { getToken } from "@/lib/auth";

export async function POST(req, { params }) {
  await dbConnect();

  const admin = await getToken("admin", req);
  if (!admin) {
    return NextResponse.json({ message: "Non autorisé" }, { status: 401 });
  }

  const { id } = params;
  const { volunteerId } = await req.json();

  console.log("🔍 ID de la demande reçu :", id);
  console.log("👤 ID du bénévole reçu :", volunteerId);

  if (!id || !volunteerId) {
    console.error("⚠️ Données manquantes :", { id, volunteerId });
    return NextResponse.json({ message: "Données manquantes" }, { status: 400 });
  }

  const updatedRequest = await PrayerRequest.findByIdAndUpdate(
    id,
    {
      volunteerId,
      isAssigned: true,
    },
    { new: true }
  );

  if (!updatedRequest) {
    return NextResponse.json({ message: "Demande non trouvée" }, { status: 404 });
  }

  return NextResponse.json({
    message: "Demande de prière assignée avec succès",
    request: updatedRequest,
  });
}
