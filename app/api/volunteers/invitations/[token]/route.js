import { NextResponse } from "next/server";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import sanitizeHtml from "sanitize-html";
import { cookies } from "next/headers";
import dbConnect from "@/lib/dbConnect";
import VolunteerInvitation from "@/models/VolunteerInvitation";
import Volunteer from "@/models/Volunteer";
import User from "@/models/User";
import VolunteerProfile from "@/models/VolunteerProfile";
import { isValidEmail } from "@/lib/apiSecurity";
import { uploadImageToCloudinary } from "@/lib/cloudinary";
import { isStrongPassword, STRONG_PASSWORD_MESSAGE } from "@/lib/passwordSecurity";

function hashToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

async function findValidInvitation(token) {
  if (!/^[a-f0-9]{64}$/i.test(token || "")) return null;

  const invitation = await VolunteerInvitation.findOne({
    tokenHash: hashToken(token),
    status: "pending",
    expiresAt: { $gt: new Date() },
  });

  return invitation;
}

export async function GET(req, { params }) {
  try {
    await dbConnect();
    const { token } = await params;
    const invitation = await findValidInvitation(token);

    if (!invitation) {
      return NextResponse.json({ message: "Invitation invalide ou expirée" }, { status: 404 });
    }

    return NextResponse.json({
      firstName: invitation.firstName,
      lastName: invitation.lastName,
      email: invitation.email,
      phone: invitation.phone || "",
      gender: invitation.gender || "",
    });
  } catch (error) {
    console.error("❌ Erreur lecture invitation :", error);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}

export async function POST(req, { params }) {
  try {
    await dbConnect();
    const { token } = await params;
    const invitation = await findValidInvitation(token);

    if (!invitation) {
      return NextResponse.json({ message: "Invitation invalide ou expirée" }, { status: 404 });
    }

    const formData = await req.formData();
    const password = String(formData.get("password") || "");
    const confirmPassword = String(formData.get("confirmPassword") || "");
    const phone = String(formData.get("phone") || invitation.phone || "").trim().slice(0, 30);
    const gender = ["male", "female", "other", "prefer_not_to_say", ""].includes(String(formData.get("gender") || ""))
      ? String(formData.get("gender") || "")
      : invitation.gender || "";
    const address = sanitizeHtml(String(formData.get("address") || ""), { allowedTags: [], allowedAttributes: {} }).trim().slice(0, 300);
    const dateOfBirthRaw = String(formData.get("dateOfBirth") || "");
    const dateOfBirth = dateOfBirthRaw ? new Date(dateOfBirthRaw) : null;
    const profilePhoto = formData.get("profileImage");

    if (!password || password !== confirmPassword) {
      return NextResponse.json({ message: "Les mots de passe ne correspondent pas" }, { status: 400 });
    }
    if (!isStrongPassword(password)) {
      return NextResponse.json({ message: STRONG_PASSWORD_MESSAGE }, { status: 400 });
    }
    if (!phone) {
      return NextResponse.json({ message: "Le téléphone est requis" }, { status: 400 });
    }
    if (!isValidEmail(invitation.email)) {
      return NextResponse.json({ message: "Email d’invitation invalide" }, { status: 400 });
    }

    const existingVolunteer = await Volunteer.findOne({ email: invitation.email });
    const existingUser = await User.findOne({ email: invitation.email });
    if (existingVolunteer || existingUser) {
      return NextResponse.json({ message: "Un compte existe déjà avec cet email" }, { status: 400 });
    }

    const volunteer = await Volunteer.create({
      firstName: invitation.firstName,
      lastName: invitation.lastName,
      email: invitation.email,
      password,
      phone,
      gender,
      dateOfBirth,
      address,
      role: "volunteer",
      status: "validated",
      isValidated: true,
      isAvailable: false,
    });

    const user = await User.create({
      firstName: invitation.firstName,
      lastName: invitation.lastName,
      email: invitation.email,
      password,
      phone,
      gender,
      dateOfBirth,
      address,
      role: "volunteer",
      status: "validated",
      isValidated: true,
      legacyModel: "Volunteer",
      legacyId: volunteer._id,
    });

    let profileImage = "";
    if (profilePhoto instanceof File && profilePhoto.size > 0) {
      const upload = await uploadImageToCloudinary(profilePhoto, {
        role: "volunteer",
        userId: volunteer._id,
        context: "profile",
      });
      profileImage = upload.url;
      await Promise.all([
        Volunteer.findByIdAndUpdate(volunteer._id, { profileImage }),
        User.findByIdAndUpdate(user._id, { profileImage }),
      ]);
    }

    await VolunteerProfile.findOneAndUpdate(
      { userId: user._id },
      {
        userId: user._id,
        legacyVolunteerId: volunteer._id,
        gender,
        dateOfBirth,
        address,
        isAvailable: false,
      },
      { upsert: true, new: true }
    );

    invitation.status = "accepted";
    invitation.acceptedAt = new Date();
    invitation.acceptedVolunteerId = volunteer._id;
    invitation.acceptedUserId = user._id;
    await invitation.save();

    const authToken = jwt.sign(
      { id: user._id, role: "volunteer", userModel: "User" },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    const cookieStore = await cookies();
    cookieStore.set("volunteerToken", authToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Lax",
      path: "/",
      maxAge: 60 * 60 * 24,
    });

    return NextResponse.json({ message: "Profil complété", redirectTo: "/volunteers/dashboard" }, { status: 201 });
  } catch (error) {
    console.error("❌ Erreur finalisation invitation :", error);
    return NextResponse.json({ message: error.message || "Erreur serveur" }, { status: 500 });
  }
}
