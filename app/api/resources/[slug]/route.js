import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Resource from "@/models/Resource";

export async function GET(req, { params }) {
  try {
    await dbConnect();

    const { slug } = await params;

    const resource = await Resource.findOne({
      slug,
      status: "published",
    }).lean();

    if (!resource) {
      return NextResponse.json(
        { error: "Ressource introuvable" },
        { status: 404 }
      );
    }

    return NextResponse.json(resource);
  } catch (error) {
    console.error("❌ GET /api/resources/[slug]", error);
    return NextResponse.json(
      { error: "Erreur récupération ressource" },
      { status: 500 }
    );
  }
}
