// 🔒 /api/admin/volunteer/validate/[id]
import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Volunteer from "@/models/Volunteer";
import { getToken } from "@/lib/auth";

export const PATCH = async (req, { params }) => {
  try {
    await dbConnect();

    // ✅ Sécurisation : uniquement les admins
    const admin = await getToken("admin", req);
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

    return NextResponse.json({ message: "Bénévole validé", volunteer: updated });
  } catch (err) {
    console.error("Erreur PATCH bénévole :", err);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
};
