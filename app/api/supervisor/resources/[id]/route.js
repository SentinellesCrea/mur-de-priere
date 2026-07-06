import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Resource from "@/models/Resource";
import { requireAuth } from "@/lib/auth"; // ou ton auth supervisor
import { sanitizeResourceBlocks, sanitizeResourceUrl } from "@/lib/resourceSecurity";
import { isOwnCloudinaryUrl } from "@/lib/cloudinary";

function ownResourceImageUrl(value, supervisor) {
  const url = sanitizeResourceUrl(value);

  if (!url) return "";

  return isOwnCloudinaryUrl(url, {
    role: "supervisor",
    userId: supervisor._id,
    context: "ressources",
  })
    ? url
    : "";
}

function keepOwnResourceBlockImages(blocks, supervisor) {
  return blocks.map((block) => {
    if (!["hero", "image", "textImage"].includes(block.type)) return block;

    const data = { ...block.data };

    if (block.type === "hero") {
      data.image = ownResourceImageUrl(data.image, supervisor);
    }

    if (["image", "textImage"].includes(block.type)) {
      data.src = ownResourceImageUrl(data.src, supervisor);
    }

    return { ...block, data };
  });
}

export async function GET(req, { params }) {
  try {
    await dbConnect();
    const supervisor = await requireAuth("supervisor");
    if (!supervisor) {
      return NextResponse.json({ error: "Accès refusé" }, { status: 401 });
    }

    const { id } = await params;

    const resource = await Resource.findOne({ _id: id, createdBy: supervisor._id }).lean();

    if (!resource) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json(resource);
  } catch (err) {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function PUT(req, { params }) {
  try {
    await dbConnect();
    const supervisor = await requireAuth("supervisor");
    if (!supervisor) {
      return NextResponse.json({ error: "Accès refusé" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();

    const update = {};
    if (typeof body.title === "string") update.title = body.title.trim().slice(0, 200);
    if (typeof body.excerpt === "string") update.excerpt = body.excerpt.trim().slice(0, 300);
    if (["priere", "meditation", "encouragement", "enseignement", "foi", "autres"].includes(body.category)) {
      update.category = body.category;
    }
    if (["draft", "published", "archived"].includes(body.status)) {
      update.status = body.status;
      if (body.status === "published") update.publishedAt = new Date();
    }
    if (Array.isArray(body.blocks)) {
      update.blocks = keepOwnResourceBlockImages(
        sanitizeResourceBlocks(body.blocks),
        supervisor
      );
    }
    if (typeof body.coverImage === "string") {
      update.coverImage = ownResourceImageUrl(body.coverImage, supervisor);
    }

    const updated = await Resource.findOneAndUpdate(
      { _id: id, createdBy: supervisor._id },
      update,
      {
      new: true,
      runValidators: true,
      }
    );

    if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });

    return NextResponse.json(updated);
  } catch (err) {
    return NextResponse.json({ error: "Erreur update" }, { status: 500 });
  }
}
