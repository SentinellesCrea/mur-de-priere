import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Testimony from "@/models/Testimony";
import { getToken } from "@/lib/auth";

export async function DELETE(req, { params }) {
  try {
    await dbConnect();

    // ✅ Vérifie que l'utilisateur est un superviseur
    const supervisor = await getToken("supervisor", req);
    if (!supervisor) {
      return NextResponse.json({ message: "Accès réservé aux superviseurs" }, { status: 403 });
    }

    const { id } = params;
    if (!id) {
      return NextResponse.json({ message: "ID manquant" }, { status: 400 });
    }

    const deleted = await Testimony.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json({ message: "Témoignage introuvable" }, { status: 404 });
    }

    return NextResponse.json({ message: "Témoignage supprimé" }, { status: 200 });

  } catch (err) {
    console.error("❌ Erreur DELETE témoignage :", err);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}
