import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Resource from "@/models/Resource";
import { requireAuth } from "@/lib/auth";
import { slugify } from "@/lib/slugify";

/* ================= POST ================= */
export async function POST(req) {
  try {
    await dbConnect();

    /* ================= AUTH ================= */
    const auth = await requireAuth("supervisor");
    const supervisor = auth?.user || auth;

    if (!supervisor) {
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
    const textContent = blocks
      .filter((b) => ["text", "verse", "callout"].includes(b.type))
      .map((b) => Object.values(b.data || {}).join(" "))
      .join(" ");

    const words = textContent.trim().split(/\s+/).length;
    const readingTime = Math.max(1, Math.ceil(words / 200));

    /* ================= CREATE ================= */
    const resource = await Resource.create({
      title,
      slug,
      category,
      excerpt,
      coverImage,
      blocks,
      readingTime,
      status,
      createdBy: supervisor._id,
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


