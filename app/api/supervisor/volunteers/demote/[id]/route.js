import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Volunteer from "@/models/Volunteer";
import { requireAuth } from "@/lib/auth";

export async function PUT(req, { params }) {
  try {
    await dbConnect();

    const supervisor = await requireAuth("supervisor", req);
    if (!supervisor) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { id } = params;
    if (!id) {
      return NextResponse.json({ error: "ID manquant" }, { status: 400 });
    }

    const targetUser = await Volunteer.findById(id);
    if (!targetUser) {
      return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });
    }

    if (targetUser.role !== "supervisor") {
      return NextResponse.json({ error: "Cet utilisateur n'est pas un superviseur" }, { status: 400 });
    }

    targetUser.role = "volunteer";
    await targetUser.save();

    return NextResponse.json({
      message: "Superviseur rétrogradé en bénévole avec succès",
      updated: targetUser,
    });

  } catch (error) {
    console.error("❌ Erreur PUT /supervisor/volunteers/demote/[id] :", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
