import dbConnect from "@/lib/dbConnect";
import Volunteer from "@/models/Volunteer";
import { getToken } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function PUT(req) {
  await dbConnect();

  try {
    const { path } = await req.json();

    if (!path) {
      return NextResponse.json({ error: "Chemin de l'image manquant" }, { status: 400 });
    }

    const volunteer = await getToken("volunteer", req);
    if (!volunteer || volunteer.role !== "volunteer") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const updated = await Volunteer.findByIdAndUpdate(
      volunteer._id,
      { profileImage: path },
      { new: true }
    ).select("-password");

    return NextResponse.json({ message: "Image mise à jour", profileImage: updated.profileImage });
  } catch (error) {
    console.error("❌ Erreur mise à jour image :", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
