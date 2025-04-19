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

    const testimonies = await Testimony.find({ isModerated: false }).sort({ date: -1 });
    return NextResponse.json(testimonies);
  } catch (err) {
    console.error("Erreur GET témoignages à modérer :", err);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
};

// ✅ PUT – Valider/modifier le champ isModerated
export const PUT = async (req) => {
  try {
    await dbConnect();
    const admin = await getToken("admin");
    if (!admin) return NextResponse.json({ message: "Non autorisé" }, { status: 401 });

    const { id } = await req.json();

    if (!id) {
      return NextResponse.json({ message: "ID requis" }, { status: 400 });
    }

    const updated = await Testimony.findByIdAndUpdate(
      id,
      { isModerated: true },
      { new: true }
    );

    if (!updated) {
      return NextResponse.json({ message: "Témoignage introuvable" }, { status: 404 });
    }

    return NextResponse.json({ message: "Témoignage validé", testimony: updated });
  } catch (err) {
    console.error("Erreur PUT témoignage :", err);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
};
