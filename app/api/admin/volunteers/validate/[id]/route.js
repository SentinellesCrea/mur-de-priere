import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Volunteer from "@/models/Volunteer";
import { requireAuth } from "@/lib/auth";

export async function PATCH(req, { params }) {
  try {
    await dbConnect();

    const admin = await requireAuth("admin", req);
    if (!admin) {
      return NextResponse.json({ message: "Non autorisé" }, { status: 401 });
    }

    const { id } = params;

    const updated = await Volunteer.findByIdAndUpdate(
      id,
      { isValidated: true, status: "validated" },
      { new: true }
    );

    if (!updated) {
      return NextResponse.json({ message: "Bénévole introuvable" }, { status: 404 });
    }

    return NextResponse.json({ message: "Bénévole validé", volunteer: updated }, { status: 200 });
  } catch (err) {
    console.error("Erreur PATCH bénévole :", err);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}
