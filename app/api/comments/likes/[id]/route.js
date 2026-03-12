import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Comment from "@/models/Comment";

export async function PUT(req, { params }) {
  try {
    await dbConnect();

    const { id } = await params;
    const { remove } = await req.json(); // remove = true si on veut retirer le like

    const comment = await Comment.findById(id);

    if (!comment) {
      return NextResponse.json(
        { message: "Commentaire non trouvé" },
        { status: 404 }
      );
    }

    if (remove) {
      comment.likes = Math.max(0, (comment.likes || 0) - 1);
    } else {
      comment.likes = (comment.likes || 0) + 1;
    }

    await comment.save();

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