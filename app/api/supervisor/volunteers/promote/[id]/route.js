import { NextResponse } from "next/server";
export async function PUT() {
  return NextResponse.json({ error: "Promotion réservée aux administrateurs" }, { status: 403 });
}
