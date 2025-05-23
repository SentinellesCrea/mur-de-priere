// /app/api/admin/volunteers/role/[id]/route.js

import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Volunteer from "@/models/Volunteer";
import { getToken } from "@/lib/auth";

export async function PUT(req, { params }) {
  try {
    await dbConnect();

    const admin = await getToken("admin");
    if (!admin) {
      return NextResponse.json({ message: "Non autorisé" }, { status: 401 });
    }

    const { id } = params;
    const { role } = await req.json();

    if (!["volunteer", "supervisor"].includes(role)) {
      return NextResponse.json({ message: "Rôle non autorisé" }, { status: 400 });
    }

    await Volunteer.findByIdAndUpdate(id, { role });
    return NextResponse.json({ message: `Rôle changé en "${role}"` });
  } catch (err) {
    console.error("Erreur modification rôle bénévole:", err.message);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}
