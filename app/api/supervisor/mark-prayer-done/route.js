import { NextResponse } from 'next/server';
import dbConnect from "@/lib/dbConnect";
import PrayerRequest from "@/models/PrayerRequest";
import { requireAuth } from "@/lib/auth";

export async function PUT(req) {
  try {
    await dbConnect();

    // ✅ Lecture correcte du token depuis le header (req)
    const supervisor = await requireAuth("supervisor", req);
    if (!supervisor) {
      return NextResponse.json({ message: "Accès non autorisé" }, { status: 401 });
    }

    // ✅ Récupération de l’ID dans le body JSON
    const { prayerRequestId } = await req.json();
    if (!prayerRequestId) {
      return NextResponse.json({ message: "ID de prière manquant" }, { status: 400 });
    }

    // ✅ Le superviseur ne peut terminer qu'une prière qui lui est assignée/réservée
    const prayerRequest = await PrayerRequest.findOne({
      _id: prayerRequestId,
      $or: [{ assignedTo: supervisor._id }, { reserveTo: supervisor._id }],
      isAnswered: false,
    });
    if (!prayerRequest) {
      return NextResponse.json(
        { message: "Prière non attribuée au superviseur ou déjà terminée" },
        { status: 403 }
      );
    }

    // ✅ Mise à jour de la prière
    prayerRequest.finishedBy = supervisor._id;
    prayerRequest.isAnswered = true;
    await prayerRequest.save();

    return NextResponse.json({
      message: "Prière marquée comme terminée",
      prayer: prayerRequest
    }, { status: 200 });

  } catch (error) {
    console.error("❌ Erreur de mise à jour de la prière :", error);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}
