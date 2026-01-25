import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import PrayerRequest from "@/models/PrayerRequest";
import { requireAuth } from "@/lib/auth";

export async function DELETE(req, { params }) {
  try {
    await dbConnect();

    const admin = await requireAuth("admin", req);
    if (!admin) {
      return NextResponse.json({ message: "Non autorisé" }, { status: 401 });
    }

    const { id } = params; // ✅ Utilisation directe via params
    if (!id) {
      return NextResponse.json({ message: "ID manquant" }, { status: 400 });
    }

    const deleted = await PrayerRequest.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json({ message: "Demande non trouvée" }, { status: 404 });
    }

    return NextResponse.json({ message: "Demande supprimée" }, { status: 200 });
  } catch (error) {
    console.error("Erreur DELETE /admin/prayer-request/[id]:", error);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}
