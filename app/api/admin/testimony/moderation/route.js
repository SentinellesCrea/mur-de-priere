// 🔒 /api/admin/testimony/moderation
import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Testimony from "@/models/Testimony";
import { getToken } from "@/lib/auth";

// GET – Récupérer les témoignages non modérés
export async function GET(req) {
  try {
    await dbConnect();

    const admin = await getToken("admin", req);
    if (!admin) return NextResponse.json({ message: "Non autorisé" }, { status: 401 });

    const testimonies = await Testimony.find({ isNewTestimony: true }).sort({ date: -1 });
    return NextResponse.json(testimonies, { status: 200 });
  } catch (err) {
    console.error("Erreur GET témoignages à modérer :", err);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}

// PUT – Valider/modifier le champ isNewTestimony
export async function PUT(req) {
  try {
    await dbConnect();
    const admin = await getToken("admin", req);
    if (!admin) return NextResponse.json({ message: "Non autorisé" }, { status: 401 });

    const { id } = await req.json();

    if (!id) {
      return NextResponse.json({ message: "ID requis" }, { status: 400 });
    }

    const updated = await Testimony.findByIdAndUpdate(id, { isNewTestimony: false });

    if (!updated) {
      return NextResponse.json({ message: "Témoignage introuvable" }, { status: 404 });
    }

    return NextResponse.json({ message: "Témoignage validé" }, { status: 200 });
  } catch (err) {
    console.error("Erreur PUT témoignage :", err);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}
