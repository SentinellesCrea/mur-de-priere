import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Volunteer from "@/models/Volunteer";
import { getToken } from "@/lib/auth";

export async function GET(request) {
  try {
    await dbConnect();

    const user = await getToken("volunteer", request); // ✅ on utilise 'request' ici

    if (!user || user.role !== "volunteer") {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("Erreur API /volunteers/me :", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

