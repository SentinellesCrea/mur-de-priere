// /app/api/admin/supervisors/route.js

import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Volunteer from "@/models/Volunteer";
import { requireAuth } from "@/lib/auth";

export async function GET(req) {
  try {
    await dbConnect();

    const admin = await requireAuth("admin", req);
    if (!admin) {
      return NextResponse.json({ message: "Non autorisé" }, { status: 401 });
    }

    const supervisors = await Volunteer.find({ role: "supervisor" });
    return NextResponse.json(supervisors);
  } catch (err) {
    console.error("❌ Erreur récupération superviseurs:", err.message);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}
