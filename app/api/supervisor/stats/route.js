import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Volunteer from "@/models/Volunteer";
import PrayerRequest from "@/models/PrayerRequest";
import { getToken } from "@/lib/auth"; // ⚠️ assure-toi que getToken() récupère le superviseur

export async function GET() {
  try {
    await dbConnect();

    const supervisor = await getToken();
    if (!supervisor || supervisor.role !== "supervisor") {
      return NextResponse.json({ message: "Non autorisé" }, { status: 403 });
    }

    // Bénévoles disponibles
    const availableVolunteers = await Volunteer.countDocuments({
      isValidated: true,
      isAvailable: true,
    });

    // Prières à attribuer (non encore assignées ou réservées)
    const assignablePrayers = await PrayerRequest.countDocuments({
      assignedTo: null,
      reserveTo: null,
    });

    // Bénévoles en attente de validation
    const pendingVolunteers = await Volunteer.countDocuments({
      isValidated: false,
    });

    // Personnes à contacter (reservées au superviseur)
    const contactsToMake = await PrayerRequest.countDocuments({
      reserveTo: supervisor._id,
    });

    return NextResponse.json({
      availableVolunteers,
      assignablePrayers,
      pendingVolunteers,
      contactsToMake,
    });
  } catch (error) {
    console.error("❌ Erreur /supervisor/stats :", error.message);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}
