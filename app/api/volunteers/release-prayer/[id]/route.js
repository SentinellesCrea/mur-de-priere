import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import { getToken } from "@/lib/auth";
import PrayerRequest from "@/models/PrayerRequest";

export async function PUT(req, { params }) {
  try {
    await dbConnect();
    const volunteer = await getToken("volunteer", req);

    if (!volunteer) {
      return NextResponse.json({ message: "Non autorisé" }, { status: 401 });
    }

    const prayerId = params.id;

    const prayer = await PrayerRequest.findById(prayerId);
    if (!prayer) {
      return NextResponse.json({ message: "Demande introuvable" }, { status: 404 });
    }

    const volunteerId = String(volunteer._id);
    const reserveToId = String(prayer.reserveTo || "");
    const assignedToId = String(prayer.assignedTo || "");

    // Vérifie si le bénévole a le droit de libérer
    const isOwner =
      volunteerId === reserveToId || volunteerId === assignedToId;

    if (!isOwner) {
      return NextResponse.json(
        { message: "Vous ne pouvez pas libérer cette prière" },
        { status: 403 }
      );
    }

    // Libère uniquement le bon champ
    if (volunteerId === reserveToId) {
      prayer.reserveTo = null;
    }

    if (volunteerId === assignedToId) {
      prayer.assignedTo = null;
    }

    await prayer.save();

    return NextResponse.json({ message: "Demande de prière libérée" });
  } catch (error) {
    console.error("Erreur release prayer:", error.message);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}
