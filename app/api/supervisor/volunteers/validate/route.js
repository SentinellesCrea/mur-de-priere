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
    }).select("-password"); // ✅ on protège aussi le mot de passe au passage

    return NextResponse.json(volunteers || [], { status: 200 });
  } catch (err) {
    console.error("Erreur lors de la récupération des bénévoles :", err);
    return NextResponse.json([], { status: 500 });
  }
}
