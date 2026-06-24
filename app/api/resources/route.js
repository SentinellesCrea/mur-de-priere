import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Resource from "@/models/Resource";

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export async function GET(req) {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);

    const search = searchParams.get("search");
    const category = searchParams.get("category");

    /* ================= BASE QUERY ================= */
    // 🔒 Toujours uniquement publié
    const query = {
      status: "published",
    };

    /* ================= FILTER CATEGORY ================= */
    if (["priere", "meditation", "encouragement", "enseignement", "foi", "autres"].includes(category)) {
      query.category = category;
    }

    /* ================= SEARCH TEXT ================= */
    if (search && search.length <= 100) {
      const safeSearch = escapeRegex(search);
      query.$or = [
        { title: { $regex: safeSearch, $options: "i" } },
        { excerpt: { $regex: safeSearch, $options: "i" } },
      ];
    }

    const resources = await Resource.find(query)
      .select("title slug category excerpt coverImage readingTime blocks publishedAt")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      data: resources,
    });

  } catch (error) {
    console.error("Erreur API resources:", error);
    return NextResponse.json(
      { success: false, message: "Erreur serveur" },
      { status: 500 }
    );
  }
}
