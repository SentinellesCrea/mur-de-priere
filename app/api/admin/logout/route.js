import { NextResponse } from "next/server";

export function POST() {
  const response = NextResponse.json({ message: "Déconnexion réussie" });

  response.cookies.set("adminToken", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
    sameSite: "Strict",
  });

  return response;
}
