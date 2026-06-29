import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Volunteer from "@/models/Volunteer";
import PrayerRequest from "@/models/PrayerRequest";
import { requireAuth } from "@/lib/auth";

export async function GET(req) {
  try {
    await dbConnect();

    const supervisor = await requireAuth("supervisor", req);
    if (!supervisor) {
      return NextResponse.json({ message: "Non autorisé" }, { status: 403 });
    }

    // 🔹 Nombre de bénévoles validés et disponibles
    const availableVolunteers = await Volunteer.countDocuments({
      isValidated: true,
      isAvailable: true,
      role: "volunteer",
    });

    // 🔹 Nombre de prières libres
    const assignablePrayers = await PrayerRequest.countDocuments({
      wantsVolunteer: true,
      assignedTo: null,
      reserveTo: null,
      $and: [
        { $or: [{ isAnswered: false }, { isAnswered: { $exists: false } }] },
        { $or: [{ isModerated: true }, { isModerated: { $exists: false } }] },
        { $or: [{ rejectedAt: { $exists: false } }, { rejectedAt: null }] },
      ],
    });

    // 🔹 Nombre de bénévoles en attente de validation
    const pendingVolunteers = await Volunteer.countDocuments({
      isValidated: false,
      role: "volunteer",
    });

    // 🔹 Nombre de prières réservées au superviseur
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
    console.error("❌ Erreur dans GET /api/supervisor/stats :", error.message);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}
