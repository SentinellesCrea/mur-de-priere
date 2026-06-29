import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import { requireAuth } from "@/lib/auth";
import PrayerRequest from "@/models/PrayerRequest";

export async function GET(req) {
  try {
    await dbConnect();

    // ✅ Récupère et vérifie le token depuis les headers
    const supervisor = await requireAuth("supervisor", req);
    if (!supervisor) {
      return NextResponse.json({ message: "Accès réservé aux superviseurs" }, { status: 403 });
    }

    const supervisorId = supervisor._id;

    // ✅ Le superviseur ne voit ici que les missions reçues de l'admin.
    const missions = await PrayerRequest.find({
      assignedTo: supervisorId,
      $or: [
        { assignedByRole: "admin" },
        { assignedByRole: { $exists: false }, isAssigned: false },
      ],
      isAnswered: false,
      rejectedAt: { $exists: false },
    }).sort({ createdAt: -1 });

    return NextResponse.json(missions, { status: 200 });

  } catch (error) {
    console.error("❌ Erreur dans GET /api/supervisor/missions :", error);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}
