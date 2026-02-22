import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Resource from "@/models/Resource";
import { requireAuth } from "@/lib/auth";

export async function GET() {
  try {
    await dbConnect();

    const auth = await requireAuth("supervisor");
    const supervisor = auth?.user || auth;

    if (!supervisor) {
      return NextResponse.json({ error: "Accès refusé" }, { status: 401 });
    }

    const total = await Resource.countDocuments({
      createdBy: supervisor._id,
    });

    const published = await Resource.countDocuments({
      createdBy: supervisor._id,
      status: "published",
    });

    const drafts = await Resource.countDocuments({
      createdBy: supervisor._id,
      status: "draft",
    });

    return NextResponse.json({
      total,
      published,
      drafts,
    });
  } catch (error) {
    console.error("❌ STATS ERROR:", error);
    return NextResponse.json(
      { error: "Erreur récupération statistiques" },
      { status: 500 }
    );
  }
}
