import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import PrayerRequest from "@/models/PrayerRequest";
import sendNotification from "@/lib/sendNotification";
import { sendEmail } from "@/lib/sendEmail";
import { moderateText } from "@/lib/moderation";
import crypto from "crypto";                 // ✅ AJOUT
import { cookies } from "next/headers";      // ✅ AJOUT




// 🔍 GET — Récupérer les demandes de prière avec pagination
export async function GET(req) {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);

    // page actuelle
    const page = Number(searchParams.get("page")) || 1;

    // nombre de prières par page
    const limit = Number(searchParams.get("limit")) || 4;

    const skip = (page - 1) * limit;


    /* ===============================
       RÉCUPÉRATION DES PRIÈRES
    =============================== */

    const requests = await PrayerRequest.find()
      .sort({ datePublication: -1 })
      .skip(skip)
      .limit(limit)
      .lean();


    /* ===============================
       NOMBRE TOTAL POUR PAGINATION
    =============================== */

    const totalPrayers = await PrayerRequest.countDocuments();


    return NextResponse.json({
      prayers: requests,

      pagination: {
        page,
        limit,
        totalPrayers,
        totalPages: Math.ceil(totalPrayers / limit),
        hasNextPage: page < Math.ceil(totalPrayers / limit),
      },
    });

  } catch (error) {

    console.error(
      "Erreur GET /prayerRequests :",
      error
    );

    return NextResponse.json(
      { message: "Erreur serveur" },
      { status: 500 }
    );
  }
}



// 🙏 PUT — Incrémenter le nombre de priants
export async function PUT(req) {
  try {
    await dbConnect();
    const { id } = await req.json();

    if (!id) {
      return NextResponse.json({ message: "ID manquant" }, { status: 400 });
    }

    const prayer = await PrayerRequest.findById(id);
    if (!prayer) {
      return NextResponse.json({ message: "Demande non trouvée" }, { status: 404 });
    }

    prayer.nombrePriants = (prayer.nombrePriants || 0) + 1;
    await prayer.save();

    if (prayer.notify && prayer.email) {
      try {
        await sendNotification(prayer.email, prayer.name);
      } catch (err) {
        console.error("Erreur d'envoi de l'email :", err);
      }
    }

    return NextResponse.json(
      { message: "Mise à jour réussie", nombrePriants: prayer.nombrePriants },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erreur PUT /prayerRequests :", error);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}
