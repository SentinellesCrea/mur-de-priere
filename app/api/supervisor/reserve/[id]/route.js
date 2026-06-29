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

    const { id } = await params;
    if (!id) {
      return NextResponse.json({ message: "ID requis" }, { status: 400 });
    }

    const prayer = await PrayerRequest.findOne({
      _id: id,
      wantsVolunteer: true,
      assignedTo: null,
      reserveTo: null,
      $and: [
        { $or: [{ isAnswered: false }, { isAnswered: { $exists: false } }] },
        { $or: [{ isModerated: true }, { isModerated: { $exists: false } }] },
        { $or: [{ rejectedAt: { $exists: false } }, { rejectedAt: null }] },
      ],
    });
    if (!prayer) {
      return NextResponse.json({ message: "Prière indisponible ou déjà assignée" }, { status: 404 });
    }

    prayer.assignedTo = user._id;
    prayer.isAssigned = true;
    prayer.assignedBy = user._id;
    prayer.assignedByRole = "supervisor";
    prayer.assignedAt = new Date();
    await prayer.save();

    return NextResponse.json({ message: "Prière assignée avec succès" }, { status: 200 });

  } catch (error) {
    console.error("❌ Erreur dans PUT /supervisor/assign/[id] :", error);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}
