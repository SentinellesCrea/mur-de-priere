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
      { isValidated: false, status: "rejected" },
      { new: true }
    );

    if (!updated) {
      return NextResponse.json({ message: "Bénévole introuvable" }, { status: 404 });
    }

    return NextResponse.json({ message: "Bénévole désactivé", volunteer: updated }, { status: 200 });
  } catch (error) {
    console.error("Erreur désactivation bénévole:", error);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}
