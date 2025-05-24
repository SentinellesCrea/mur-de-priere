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

    const volunteers = await Volunteer.find({
      isValidated: true,
      status: "validated",
    }).select("-password");

    return NextResponse.json(volunteers || [], { status: 200 });

  } catch (err) {
    console.error("❌ Erreur récupération bénévoles validés :", err);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}
