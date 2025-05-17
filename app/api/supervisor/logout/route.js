import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  // 🆕 await obligatoire
  const cookieStore = await cookies();
  
  // ✅ Supprimer directement le cookie sécurisé
  cookieStore.set("adminToken", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0, // Efface immédiatement
    sameSite: "Strict",
  });

  return NextResponse.json({ message: "Déconnexion réussie" }, { status: 200 });
}
