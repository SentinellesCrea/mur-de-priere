import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Volunteer from "@/models/Volunteer";

export async function GET() {
  try {
    await dbConnect();

    const volunteers = await Volunteer.find({ status: "validated" })
      .select("-password") // Exclure le mot de passe pour la sécurité

    return NextResponse.json(volunteers, { status: 200 });
  } catch (error) {
    console.error("Erreur API /volunteers/all :", error);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}
