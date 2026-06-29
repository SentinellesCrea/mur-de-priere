import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Volunteer from "@/models/Volunteer";
import User from "@/models/User";
import VolunteerProfile from "@/models/VolunteerProfile";
import { requireAuth } from "@/lib/auth";

async function updateAvailabilityForAccount(volunteer, isAvailable) {
  await Promise.all([
    Volunteer.findByIdAndUpdate(volunteer._id, { isAvailable }),
    volunteer.userId ? User.findByIdAndUpdate(volunteer.userId, { isAvailable }) : Promise.resolve(),
    volunteer.userId
      ? VolunteerProfile.findOneAndUpdate(
          { userId: volunteer.userId },
          { isAvailable },
          { upsert: true, new: true }
        )
      : Promise.resolve(),
  ]);
}

// ✅ Route PUT — mise à jour explicite
export async function PUT(request) {
  try {
    await dbConnect();

    const volunteer = await requireAuth("volunteer", request);
    if (!volunteer) {
      return NextResponse.json({ message: "Non autorisé" }, { status: 401 });
    }

    let body = {};
    try {
      body = await request.json();
    } catch (err) {
      console.error("❌ Erreur parsing JSON :", err);
      return NextResponse.json({ message: "Requête JSON invalide" }, { status: 400 });
    }

    const { isAvailable } = body;
    if (typeof isAvailable !== "boolean") {
      return NextResponse.json({ message: "`isAvailable` doit être un booléen" }, { status: 400 });
    }

    await updateAvailabilityForAccount(volunteer, isAvailable);

    return NextResponse.json({ message: "Disponibilité mise à jour avec succès." });
  } catch (error) {
    console.error("❌ Erreur update disponibilité:", error.message);
    return NextResponse.json({ message: "Erreur serveur interne" }, { status: 500 });
  }
}


// ✅ Route POST — désactivation automatique (ex : inactivité)
export async function POST(request) {
  try {
    await dbConnect();

    const volunteer = await requireAuth("volunteer", request);
    if (!volunteer) {
      return NextResponse.json({ message: "Non autorisé" }, { status: 401 });
    }

    await updateAvailabilityForAccount(volunteer, false);

    return NextResponse.json({ message: "Statut de disponibilité désactivé automatiquement." });
  } catch (error) {
    console.error("❌ Erreur auto-off disponibilité:", error.message);
    return NextResponse.json({ message: "Erreur serveur interne" }, { status: 500 });
  }
}
