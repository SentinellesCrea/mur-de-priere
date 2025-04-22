// 🔒 /api/admin/volunteer/[id]
import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Volunteer from "@/models/Volunteer";
import { getToken } from "@/lib/auth";

export const DELETE = async (req, { params }) => {
  try {
    await dbConnect();

    // ✅ Vérifie bien que seul un admin peut supprimer
    const admin = await getToken("admin", req);
    if (!admin) {
      return NextResponse.json({ message: "Non autorisé" }, { status: 401 });
    }

    const { id } = params;
    const deleted = await Volunteer.findByIdAndDelete(id);

    if (!deleted) {
      return NextResponse.json({ message: "Bénévole introuvable" }, { status: 404 });
    }

    return NextResponse.json({ message: "Bénévole supprimé" });
  } catch (err) {
    console.error("Erreur DELETE bénévole :", err);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
};

export const PUT = async (req, { params }) => {
  try {
    await dbConnect();

    // ✅ Vérifie bien que seul un admin peut effectuer cette action
    const admin = await getToken("admin", req);
    if (!admin) {
      return NextResponse.json({ message: "Non autorisé" }, { status: 401 });
    }

    const { id } = params;
    
    // Mettre à jour le bénévole avec les nouveaux paramètres
    const updatedVolunteer = await Volunteer.findByIdAndUpdate(
      id,
      { isValidated: false, status: "désactivé" }, // Mise à jour des champs
      { new: true }  // Retourner le bénévolat mis à jour
    );

    if (!updatedVolunteer) {
      return NextResponse.json({ message: "Bénévole introuvable" }, { status: 404 });
    }

    return NextResponse.json({ message: "Bénévole désactivé", volunteer: updatedVolunteer });
  } catch (err) {
    console.error("Erreur de désactivation du bénévole :", err);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
};