import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Comment from "@/models/Comment";
import PrayerRequest from "@/models/PrayerRequest";
import { sendEmail } from "@/lib/sendEmail";
import { cookies } from "next/headers";
import crypto from "crypto";
import sanitizeHtml from "sanitize-html";
import { enforceRateLimit } from "@/lib/apiSecurity";
import mongoose from "mongoose";

function getCurrentCycleStart() {
  const now = new Date();
  const cycleStart = new Date(now);

  cycleStart.setHours(20, 0, 0, 0);

  if (now.getHours() < 20) {
    cycleStart.setDate(cycleStart.getDate() - 1);
  }

  return cycleStart;
}

export async function POST(req) {
  try {
    await dbConnect();
    const limited = enforceRateLimit(req, {
      key: "create-comment",
      limit: 12,
      windowMs: 60 * 60 * 1000,
    });
    if (limited) return limited;

    const { prayerRequestId, authorName, text, parentComment } = await req.json();

    if (!prayerRequestId || !mongoose.Types.ObjectId.isValid(prayerRequestId) || !text?.trim()) {
      return NextResponse.json(
        { message: "Champs requis manquants ou invalides." },
        { status: 400 }
      );
    }

    const safeText = sanitizeHtml(text.trim(), {
      allowedTags: [],
      allowedAttributes: {},
    });
    const safeAuthorName = sanitizeHtml(String(authorName || ""), {
      allowedTags: [],
      allowedAttributes: {},
    }).trim().slice(0, 50);

    if (!safeText) {
      return NextResponse.json(
        { message: "Le commentaire est vide ou invalide." },
        { status: 400 }
      );
    }

    if (safeText.length > 500) {
      return NextResponse.json(
        { message: "Le commentaire est trop long." },
        { status: 400 }
      );
    }

    const prayer = await PrayerRequest.findOne({
      _id: prayerRequestId,
      $or: [
        { isModerated: true },
        { isModerated: { $exists: false } },
      ],
    }).select("+authorToken");

    if (!prayer || prayer.allowComments === false) {
      return NextResponse.json(
        { message: "Commentaires désactivés pour cette prière." },
        { status: 403 }
      );
    }

    if (parentComment) {
      if (!mongoose.Types.ObjectId.isValid(parentComment)) {
        return NextResponse.json({ message: "Commentaire parent invalide." }, { status: 400 });
      }

      const validParent = await Comment.exists({
        _id: parentComment,
        prayerRequest: prayerRequestId,
        isModerated: true,
      });
      if (!validParent) {
        return NextResponse.json({ message: "Commentaire parent invalide." }, { status: 400 });
      }
    }

    /* ================= IDENTIFICATION VISITEUR ================= */

    const cookieStore = await cookies();
    let visitorToken = cookieStore.get("prayerVisitorToken")?.value;

    if (!visitorToken) {
      visitorToken = crypto.randomUUID();

      cookieStore.set("prayerVisitorToken", visitorToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 365,
      });
    }


    let authorToken = cookieStore.get("commentAuthorToken")?.value;

    if (!authorToken) {
      authorToken = crypto.randomUUID();

      cookieStore.set("commentAuthorToken", authorToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 365,
      });
    }

    /* ================= IDENTIFICATION MACHINE ================= */

    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "unknown";

    const ipHash = crypto
      .createHmac("sha256", process.env.JWT_SECRET)
      .update(ip)
      .digest("hex");

    const userAgent = req.headers.get("user-agent") || "";
    const language = req.headers.get("accept-language") || "";

    const fingerprint = crypto
      .createHmac("sha256", process.env.JWT_SECRET)
      .update(userAgent + language)
      .digest("hex");

    /* ================= ANTI-SPAM ================= */

    if (visitorToken) {
      const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);

      const recentComments = await Comment.countDocuments({
        prayerRequest: prayerRequestId,
        $or: [
          { visitorToken },
          { ipHash },
          { fingerprint },
        ],
        createdAt: { $gte: twoHoursAgo },
      });

      if (recentComments >= 3) {
        return NextResponse.json(
          {
            message:
              "Vous avez déjà commenté plusieurs fois cette prière. Réessayez plus tard.",
          },
          { status: 429 }
        );
      }
    }

    /* ================= ENREGISTREMENT COMMENTAIRE ================= */

    const comment = new Comment({
      prayerRequest: prayerRequestId,
      parentComment: parentComment || null,
      authorName: safeAuthorName || "Un intercesseur anonyme",
      text: safeText,
      visitorToken,
      authorToken,
      ipHash,
      fingerprint,
      isModerated: true,
    });

    await comment.save();

    /* ================= IDENTIFICATION AUTEUR ================= */

    const prayerAuthorToken = cookieStore.get(`prayerAuthorToken_${prayerRequestId}`)?.value;
    const isAuthor =
      prayerAuthorToken &&
      prayer.authorToken &&
      prayerAuthorToken === prayer.authorToken;

    /* ================= GESTION EMAIL ================= */

    if (!isAuthor && prayer.email && prayer.email.trim() !== "") {
      try {
        const currentCycleStart = getCurrentCycleStart();

        const isNewCycle =
          !prayer.commentCycleStart ||
          prayer.commentCycleStart.getTime() !== currentCycleStart.getTime();

        if (isNewCycle) {
          prayer.commentCycleStart = currentCycleStart;
          prayer.dailyCommentCount = 1;

          const subject = "💬 Nouveau commentaire sur votre demande de prière";

          const html = `
            <h2>Quelqu’un a commenté votre prière 🙏</h2>
            <p><strong>Commentaire :</strong></p>
            <p>${safeText}</p>
          `;

          await sendEmail({
            to: prayer.email,
            subject,
            html,
          });
        } else {
          prayer.dailyCommentCount = (prayer.dailyCommentCount || 0) + 1;
        }

        await prayer.save();
      } catch (emailError) {
        console.error("❌ Erreur envoi email commentaire :", emailError);
      }
    }

    return NextResponse.json(
      { message: "Commentaire enregistré avec succès." },
      { status: 201 }
    );
  } catch (err) {
    console.error("❌ Erreur POST /api/comments :", err);

    return NextResponse.json(
      { message: "Erreur serveur." },
      { status: 500 }
    );
  }
}
