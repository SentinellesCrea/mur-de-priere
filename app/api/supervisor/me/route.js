import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import { getToken } from "@/lib/auth";

export async function GET() {
  try {
    await dbConnect();

    const user = await getToken();
    if (!user) {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }

    return NextResponse.json(user, { status: 200 });
  } catch (error) {
    console.error("Erreur API /volunteers/me :", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
