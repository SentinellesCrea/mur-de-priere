import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Resource from "@/models/Resource";
import { sanitizeResourceBlocks, sanitizeResourceUrl } from "@/lib/resourceSecurity";

const SAFE_RESOURCE_SLUG = /^[a-z0-9][a-z0-9-]{0,120}$/i;

export async function GET(req, { params }) {
  try {
    await dbConnect();

    const { slug } = await params;

    if (!SAFE_RESOURCE_SLUG.test(slug || "")) {
      return NextResponse.json(
        { error: "Ressource introuvable" },
        { status: 404 }
      );
    }

    const resource = await Resource.findOne({
      slug,
      status: "published",
    })
      .select("title slug category excerpt coverImage readingTime blocks publishedAt")
      .lean();

    if (!resource) {
      return NextResponse.json(
        { error: "Ressource introuvable" },
        { status: 404 }
      );
    }

    resource.coverImage = sanitizeResourceUrl(resource.coverImage);
    resource.blocks = sanitizeResourceBlocks(resource.blocks);

    return NextResponse.json(resource);
  } catch (error) {
    console.error("❌ GET /api/resources/[slug]", error);
    return NextResponse.json(
      { error: "Erreur récupération ressource" },
      { status: 500 }
    );
  }
}
