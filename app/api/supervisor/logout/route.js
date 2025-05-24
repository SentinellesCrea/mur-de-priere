import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json(
    { message: "Déconnexion réussie" },
    { status: 200 }
  );

  // Supprime les deux types de token potentiels (volunteer et supervisor)
  response.cookies.set("volunteerToken", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
    sameSite: "Strict",
  });

  return response;
}
