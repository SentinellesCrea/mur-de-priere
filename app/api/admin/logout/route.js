import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export function POST() {
  const cookieStore = cookies();

  cookieStore.set("adminToken", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
    sameSite: "Lax", // 🔁 change "Strict" en "Lax"
  });

  return NextResponse.json({ message: "Déconnexion réussie" }, { status: 200 });
}
