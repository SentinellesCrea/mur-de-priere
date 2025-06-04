import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Church from "@/models/Church";

// 🔍 GET : liste des églises validées
export async function GET(request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const name = searchParams.get("name") || "";

    const query = {
      isValidated: true,
      name: { $regex: name, $options: "i" },
    };

    const churches = await Church.find(query).select("name address coordinates");

    return NextResponse.json(churches);
  } catch (error) {
    console.error("Erreur GET /api/churches :", error);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}

// ✍️ POST : ajout d'une église
export async function POST(request) {
  try {
    await dbConnect();
    const body = await request.json();

    const {
      name,
      address,
      city,
      postalCode,
      country,
      email,
      phone,
      website,
      socialLinks,
    } = body;

    if (!name || !address) {
      return NextResponse.json({ message: "Champs requis manquants" }, { status: 400 });
    }

    const newChurch = new Church({
      name,
      address,
      city,
      postalCode,
      country,
      email,
      phone,
      website,
      socialLinks,
      isValidated: false, // ✅ nécessite validation admin
    });

    await newChurch.save();

    return NextResponse.json({ message: "Église enregistrée avec succès !" }, { status: 201 });
  } catch (error) {
    console.error("Erreur POST /api/churches :", error);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}
