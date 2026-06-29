import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Testimony from "@/models/Testimony";
import { requireAuth } from "@/lib/auth";

export async function DELETE(req, { params }) {
  try {
    await dbConnect();

    // ✅ Vérifie que l'utilisateur est un superviseur
    const supervisor = await requireAuth("supervisor", req);
    if (!supervisor) {
      return NextResponse.json({ message: "Accès réservé aux superviseurs" }, { status: 403 });
    }

    const { id } = await params;
    if (!id) {
      return NextResponse.json({ message: "ID manquant" }, { status: 400 });
    }

    const rejected = await Testimony.findByIdAndUpdate(
      id,
      {
        isNewTestimony: false,
        isModerate: false,
        needsReview: false,
        rejectedAt: new Date(),
        rejectedBy: supervisor._id,
      },
      { new: true }
    );
    if (!rejected) {
      return NextResponse.json({ message: "Témoignage introuvable" }, { status: 404 });
    }

    return NextResponse.json({ message: "Témoignage rejeté" }, { status: 200 });

  } catch (err) {
    console.error("❌ Erreur DELETE témoignage :", err);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}
