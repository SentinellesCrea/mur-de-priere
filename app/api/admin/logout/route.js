import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  console.log("🔒 Déconnexion demandée");

  // ✅ Créer une réponse propre
  const response = NextResponse.json({ message: "Déconnexion réussie" });

  // ✅ Supprimer le cookie "adminToken"
  response.cookies.set("adminToken", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0, // efface immédiatement
  });

  return response;
}
