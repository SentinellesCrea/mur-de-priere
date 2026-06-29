import dbConnect from "@/lib/dbConnect";
import Volunteer from "@/models/Volunteer";
import User from "@/models/User";
import { requireAuth } from "@/lib/auth";
import { NextResponse } from "next/server";
import { isOwnCloudinaryUrl } from "@/lib/cloudinary";

export async function PUT(req) {
  await dbConnect();

  try {
    const { path } = await req.json();

    const volunteer = await requireAuth("volunteer", req);
    if (!volunteer) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    if (!isOwnCloudinaryUrl(path, {
      role: volunteer.role,
      userId: volunteer._id,
      context: "profile",
    })) {
      return NextResponse.json({ error: "Chemin d'image invalide" }, { status: 400 });
    }

    const [updated] = await Promise.all([
      Volunteer.findByIdAndUpdate(
        volunteer._id,
        { profileImage: path },
        { new: true }
      ).select("-password"),
      volunteer.userId ? User.findByIdAndUpdate(volunteer.userId, { profileImage: path }) : Promise.resolve(),
    ]);

    return NextResponse.json({ message: "Image mise à jour", profileImage: updated.profileImage });
  } catch (error) {
    console.error("❌ Erreur mise à jour image :", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
