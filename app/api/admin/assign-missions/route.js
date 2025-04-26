import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import PrayerRequest from "@/models/PrayerRequest";
import { getToken } from "@/lib/auth"; // Sécurisé pour vérifier que c'est bien un admin

export async function PUT(req) {
  try {
    await dbConnect();

    const admin = await getToken("admin"); // ✅ Vérification du rôle admin
    if (!admin) {
      return NextResponse.json({ message: "Non autorisé" }, { status: 401 });
    }

    const { volunteerId, prayerRequestIds } = await req.json();

    if (!volunteerId || !Array.isArray(prayerRequestIds) || prayerRequestIds.length === 0) {
      return NextResponse.json({ message: "Volunteer ID et prayerRequestIds sont requis" }, { status: 400 });
    }

    // Mise à jour des prières assignées au bénévole (sans confirmer la prise en charge)
    const result = await PrayerRequest.updateMany(
      { _id: { $in: prayerRequestIds } },
      {
        assignedTo: volunteerId,
        isAssigned: false, // ❌ pas encore accepté par le bénévole
      }
    );

    return NextResponse.json(
      { message: "Missions attribuées (en attente d'acceptation)", updatedCount: result.modifiedCount },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erreur assignation de missions par l'admin :", error);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}


export async function GET() {
  try {
    await dbConnect();

    const admin = await getToken("admin");
    if (!admin) {
      return NextResponse.json({ message: "Non autorisé" }, { status: 401 });
    }

    // Rechercher toutes les prières libres
    const availablePrayerRequests = await PrayerRequest.find({
      assignedTo: null,
      reserveTo: null,
      wantsVolunteer: true,
    }).sort({ datePublication: -1 }); // Facultatif ➔ pour trier les plus récentes en premier

    return NextResponse.json(availablePrayerRequests, { status: 200 });
  } catch (error) {
    console.error("Erreur GET /admin/assign-missions :", error);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}
