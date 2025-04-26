import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Video from "@/models/Encouragements";
import { getToken } from "@/lib/auth";

export async function DELETE(req, { params }) {
  try {
    await dbConnect();

    const admin = await getToken("admin", req);
    if (!admin) {
      return NextResponse.json({ message: "Non autorisé" }, { status: 401 });
    }

    const { id } = params;

    const deleted = await Video.findByIdAndDelete(id);

    if (!deleted) {
      return NextResponse.json({ message: "Vidéo introuvable" }, { status: 404 });
    }

    return NextResponse.json({ message: "Vidéo supprimée" }, { status: 200 });
  } catch (error) {
    console.error("Erreur DELETE vidéo:", error);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}
