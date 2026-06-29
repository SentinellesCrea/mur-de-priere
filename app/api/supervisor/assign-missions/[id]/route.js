import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import PrayerRequest from "@/models/PrayerRequest";
import Volunteer from "@/models/Volunteer";
import { requireAuth } from "@/lib/auth";

export async function PUT(req, { params }) {
  try {
    await dbConnect();

    // ✅ Vérifie que c’est bien un superviseur
    const supervisor = await requireAuth("supervisor", req);
    if (!supervisor) {
      return NextResponse.json({ message: "Accès non autorisé" }, { status: 401 });
    }

    const { id } = await params;
    if (!id) {
      return NextResponse.json({ message: "ID de prière requis" }, { status: 400 });
    }

    const { volunteerId } = await req.json();
    if (!volunteerId) {
      return NextResponse.json({ message: "ID du bénévole requis" }, { status: 400 });
    }

    // ✅ Vérifie que le bénévole existe et est validé
    const volunteer = await Volunteer.findById(volunteerId);
    if (!volunteer || volunteer.role !== "volunteer" || !volunteer.isValidated || volunteer.status === "rejected") {
      return NextResponse.json({ message: "Bénévole introuvable ou non validé" }, { status: 404 });
    }

    const prayerToDelegate = await PrayerRequest.findOne({
      _id: id,
      assignedTo: supervisor._id,
      $or: [
        { assignedByRole: "admin" },
        { assignedByRole: { $exists: false }, isAssigned: false },
      ],
      isAnswered: false,
      rejectedAt: { $exists: false },
    });

    if (!prayerToDelegate) {
      return NextResponse.json(
        { message: "Mission introuvable ou non assignée par l'admin à ce superviseur" },
        { status: 403 }
      );
    }

    // ✅ Délégation de la mission reçue de l'admin vers un bénévole
    const prayer = await PrayerRequest.findByIdAndUpdate(
      id,
      {
        assignedTo: volunteer._id,
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
      return NextResponse.json({ message: "Prière introuvable" }, { status: 404 });
    }

    return NextResponse.json({ message: "Mission attribuée avec succès", prayer });

  } catch (error) {
    console.error("❌ Erreur assignation mission :", error);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}
