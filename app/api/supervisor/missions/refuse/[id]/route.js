import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import PrayerRequest from "@/models/PrayerRequest";
import { requireAuth } from "@/lib/auth";

export async function PUT(req, { params }) {
  try {
    await dbConnect();

    // ✅ Vérification du rôle superviseur
    const supervisor = await requireAuth("supervisor", req);
    if (!supervisor) {
      return NextResponse.json({ message: "Accès réservé aux superviseurs" }, { status: 403 });
    }

    const { id } = params;
    if (!id) {
      return NextResponse.json({ message: "ID requis" }, { status: 400 });
    }

    const prayerRequest = await PrayerRequest.findById(id);
    if (!prayerRequest) {
      return NextResponse.json({ message: "Demande de prière introuvable" }, { status: 404 });
    }

    // ✅ Vérifie que la mission était bien réservée à ce superviseur
    if (!prayerRequest.reserveTo || prayerRequest.reserveTo.toString() !== supervisor._id.toString()) {
      return NextResponse.json({ message: "Cette prière n'est pas réservée pour vous" }, { status: 403 });
    }

    // ✅ Libération de la mission
    prayerRequest.reserveTo = null;
    await prayerRequest.save();

    return NextResponse.json({ message: "Mission refusée avec succès" }, { status: 200 });

  } catch (error) {
    console.error("❌ Erreur dans PUT /supervisor/missions/refuse/[id] :", error);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}
