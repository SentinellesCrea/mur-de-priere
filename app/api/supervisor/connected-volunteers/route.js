import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Volunteer from "@/models/Volunteer";
import { getToken } from "@/lib/auth";

export async function GET() {
  try {
    await dbConnect();
    const user = await getToken("supervisor");
    if (!user) return NextResponse.json({ message: "Non autorisé" }, { status: 401 });

    const volunteers = await Volunteer.find({ isValidated: true, isAvailable: true });
    return NextResponse.json(volunteers);
  } catch (error) {
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}
