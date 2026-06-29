import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { enforceRateLimit } from "@/lib/apiSecurity";
import { uploadImageToCloudinary } from "@/lib/cloudinary";

const ALLOWED_CONTEXTS = new Set(["profile", "resources", "resource-cover", "resource-blocks"]);

export async function POST(req) {
  const user = await requireAuth();
  if (!user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const limited = enforceRateLimit(req, {
    key: `cloudinary-upload:${user.role}:${user._id}`,
    limit: 20,
    windowMs: 60 * 60 * 1000,
  });
  if (limited) return limited;

  try {
    const formData = await req.formData();
    const file = formData.get("file");
    const context = String(formData.get("context") || "misc");

    if (!ALLOWED_CONTEXTS.has(context)) {
      return NextResponse.json({ error: "Contexte d’upload invalide" }, { status: 400 });
    }

    const upload = await uploadImageToCloudinary(file, {
      role: user.role,
      userId: user._id,
      context,
    });

    return NextResponse.json(upload, { status: 201 });
  } catch (error) {
    console.error("Erreur upload Cloudinary :", error);
    return NextResponse.json(
      { error: error.message || "Erreur upload" },
      { status: 500 }
    );
  }
}
