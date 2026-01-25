import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import PrayerRequest from "@/models/PrayerRequest";
import { requireAuth } from "@/lib/auth";

export async function PUT(req, { params }) {
  try {
    await dbConnect();

    const user = await requireAuth("supervisor", req);
    if (!user) {
      return NextResponse.json({ message: "Non autorisé" }, { status: 401 });
    }

    const { id } = params;
    if (!id) {
      return NextResponse.json({ message: "ID requis" }, { status: 400 });
    }

    const prayer = await PrayerRequest.findById(id);
    if (!prayer) {
      return NextResponse.json({ message: "Prière introuvable" }, { status: 404 });
    }

    // ❌ Empêche une double assignation
    if (prayer.assignedTo) {
      return NextResponse.json({ message: "Prière déjà assignée" }, { status: 409 });
    }

    prayer.assignedTo = user._id;
    await prayer.save();

    return NextResponse.json({ message: "Prière assignée avec succès" }, { status: 200 });

  } catch (error) {
    console.error("❌ Erreur dans PUT /supervisor/assign/[id] :", error);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}
