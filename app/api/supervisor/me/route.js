import { NextResponse } from "next/server";
import { getToken } from "@/lib/auth";
import dbConnect from "@/lib/dbConnect";

export async function GET(req) {
  try {
    await dbConnect();

    // ✅ Demande explicitement un superviseur
    const user = await getToken("supervisor", req);
    if (!user) {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }

    return NextResponse.json({
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
    });

  } catch (error) {
    console.error("❌ Erreur API /supervisor/me :", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
