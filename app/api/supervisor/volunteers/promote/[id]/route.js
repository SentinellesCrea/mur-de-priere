import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Volunteer from "@/models/Volunteer";
import { getToken } from "@/lib/auth"; // 🔐 Vérification via cookie superviseur

export async function PUT(req, { params }) {
  try {
    await dbConnect();

    const supervisor = await getToken("supervisor", req);
    if (!supervisor) {
      return NextResponse.json({ error: "Accès non autorisé" }, { status: 403 });
    }

    const { id } = params;
    if (!id) {
      return NextResponse.json({ error: "ID requis" }, { status: 400 });
    }

    const volunteer = await Volunteer.findById(id);
    if (!volunteer) {
      return NextResponse.json({ error: "Bénévole introuvable" }, { status: 404 });
    }

    if (volunteer.role === "supervisor") {
      return NextResponse.json({ error: "Ce bénévole est déjà superviseur" }, { status: 400 });
    }

    volunteer.role = "supervisor";
    await volunteer.save();

    return NextResponse.json({
      message: "Bénévole promu en superviseur avec succès",
      updated: volunteer
    });

  } catch (error) {
    console.error("❌ Erreur PUT promote supervisor :", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
