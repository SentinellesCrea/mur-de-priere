// 🔒 /api/admin/volunteers/pending/
import { NextResponse as ResponsePending } from "next/server";
import dbConnect from "@/lib/dbConnect";
import { getToken as getTokenPending } from "@/lib/auth";

export async function GET(req) {
  try {
    await dbConnect();
    const admin = await getToken("admin", req);

    // ta logique de listing des bénévoles en attente

    return ResponsePending.json([]); // ou la vraie donnée
  } catch (err) {
    console.error("Erreur pending:", err);
    return ResponsePending.json({ error: "Non autorisé" }, { status: 401 });
  }
}