import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import PrayerRequest from "@/models/PrayerRequest";
import { cookies } from "next/headers";

export async function PUT(req, { params }) {
  try {
    await dbConnect();

    const { id } = params;
    const body = await req.json();

    const cookieStore = await cookies();
    const token = cookieStore.get("prayerAuthorToken")?.value;

    if (!token) {
      return NextResponse.json(
        { message: "Non autorisé" },
        { status: 401 }
      );
    }

    const prayer = await PrayerRequest.findById(id);

    if (!prayer) {
      return NextResponse.json(
        { message: "Prière introuvable" },
        { status: 404 }
      );
    }

    if (prayer.authorToken !== token) {
      return NextResponse.json(
        { message: "Accès refusé" },
        { status: 403 }
      );
    }


    /* 🔒 Limite 48h */

    const now = new Date();
    const publishedAt = new Date(prayer.datePublication);

    const diffHours = (now - publishedAt) / (1000 * 60 * 60);

    if (diffHours > 48) {
      return NextResponse.json(
        { message: "Modification impossible après 48h." },
        { status: 403 }
      );
    }

    prayer.prayerRequest = body.prayerRequest || prayer.prayerRequest;
    prayer.category = body.category || prayer.category;
    prayer.subcategory = body.subcategory || prayer.subcategory;

    await prayer.save();

    return NextResponse.json({
      message: "Prière modifiée",
    });

  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { message: "Erreur serveur" },
      { status: 500 }
    );
  }
}




export async function DELETE(req, { params }) {
  try {
    await dbConnect();

    const { id } = params;

    const cookieStore = await cookies();
    const token = cookieStore.get("prayerAuthorToken")?.value;

    const prayer = await PrayerRequest.findById(id);

    if (!prayer) {
      return NextResponse.json(
        { message: "Prière introuvable" },
        { status: 404 }
      );
    }

    if (prayer.authorToken !== token) {
      return NextResponse.json(
        { message: "Accès refusé" },
        { status: 403 }
      );
    }

    await PrayerRequest.findByIdAndDelete(id);

    return NextResponse.json({
      message: "Prière supprimée",
    });

  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { message: "Erreur serveur" },
      { status: 500 }
    );
  }
}