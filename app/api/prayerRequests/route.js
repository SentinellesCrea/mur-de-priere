import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import PrayerRequest from "@/models/PrayerRequest";
import sendNotification from "@/lib/sendNotification";
import { cookies } from "next/headers";
import { enforceRateLimit } from "@/lib/apiSecurity";
import mongoose from "mongoose";

const PRAYER_EDIT_WINDOW_MS = 48 * 60 * 60 * 1000;


// 🔍 GET — Récupérer les demandes de prière avec pagination
export async function GET(req) {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);

    // page actuelle
    const page = Math.max(1, Number(searchParams.get("page")) || 1);

    // nombre de prières par page
    const limit = Math.min(50, Math.max(1, Number(searchParams.get("limit")) || 4));

    const skip = (page - 1) * limit;


    /* ===============================
       RÉCUPÉRATION DES PRIÈRES
    =============================== */

    const requests = await PrayerRequest.find({
      deletedByAuthorAt: null,
      $or: [
        { rejectedAt: { $exists: false } },
        { rejectedAt: null },
      ],
    })
      .select(
        "name email phone prayerRequest notify wantsVolunteer isUrgent nombrePriants datePublication category subcategory allowComments isAnswered createdAt +authorToken"
      )
      .sort({ datePublication: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const cookieStore = await cookies();
    const now = Date.now();

    requests.forEach((prayer) => {
      const authorToken = cookieStore.get(`prayerAuthorToken_${prayer._id}`)?.value;
      const publishedAt = new Date(prayer.datePublication || prayer.createdAt).getTime();
      const editExpiresAt = publishedAt + PRAYER_EDIT_WINDOW_MS;

      prayer.canEdit = Boolean(
        authorToken &&
        prayer.authorToken &&
        authorToken === prayer.authorToken &&
        Number.isFinite(publishedAt) &&
        editExpiresAt > now
      );
      prayer.editExpiresAt = new Date(editExpiresAt);
      if (prayer.canEdit) {
        prayer.editableData = {
          name: prayer.name,
          email: prayer.email || "",
          phone: prayer.phone || "",
          prayerRequest: prayer.prayerRequest,
          notify: prayer.notify === true,
          wantsVolunteer: prayer.wantsVolunteer === true,
          isUrgent: prayer.isUrgent === true,
          category: prayer.category,
          subcategory: prayer.subcategory || "",
          allowComments: prayer.allowComments !== false,
        };
      }

      delete prayer.authorToken;
      delete prayer.email;
      delete prayer.phone;
      delete prayer.notify;
      delete prayer.wantsVolunteer;
      delete prayer.isUrgent;
    });


    /* ===============================
       NOMBRE TOTAL POUR PAGINATION
    =============================== */

    const totalPrayers = await PrayerRequest.countDocuments({
      deletedByAuthorAt: null,
      $or: [
        { rejectedAt: { $exists: false } },
        { rejectedAt: null },
      ],
    });


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
    const limited = enforceRateLimit(req, {
      key: "pray-counter",
      limit: 10,
      windowMs: 60 * 60 * 1000,
    });
    if (limited) return limited;

    const { id } = await req.json();

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ message: "ID invalide" }, { status: 400 });
    }

    const prayer = await PrayerRequest.findOneAndUpdate(
      {
        _id: id,
        deletedByAuthorAt: null,
        $or: [
          { rejectedAt: { $exists: false } },
          { rejectedAt: null },
        ],
      },
      { $inc: { nombrePriants: 1 } },
      { new: true }
    );
    if (!prayer) {
      return NextResponse.json({ message: "Demande non trouvée" }, { status: 404 });
    }

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
