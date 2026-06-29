import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { enforceRateLimit } from "@/lib/apiSecurity";
import { uploadImageToCloudinary } from "@/lib/cloudinary";

export async function POST(req) {
  const volunteer = await requireAuth("volunteer");
  if (!volunteer) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const limited = enforceRateLimit(req, {
    key: `profile-upload:${volunteer._id}`,
    limit: 5,
    windowMs: 60 * 60 * 1000,
  });
  if (limited) return limited;

  try {
    const formData = await req.formData();
    const file = formData.get("file");

    const upload = await uploadImageToCloudinary(file, {
      role: volunteer.role,
      userId: volunteer._id,
      context: "profile",
    });

    return NextResponse.json({ path: upload.url, ...upload });
  } catch (error) {
    console.error("Erreur upload :", error);
    return NextResponse.json({ error: "Erreur upload" }, { status: 500 });
  }
}
