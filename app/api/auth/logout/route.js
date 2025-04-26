import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(req) {
  console.log("🔒 Déconnexion demandée");

  try {
    const cookieStore = await cookies();

    // Supprimer les 2 cookies potentiels
    cookieStore.set("adminToken", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 0,
      path: "/",
    });

    cookieStore.set("volunteerToken", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 0,
      path: "/",
    });

    return new Response(JSON.stringify({ message: "Déconnexion réussie" }), { status: 200 });
  } catch (error) {
    console.error("Erreur de déconnexion :", error);
    return new Response(JSON.stringify({ message: "Erreur serveur" }), { status: 500 });
  }
}