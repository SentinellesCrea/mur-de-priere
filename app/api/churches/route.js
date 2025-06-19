import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Church from "@/models/Church";

export async function GET(request) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const name = searchParams.get("name") || "";
    const lat = searchParams.get("lat");
    const lng = searchParams.get("lng");
    const radius = parseFloat(searchParams.get("radius") || "5"); // km

    // Recherche par position (géolocalisation)
    if (lat && lng) {
      console.log(`🔍 Recherche géospatiale autour de (${lat}, ${lng}) rayon ${radius}km`);

      const churches = await Church.find({
        isValidated: true,
        coordinates: {
          $near: {
            $geometry: {
              type: "Point",
              coordinates: [parseFloat(lng), parseFloat(lat)],
            },
            $maxDistance: radius * 1000, // en mètres
          },
        },
      });

      return NextResponse.json(churches);
    }

    // Recherche par nom
    const churches = await Church.find({
      isValidated: true,
      name: { $regex: name, $options: "i" },
    });

    return NextResponse.json(churches);
  } catch (error) {
    console.error("❌ Erreur GET /api/churches :", error);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}



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

    const fullAddress = `${address}, ${postalCode || ""} ${city || ""}, ${country || ""}`;

    // 🌍 Appel à l’API Nominatim
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(fullAddress)}&format=json&limit=1`,
      {
        headers: { "User-Agent": "MurDePriere/1.0 (mur-de-priere.com)" },
      }
    );

    const results = await response.json();

    if (!results || results.length === 0) {
      return NextResponse.json({ message: "Adresse introuvable. Veuillez vérifier." }, { status: 400 });
    }

    const lat = parseFloat(results[0].lat);
    const lng = parseFloat(results[0].lon);

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
      coordinates: {
        type: "Point",
        coordinates: [lng, lat], // GeoJSON: [longitude, latitude]
      },
      isValidated: false,
    });

    await newChurch.save();

    return NextResponse.json({ message: "Église enregistrée avec succès !" }, { status: 201 });
  } catch (error) {
    console.error("Erreur POST /api/churches :", error);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}

