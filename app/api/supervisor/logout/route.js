import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  const cookieStore = await cookies();

  // ❌ Supprime le cookie côté client
  cookieStore.set("volunteerToken", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
    sameSite: "Strict",
  });

  return NextResponse.json(
    { message: "Déconnexion réussie" },
    { status: 200 }
  );
}
