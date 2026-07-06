import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Resource from "@/models/Resource";
import { sanitizeResourceBlocks, sanitizeResourceUrl } from "@/lib/resourceSecurity";
import mongoose from "mongoose";

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

    const publicQuery = {
      status: "published",
      $or: [{ slug }],
    };

    if (mongoose.Types.ObjectId.isValid(slug)) {
      publicQuery.$or.push({ _id: slug });
    }

    const resource = await Resource.findOne(publicQuery)
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
