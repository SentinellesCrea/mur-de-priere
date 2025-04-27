// 🔒 /api/admin/volunteers
import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Volunteer from "@/models/Volunteer";
import { getToken } from "@/lib/auth";

export async function GET(req) {
  try {
    await dbConnect();

    // ✅ Sécurisation : accès uniquement admin
    const admin = await getToken("admin", req);
    if (!admin) {
      return NextResponse.json({ message: "Non autorisé" }, { status: 401 });
    }

    // 🔥 Modification : ne récupérer que les bénévoles non validés
    const volunteers = await Volunteer.find({ isValidated: true }).select("-password");

    return NextResponse.json(volunteers, { status: 200 });
  } catch (error) {
    console.error("Erreur GET /admin/volunteers:", error);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
};
