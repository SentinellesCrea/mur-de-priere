import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Testimony from "@/models/Testimony";
import { enforceRateLimit } from "@/lib/apiSecurity";

export async function PUT(req, { params }) {
  try {
    await dbConnect();
    const limited = enforceRateLimit(req, {
      key: "testimony-like",
      limit: 60,
      windowMs: 60 * 60 * 1000,
    });
    if (limited) return limited;

    const { id } = await params;
    const { remove } = await req.json(); // 🔁 remove = true si on veut retirer un like

    const testimony = await Testimony.findOneAndUpdate(
      { _id: id, isModerate: true, ...(remove ? { likes: { $gt: 0 } } : {}) },
      { $inc: { likes: remove ? -1 : 1 } },
      { new: true }
    );
    if (!testimony) {
      return NextResponse.json({ message: "Témoignage non trouvé" }, { status: 404 });
    }

    return NextResponse.json({
      message: remove ? "Like retiré" : "Like ajouté",
      likes: testimony.likes,
    }, { status: 200 });
  } catch (error) {
    console.error("Erreur PUT like témoignage :", error);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}
