import { NextResponse } from "next/server";

export async function PUT() {
  return NextResponse.json(
    { error: "Rétrogradation réservée aux administrateurs" },
    { status: 403 }
  );
}
