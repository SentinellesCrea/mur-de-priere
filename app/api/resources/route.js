import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Resource from "@/models/Resource";

export async function GET(req) {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);

    const category = searchParams.get("category");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "8");
    const search = searchParams.get("search");

    const filter = {
      status: "published",
    };

    if (category) {
      filter.category = category;
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { excerpt: { $regex: search, $options: "i" } },
      ];
    }

    const resources = await Resource.find(filter)
      .select("-blocks") // ⛔ pas les blocs ici
      .sort({ publishedAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    const total = await Resource.countDocuments(filter);

    return NextResponse.json({
      data: resources,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("❌ GET /api/resources", error);
    return NextResponse.json(
      { error: "Erreur récupération des ressources" },
      { status: 500 }
    );
  }
}
