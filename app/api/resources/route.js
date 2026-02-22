import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Resource from "@/models/Resource";

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
    if (category) {
      query.category = { $regex: `^${category}$`, $options: "i" };
    }

    /* ================= SEARCH TEXT ================= */
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { excerpt: { $regex: search, $options: "i" } },
      ];
    }

    const resources = await Resource.find(query)
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
