import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Comment from "@/models/Comment";
import { enforceRateLimit } from "@/lib/apiSecurity";

export async function PUT(req, { params }) {
  try {
    await dbConnect();
    const limited = enforceRateLimit(req, {
      key: "comment-like",
      limit: 60,
      windowMs: 60 * 60 * 1000,
    });
    if (limited) return limited;

    const { id } = await params;
    const { remove } = await req.json(); // remove = true si on veut retirer le like

    const operation = remove ? { $inc: { likes: -1 } } : { $inc: { likes: 1 } };
    let comment = await Comment.findOneAndUpdate(
      { _id: id, ...(remove ? { likes: { $gt: 0 } } : {}) },
      operation,
      { new: true }
    );

    if (!comment) {
      return NextResponse.json(
        { message: "Commentaire non trouvé" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        message: remove ? "Like retiré" : "Like ajouté",
        likes: comment.likes,
      },
      { status: 200 }
    );

  } catch (error) {
    console.error("Erreur PUT like commentaire :", error);

    return NextResponse.json(
      { message: "Erreur serveur" },
      { status: 500 }
    );
  }
}
