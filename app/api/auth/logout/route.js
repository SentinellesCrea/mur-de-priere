import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  console.log("🔒 Déconnexion demandée");

  const cookieStore = cookies();

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

  return NextResponse.json({ message: "Déconnexion réussie" });
}
