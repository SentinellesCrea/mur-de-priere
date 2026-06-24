import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Volunteer from "@/models/Volunteer";
import { requireAuth } from "@/lib/auth";

// 🔹 DELETE : Supprimer un bénévole
export async function DELETE(req, { params }) {
  return NextResponse.json({ message: "Suppression réservée aux administrateurs" }, { status: 403 });
}

// 🔹 PUT : Désactiver un bénévole
export async function PUT(req, { params }) {
  try {
    await dbConnect();

    const supervisor = await requireAuth("supervisor", req);
    if (!supervisor) {
      return NextResponse.json({ message: "Non autorisé" }, { status: 401 });
    }

    const { id } = await params;
    if (!id) {
      return NextResponse.json({ message: "ID manquant" }, { status: 400 });
    }

    const updatedVolunteer = await Volunteer.findOneAndUpdate(
      { _id: id, role: "volunteer" },
      { isValidated: false, status: "rejected", isAvailable: false },
      { new: true }
    );

    if (!updatedVolunteer) {
      return NextResponse.json({ message: "Bénévole introuvable" }, { status: 404 });
    }

    return NextResponse.json({
      message: "Bénévole désactivé",
      volunteer: updatedVolunteer
    }, { status: 200 });

  } catch (err) {
    console.error("❌ Erreur PUT désactivation bénévole :", err);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}
