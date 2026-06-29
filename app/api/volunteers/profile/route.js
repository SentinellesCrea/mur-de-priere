import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Volunteer from "@/models/Volunteer";
import User from "@/models/User";
import VolunteerProfile from "@/models/VolunteerProfile";
import { requireAuth } from "@/lib/auth";
import bcrypt from "bcryptjs";
import { isValidEmail } from "@/lib/apiSecurity";
import sanitizeHtml from "sanitize-html";
import { isStrongPassword, STRONG_PASSWORD_MESSAGE } from "@/lib/passwordSecurity";

const ALLOWED_GENDERS = ["male", "female", "other", "prefer_not_to_say", ""];

export async function PUT(req) {
  try {
    await dbConnect();

    const volunteer = await requireAuth("volunteer", req);
    if (!volunteer) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const formData = await req.formData();
    const firstName = sanitizeHtml(String(formData.get("firstName") || ""), { allowedTags: [], allowedAttributes: {} }).trim().slice(0, 80);
    const lastName = sanitizeHtml(String(formData.get("lastName") || ""), { allowedTags: [], allowedAttributes: {} }).trim().slice(0, 80);
    const email = String(formData.get("email") || "").trim().toLowerCase();
    const phone = String(formData.get("phone") || "").trim().slice(0, 30);
    const genderRaw = String(formData.get("gender") || "");
    const gender = ALLOWED_GENDERS.includes(genderRaw) ? genderRaw : "";
    const address = sanitizeHtml(String(formData.get("address") || ""), { allowedTags: [], allowedAttributes: {} }).trim().slice(0, 300);
    const dateOfBirthRaw = String(formData.get("dateOfBirth") || "");
    const dateOfBirth = dateOfBirthRaw ? new Date(dateOfBirthRaw) : null;
    const password = String(formData.get("password") || "");

    const updateData = {};
    if (firstName) updateData.firstName = firstName;
    if (lastName) updateData.lastName = lastName;
    if (email) {
      if (!isValidEmail(email)) return NextResponse.json({ error: "Email invalide" }, { status: 400 });
      const [existingVolunteer, existingUser] = await Promise.all([
        Volunteer.findOne({ email, _id: { $ne: volunteer._id } }).select("_id"),
        volunteer.userId
          ? User.findOne({ email, _id: { $ne: volunteer.userId } }).select("_id")
          : User.findOne({ email }).select("_id"),
      ]);

      if (existingVolunteer || existingUser) {
        return NextResponse.json({ error: "Cet email est déjà utilisé" }, { status: 400 });
      }

      updateData.email = email;
    }
    if (phone) updateData.phone = phone;
    if (gender) updateData.gender = gender;
    if (address) updateData.address = address;
    if (dateOfBirthRaw) {
      if (Number.isNaN(dateOfBirth.getTime())) {
        return NextResponse.json({ error: "Date de naissance invalide" }, { status: 400 });
      }
      updateData.dateOfBirth = dateOfBirth;
    }

    if (password) {
      if (!isStrongPassword(password)) {
        return NextResponse.json({ error: STRONG_PASSWORD_MESSAGE }, { status: 400 });
      }
      const hashed = await bcrypt.hash(password, 10);
      updateData.password = hashed;
    }

    const [updated] = await Promise.all([
      Volunteer.findByIdAndUpdate(volunteer._id, updateData, {
        new: true,
      }).select("-password"),
      volunteer.userId ? User.findByIdAndUpdate(volunteer.userId, updateData) : Promise.resolve(),
      volunteer.userId
        ? VolunteerProfile.findOneAndUpdate(
            { userId: volunteer.userId },
            {
              ...(gender ? { gender } : {}),
              ...(address ? { address } : {}),
              ...(dateOfBirthRaw ? { dateOfBirth } : {}),
            },
            { upsert: true, new: true }
          )
        : Promise.resolve(),
    ]);

    if (!updated) {
      return NextResponse.json({ error: "Bénévole introuvable" }, { status: 404 });
    }

    return NextResponse.json(updated, { status: 200 });
  } catch (error) {
    console.error("Erreur PUT /volunteers/profile :", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function GET() {
  try {
    await dbConnect();

    const token = await requireAuth("volunteer");
    if (!token) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

    const volunteer = await Volunteer.findById(token._id).select("-password");
    if (!volunteer) return NextResponse.json({ error: "Introuvable" }, { status: 404 });

    return NextResponse.json(volunteer);
  } catch (err) {
    console.error("Erreur GET profile:", err.message);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
