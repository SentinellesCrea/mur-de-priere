import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Comment from "@/models/Comment";
import PrayerRequest from "@/models/PrayerRequest";
import { sendEmail } from "@/lib/sendEmail";
import { cookies } from "next/headers";
import crypto from "crypto";
import sanitizeHtml from "sanitize-html";

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

    const { prayerRequestId, authorName, text, parentComment } = await req.json();

    if (!prayerRequestId || !text?.trim()) {
      return NextResponse.json(
        { message: "Champs requis manquants." },
        { status: 400 }
      );
    }

    const safeText = sanitizeHtml(text.trim());

    if (!safeText) {
      return NextResponse.json(
        { message: "Le commentaire est vide ou invalide." },
        { status: 400 }
      );
    }

    if (safeText.length > 300) {
      return NextResponse.json(
        { message: "Le commentaire est trop long." },
        { status: 400 }
      );
    }

    const prayer = await PrayerRequest.findById(prayerRequestId);

    if (!prayer || prayer.allowComments === false) {
      return NextResponse.json(
        { message: "Commentaires désactivés pour cette prière." },
        { status: 403 }
      );
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
      req.headers.get("x-forwarded-for") ||
      req.headers.get("x-real-ip") ||
      "unknown";

    const ipHash = crypto
      .createHash("sha256")
      .update(ip)
      .digest("hex");

    const userAgent = req.headers.get("user-agent") || "";
    const language = req.headers.get("accept-language") || "";

    const fingerprint = crypto
      .createHash("sha256")
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
      authorName: authorName?.trim() || "Un intercesseur anonyme",
      text: safeText,
      visitorToken,
      authorToken,
      ipHash,
      fingerprint,
      isModerated: true,
    });

    await comment.save();

    /* ================= IDENTIFICATION AUTEUR ================= */

    const isAuthor =
      visitorToken &&
      prayer.authorToken &&
      visitorToken === prayer.authorToken;

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