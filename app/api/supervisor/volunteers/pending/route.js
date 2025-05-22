import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Volunteer from "@/models/Volunteer";
import { getToken } from "@/lib/auth";

export async function GET(req) {
  try {
    await dbConnect();
    const supervisor = await getToken("supervisor", req);

    if (!supervisor) {
      return NextResponse.json({ message: "Non autorisé" }, { status: 401 });
    }

    const pendingVolunteers = await Volunteer.find({ isValidated: false }).select("-password");

    return NextResponse.json(pendingVolunteers, { status: 200 });
  } catch (err) {
    console.error("Erreur pending:", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
