import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import dbConnect from "@/lib/dbConnect";
import Volunteer from "@/models/Volunteer";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import { isValidEmail } from "@/lib/apiSecurity";
import { isOwnCloudinaryUrl } from "@/lib/cloudinary";

export async function GET(req) {
  try {
    await dbConnect();

    // ✅ Demande explicitement un superviseur
    const user = await requireAuth("supervisor", req);
    if (!user) {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }

    return NextResponse.json({
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      profileImage: user.profileImage || "",
      role: user.role,
    });

  } catch (error) {
    console.error("❌ Erreur API /supervisor/me :", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    await dbConnect();

    const user = await requireAuth("supervisor", req);
    if (!user) {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }

    const { email, password, profileImage } = await req.json();

    const updates = {};
    if (email) {
      if (!isValidEmail(email)) return NextResponse.json({ error: "Email invalide" }, { status: 400 });
      updates.email = email.trim().toLowerCase();
    }

    if (password) {
      if (password.length < 12 || password.length > 128) {
        return NextResponse.json({ error: "Mot de passe trop court" }, { status: 400 });
      }
      updates.password = await bcrypt.hash(password, 10);
    }

    if (profileImage) {
      if (!isOwnCloudinaryUrl(profileImage, {
        role: "supervisor",
        userId: user._id,
        context: "profile",
      })) {
        return NextResponse.json({ error: "Image de profil invalide" }, { status: 400 });
      }
      updates.profileImage = profileImage;
    }

    const [updated] = await Promise.all([
      Volunteer.findOneAndUpdate(
        { _id: user._id, role: "supervisor" },
        updates,
        { new: true }
      ).select("-password"),
      user.userId ? User.findByIdAndUpdate(user.userId, updates) : Promise.resolve(),
    ]);

    if (!updated) {
      return NextResponse.json({ error: "Superviseur introuvable" }, { status: 404 });
    }

    return NextResponse.json({
      message: "Profil mis à jour",
      requireReconnect: Boolean(password),
      profileImage: updated.profileImage || "",
    });
  } catch (error) {
    console.error("❌ Erreur PUT /supervisor/me :", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
