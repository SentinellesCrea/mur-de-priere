import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export function POST() {
  const cookieStore = cookies(); // ✅ PAS de await ici

  // ✅ Supprime le cookie adminToken
  cookieStore.set("adminToken", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0, // expire immédiatement
    sameSite: "Strict",
  });

  return NextResponse.json({ message: "Déconnexion réussie" }, { status: 200 });
}
