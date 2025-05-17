import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Volunteer from "@/models/Volunteer";
import { getToken } from "@/lib/auth";

export async function PUT(req, { params }) {
  try {
    await dbConnect();

    const admin = await getToken("admin", req);
    if (!admin) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { id } = params;

    const supervisor = await Volunteer.findById(id);
    if (!supervisor) {
      return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });
    }

    if (supervisor.role !== "supervisor") {
      return NextResponse.json({ error: "Cet utilisateur n'est pas un superviseur" }, { status: 400 });
    }

    supervisor.role = "volunteer";
    await supervisor.save();

    return NextResponse.json({ message: "Superviseur rétrogradé en bénévole avec succès" });

  } catch (error) {
    console.error("❌ Erreur PUT /admin/volunteers/demote/[id] :", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
