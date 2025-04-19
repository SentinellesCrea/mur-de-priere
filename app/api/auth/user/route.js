import { getServerSession } from "next-auth";

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    console.log("📌 Session trouvée :", session); // Ajoute ce log !

    if (!session || !session.user) {
      console.error("⚠️ Aucune session trouvée !");
      return Response.json({ error: "Non autorisé" }, { status: 401 });
    }

    return Response.json({ volunteerId: session.user.id });
  } catch (error) {
    console.error("❌ Erreur serveur :", error);
    return Response.json({ error: "Erreur interne" }, { status: 500 });
  }
}
