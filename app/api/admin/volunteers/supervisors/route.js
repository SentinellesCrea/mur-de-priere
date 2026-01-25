import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Volunteer from "@/models/Volunteer";
import { requireAuth } from "@/lib/auth";

export async function GET(req) {
  try {
    await dbConnect();

    // ✅ Sécurisation : accès uniquement admin
    const admin = await requireAuth("admin", req);
    if (!admin) {
      return NextResponse.json({ message: "Non autorisé" }, { status: 401 });
    }

    // ✅ Récupérer uniquement les superviseurs
    const supervisors = await Volunteer.find({ role: "supervisor" }).select("-password");

    return NextResponse.json(supervisors, { status: 200 });
  } catch (error) {
    console.error("Erreur GET /admin/volunteers/supervisors :", error);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}
