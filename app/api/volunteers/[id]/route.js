import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Volunteer from "@/models/Volunteer";
import { requireAuth } from "@/lib/auth";

export async function DELETE(req, { params }) {
  try {
    await dbConnect();

    const admin = await requireAuth("admin", req); // 🔐 Sécurité admin
    if (!admin) {
      return NextResponse.json({ message: "Non autorisé" }, { status: 401 });
    }

    const { id } = await params;
    if (!id) {
      return NextResponse.json({ message: "ID requis pour la suppression" }, { status: 400 });
    }

    const deletedVolunteer = await Volunteer.findByIdAndDelete(id);

    if (!deletedVolunteer) {
      return NextResponse.json({ message: "Bénévole non trouvé" }, { status: 404 });
    }

    return NextResponse.json({ message: "Bénévole supprimé avec succès" }, { status: 200 });
  } catch (error) {
    console.error("❌ Erreur lors de la suppression :", error);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}
