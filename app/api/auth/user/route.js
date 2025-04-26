import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);

    console.log("📌 Session trouvée :", session);

    if (!session || !session.user) {
      console.error("⚠️ Aucune session trouvée !");
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    return NextResponse.json({ volunteerId: session.user.id }, { status: 200 });
  } catch (error) {
    console.error("❌ Erreur serveur :", error);
    return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
  }
}
