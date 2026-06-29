import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import PrayerRequest from "@/models/PrayerRequest";
import Volunteer from "@/models/Volunteer";
import { requireAuth } from "@/lib/auth";

export async function PUT(req, { params }) {
  try {
    await dbConnect();

    const supervisor = await requireAuth("supervisor", req);
    if (!supervisor) {
      return NextResponse.json({ message: "Non autorisé" }, { status: 401 });
    }

    const { id } = await params;
    const { volunteerId } = await req.json();

    if (!id || !volunteerId) {
      return NextResponse.json({ message: "ID de prière et bénévole requis" }, { status: 400 });
    }

    const volunteer = await Volunteer.findOne({
      _id: volunteerId,
      role: "volunteer",
      isValidated: true,
      status: { $ne: "rejected" },
    });

    if (!volunteer) {
      return NextResponse.json({ message: "Bénévole introuvable ou non validé" }, { status: 404 });
    }

    const prayer = await PrayerRequest.findOneAndUpdate(
      {
        _id: id,
        wantsVolunteer: true,
        assignedTo: null,
        reserveTo: null,
        $and: [
          { $or: [{ isAnswered: false }, { isAnswered: { $exists: false } }] },
          { $or: [{ isModerated: true }, { isModerated: { $exists: false } }] },
          { $or: [{ rejectedAt: { $exists: false } }, { rejectedAt: null }] },
        ],
      },
      {
        assignedTo: volunteer._id,
        reserveTo: null,
        isAssigned: false,
        delegatedBySupervisor: supervisor._id,
        delegatedAt: new Date(),
        assignedBy: supervisor._id,
        assignedByRole: "supervisor",
        assignedAt: new Date(),
      },
      { new: true }
    );

    if (!prayer) {
      return NextResponse.json({ message: "Prière indisponible ou déjà attribuée" }, { status: 409 });
    }

    return NextResponse.json({ message: "Prière dispatchée au bénévole", prayer }, { status: 200 });
  } catch (error) {
    console.error("❌ Erreur dispatch prière superviseur :", error);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}
