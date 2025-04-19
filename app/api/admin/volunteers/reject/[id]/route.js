// 🔒 PATCH /api/admin/volunteer/[id] — désactiver un bénévole
import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Volunteer from "@/models/Volunteer";
import { getToken } from "@/lib/auth";

export const PATCH = async (req, { params }) => {
  try {
    await dbConnect();

    const admin = await getToken("admin", req); // ✅ on attend explicitement un admin
    if (!admin) {
      return NextResponse.json({ message: "Non autorisé" }, { status: 401 });
    }

    const { id } = params;

    const updated = await Volunteer.findByIdAndUpdate(
      id,
      { isValidated: false },
      { new: true }
    );

    if (!updated) {
      return NextResponse.json({ message: "Bénévole introuvable" }, { status: 404 });
    }

    return NextResponse.json({ message: "Bénévole désactivé", volunteer: updated });
  } catch (error) {
    console.error("Erreur désactivation bénévole:", error);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
};
