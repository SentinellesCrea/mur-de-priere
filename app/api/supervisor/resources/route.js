import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Resource from "@/models/Resource";
import { requireAuth } from "@/lib/auth";
import { slugify } from "@/lib/slugify";
import { sanitizeResourceBlocks, sanitizeResourceUrl } from "@/lib/resourceSecurity";

export async function GET() {
  await dbConnect();
  const supervisor = await requireAuth("supervisor");
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
    const auth = await requireAuth("supervisor");
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

    if (!title || !category) {
      return NextResponse.json(
        { error: "Titre et catégorie requis" },
        { status: 400 }
      );
    }
    if (
      !["priere", "meditation", "encouragement", "enseignement", "foi", "autres"].includes(category) ||
      !["draft", "published"].includes(status)
    ) {
      return NextResponse.json({ error: "Catégorie ou statut invalide" }, { status: 400 });
    }

    const safeBlocks = sanitizeResourceBlocks(blocks);

    /* ================= SLUG ================= */
    const baseSlug = slugify(title, {
      lower: true,
      strict: true,
    });

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
      title: String(title).trim().slice(0, 200),
      slug,
      category,
      excerpt: String(excerpt || "").trim().slice(0, 300),
      coverImage: sanitizeResourceUrl(coverImage),
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
