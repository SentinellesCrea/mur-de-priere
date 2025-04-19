import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Testimony from "@/models/Testimony";

export async function PUT(req, { params }) {
  try {
    await dbConnect();
    const { id } = params;
    const { remove } = await req.json(); // 🔁 remove = true si on veut retirer le like

    const testimony = await Testimony.findById(id);
    if (!testimony) {
      return NextResponse.json({ error: "Témoignage non trouvé" }, { status: 404 });
    }

    // 🔁 Ajoute ou retire un like
    if (remove) {
      testimony.likes = Math.max(0, (testimony.likes || 0) - 1);
    } else {
      testimony.likes = (testimony.likes || 0) + 1;
    }

    await testimony.save();

    return NextResponse.json({ likes: testimony.likes });
  } catch (error) {
    console.error("Erreur PUT like témoignage :", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
