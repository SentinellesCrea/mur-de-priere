import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Testimony from "@/models/Testimony";

export async function PUT(req, { params }) {
  try {
    await dbConnect();

    const { id } = await params;
    const { remove } = await req.json(); // 🔁 remove = true si on veut retirer un like

    const testimony = await Testimony.findById(id);
    if (!testimony) {
      return NextResponse.json({ message: "Témoignage non trouvé" }, { status: 404 });
    }

    if (remove) {
      testimony.likes = Math.max(0, (testimony.likes || 0) - 1);
    } else {
      testimony.likes = (testimony.likes || 0) + 1;
    }

    await testimony.save();

    return NextResponse.json({
      message: remove ? "Like retiré" : "Like ajouté",
      likes: testimony.likes,
    }, { status: 200 });
  } catch (error) {
    console.error("Erreur PUT like témoignage :", error);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}
