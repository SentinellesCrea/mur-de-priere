import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Resource from "@/models/Resource";
import { requireAuth } from "@/lib/auth";
import { slugify } from "@/lib/slugify";
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

export async function GET(req) {
  await dbConnect();
  const supervisor = await requireAuth("supervisor", req);
  if (!supervisor) return NextResponse.json({ error: "Accès refusé" }, { status: 401 });

  const resources = await Resource.find({ createdBy: supervisor._id })
    .sort({ updatedAt: -1 })
    .lean();
  return NextResponse.json({ data: resources });
}

/* ================= POST ================= */
export async function POST(req) {
  try {
    await dbConnect();

    /* ================= AUTH ================= */
    const auth = await requireAuth("supervisor", req);
    const supervisor = auth?.user || auth;

    if (!supervisor || supervisor.role !== "supervisor") {
      return NextResponse.json(
        { error: "Accès refusé" },
        { status: 401 }
      );
    }

    /* ================= BODY ================= */
    const body = await req.json();

    const {
      title,
      category,
      excerpt,
      coverImage,
      blocks = [],
      status = "draft",
    } = body;

    const cleanTitle = typeof title === "string" ? title.trim().slice(0, 200) : "";
    const cleanExcerpt = typeof excerpt === "string" ? excerpt.trim().slice(0, 300) : "";
    const safeCoverImage = typeof coverImage === "string"
      ? ownResourceImageUrl(coverImage, supervisor)
      : "";

    if (!cleanTitle || !category) {
      return NextResponse.json(
        { error: "Titre et catégorie requis" },
        { status: 400 }
      );
    }
    if (
      !["priere", "meditation", "encouragement", "enseignement", "foi", "autres"].includes(category) ||
      !["draft", "published", "archived"].includes(status)
    ) {
      return NextResponse.json({ error: "Catégorie ou statut invalide" }, { status: 400 });
    }

    const safeBlocks = keepOwnResourceBlockImages(
      sanitizeResourceBlocks(blocks),
      supervisor
    );

    /* ================= SLUG ================= */
    const baseSlug = slugify(cleanTitle, {
      lower: true,
      strict: true,
    });

    if (!baseSlug) {
      return NextResponse.json(
        { error: "Titre invalide" },
        { status: 400 }
      );
    }

    let slug = baseSlug;
    let counter = 1;

    while (await Resource.findOne({ slug })) {
      slug = `${baseSlug}-${counter++}`;
    }

    /* ================= READING TIME ================= */
    const textContent = safeBlocks
      .filter((b) => ["text", "verse", "callout"].includes(b.type))
      .map((b) => Object.values(b.data || {}).join(" "))
      .join(" ");

    const words = textContent.trim()
      ? textContent.trim().split(/\s+/).length
      : 0;

    const readingTime = Math.max(1, Math.ceil(words / 200));

    /* ================= CREATE ================= */
    const resource = await Resource.create({
      title: cleanTitle,
      slug,
      category,
      excerpt: cleanExcerpt,
      coverImage: safeCoverImage,
      blocks: safeBlocks,
      readingTime,
      status,
      createdBy: supervisor._id, // 🔥 lié au supervisor connecté
      publishedAt: status === "published" ? new Date() : undefined,
    });

    return NextResponse.json(resource, { status: 201 });

  } catch (error) {
    console.error("❌ CREATE RESOURCE ERROR:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création de la ressource" },
      { status: 500 }
    );
  }
}
