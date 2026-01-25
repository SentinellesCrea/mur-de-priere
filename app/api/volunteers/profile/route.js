import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Volunteer from "@/models/Volunteer";
import { requireAuth } from "@/lib/auth";
import bcrypt from "bcryptjs";

export async function PUT(req) {
  try {
    await dbConnect();

    const volunteer = await requireAuth("volunteer", req);
    if (!volunteer) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const formData = await req.formData();
    const firstName = formData.get("firstName");
    const email = formData.get("email");
    const phone = formData.get("phone");
    const password = formData.get("password");

    const updateData = {};
    if (firstName) updateData.firstName = firstName;
    if (email) updateData.email = email;
    if (phone) updateData.phone = phone;

    if (password) {
      const hashed = await bcrypt.hash(password, 10);
      updateData.password = hashed;
    }

    const updated = await Volunteer.findByIdAndUpdate(volunteer._id, updateData, {
      new: true,
    }).select("-password");

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

    const volunteer = await Volunteer.findById(token.id).select("-password");
    if (!volunteer) return NextResponse.json({ error: "Introuvable" }, { status: 404 });

    return NextResponse.json(volunteer);
  } catch (err) {
    console.error("Erreur GET profile:", err.message);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
