import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Volunteer from "@/models/Volunteer";
import { getToken } from "@/lib/auth";

// 🔹 DELETE : Supprimer un bénévole
export async function DELETE(req, { params }) {
  try {
    await dbConnect();

    const supervisor = await getToken("supervisor", req);
    if (!supervisor) {
      return NextResponse.json({ message: "Non autorisé" }, { status: 401 });
    }

    const { id } = params;
    if (!id) {
      return NextResponse.json({ message: "ID manquant" }, { status: 400 });
    }

    const deleted = await Volunteer.findByIdAndDelete(id);

    if (!deleted) {
      return NextResponse.json({ message: "Bénévole introuvable" }, { status: 404 });
    }

    return NextResponse.json({ message: "Bénévole supprimé" }, { status: 200 });

  } catch (err) {
    console.error("❌ Erreur DELETE bénévole :", err);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}

// 🔹 PUT : Désactiver un bénévole
export async function PUT(req, { params }) {
  try {
    await dbConnect();

    const supervisor = await getToken("supervisor", req);
    if (!supervisor) {
      return NextResponse.json({ message: "Non autorisé" }, { status: 401 });
    }

    const { id } = params;
    if (!id) {
      return NextResponse.json({ message: "ID manquant" }, { status: 400 });
    }

    const updatedVolunteer = await Volunteer.findByIdAndUpdate(
      id,
      { isValidated: false, status: "désactivé" },
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
