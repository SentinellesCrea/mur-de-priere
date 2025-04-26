import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Volunteer from "@/models/Volunteer";
import { getToken } from "@/lib/auth";

export async function PUT(req, { params }) {
  try {
    await dbConnect();

    const admin = await getToken("admin", req);
    if (!admin) {
      return NextResponse.json({ message: "Non autorisé" }, { status: 401 });
    }

    const { id } = params;

    const volunteer = await Volunteer.findById(id);
    if (!volunteer) {
      return NextResponse.json({ message: "Bénévole introuvable" }, { status: 404 });
    }

    volunteer.role = "admin";
    await volunteer.save();

    return NextResponse.json({ message: "Bénévole transformé en admin", volunteer }, { status: 200 });
  } catch (err) {
    console.error("Erreur de transformation du bénévole en admin :", err);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}
