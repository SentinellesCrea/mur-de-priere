import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  const cookieStore = await cookies();

  // 🔐 Supprime tous les tokens possibles
  cookieStore.delete("adminToken");
  cookieStore.delete("volunteerToken");

  return NextResponse.json(
    { message: "Déconnexion réussie" },
    {
      status: 200,
      headers: { "Cache-Control": "no-store" },
    }
  );
}