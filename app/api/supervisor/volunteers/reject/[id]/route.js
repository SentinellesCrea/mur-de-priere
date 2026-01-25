import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Volunteer from "@/models/Volunteer";
import { requireAuth } from "@/lib/auth";

export async function PATCH(req, { params }) {
  try {
    await dbConnect();

    const supervisor = await requireAuth("supervisor", req);
    if (!supervisor) {
      return NextResponse.json({ message: "Non autorisé" }, { status: 401 });
    }

    const { id } = params;
    if (!id) {
      return NextResponse.json({ message: "ID requis" }, { status: 400 });
    }

    const updated = await Volunteer.findByIdAndUpdate(
      id,
      { isValidated: false, status: "rejected" },
      { new: true }
    );

    if (!updated) {
      return NextResponse.json({ message: "Bénévole introuvable" }, { status: 404 });
    }

    return NextResponse.json({
      message: "Bénévole rejeté",
      volunteer: updated
    }, { status: 200 });

  } catch (error) {
    console.error("❌ Erreur PATCH rejet bénévole :", error);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}
