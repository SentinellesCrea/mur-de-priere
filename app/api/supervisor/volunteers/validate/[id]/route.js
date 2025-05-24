import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Volunteer from "@/models/Volunteer";
import { getToken } from "@/lib/auth";

export async function PATCH(req, { params }) {
  try {
    await dbConnect();

    const supervisor = await getToken("supervisor", req);
    if (!supervisor) {
      return NextResponse.json({ message: "Non autorisé" }, { status: 401 });
    }

    const { id } = params;
    if (!id) {
      return NextResponse.json({ message: "ID manquant" }, { status: 400 });
    }

    const updated = await Volunteer.findByIdAndUpdate(
      id,
      { isValidated: true, status: "validated" },
      { new: true }
    );

    if (!updated) {
      return NextResponse.json({ message: "Bénévole introuvable" }, { status: 404 });
    }

    return NextResponse.json({
      message: "Bénévole validé",
      volunteer: updated
    }, { status: 200 });

  } catch (err) {
    console.error("❌ Erreur PATCH validation bénévole :", err);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}
