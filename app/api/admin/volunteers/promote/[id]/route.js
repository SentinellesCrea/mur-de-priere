import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Volunteer from "@/models/Volunteer";
import { requireAuth } from "@/lib/auth";

export async function PUT(req, { params }) {
  try {
    await dbConnect();

    const session = await requireAuth("admin"); // 🔐 Accès admin uniquement
    if (!session) {
      return NextResponse.json({ error: "Accès non autorisé" }, { status: 403 });
    }

    const { id } = await params;
    const volunteer = await Volunteer.findById(id);

    if (!volunteer) {
      return NextResponse.json({ error: "Bénévole introuvable" }, { status: 404 });
    }

    if (volunteer.role === "supervisor") {
      return NextResponse.json({ error: "Ce bénévole est déjà superviseur" }, { status: 400 });
    }

    volunteer.role = "supervisor";
    await volunteer.save();

    return NextResponse.json({ message: "Bénévole promu en superviseur avec succès" });

  } catch (error) {
    console.error("❌ Erreur API promote supervisor :", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
