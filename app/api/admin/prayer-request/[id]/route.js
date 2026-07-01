import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import PrayerRequest from "@/models/PrayerRequest";
import Volunteer from "@/models/Volunteer";
import { requireAuth } from "@/lib/auth";
import { deletePrayerById } from "@/lib/deletePrayer";

function clearAssignmentFields(prayer) {
  prayer.assignedTo = null;
  prayer.reserveTo = null;
  prayer.isAssigned = false;
  prayer.assignedBy = null;
  prayer.assignedByRole = undefined;
  prayer.assignedAt = null;
  prayer.delegatedBySupervisor = null;
  prayer.delegatedAt = null;
}

export async function PATCH(req, { params }) {
  await dbConnect();
  const admin = await requireAuth("admin");
  if (!admin) return NextResponse.json({ message: "Non autorisé" }, { status: 401 });
  const { id } = await params;
  const prayer = await PrayerRequest.findByIdAndUpdate(
    id,
    { isModerated: true, needsReview: false },
    { new: true }
  );
  if (!prayer) return NextResponse.json({ message: "Demande non trouvée" }, { status: 404 });
  return NextResponse.json({ message: "Demande approuvée" });
}

export async function PUT(req, { params }) {
  try {
    await dbConnect();

    const admin = await requireAuth("admin", req);
    if (!admin) {
      return NextResponse.json({ message: "Non autorisé" }, { status: 401 });
    }

    const { id } = await params;
    const { action, volunteerId, reopenMode } = await req.json();

    if (!id || !action) {
      return NextResponse.json({ message: "Action ou ID manquant" }, { status: 400 });
    }

    const prayer = await PrayerRequest.findById(id);
    if (!prayer) {
      return NextResponse.json({ message: "Demande non trouvée" }, { status: 404 });
    }

    if (action === "approve") {
      prayer.isModerated = true;
      prayer.needsReview = false;
      prayer.rejectedAt = undefined;
      prayer.rejectedBy = undefined;
    }

    if (action === "reject") {
      prayer.rejectedAt = new Date();
      prayer.needsReview = false;
      clearAssignmentFields(prayer);
    }

    if (action === "restore") {
      prayer.rejectedAt = undefined;
      prayer.rejectedBy = undefined;
      prayer.isModerated = true;
      prayer.needsReview = false;
    }

    if (action === "assign") {
      if (!volunteerId) {
        return NextResponse.json({ message: "Bénévole ou superviseur requis" }, { status: 400 });
      }

      const volunteer = await Volunteer.findOne({
        _id: volunteerId,
        role: { $in: ["volunteer", "supervisor"] },
        isValidated: true,
        status: { $ne: "rejected" },
      }).select("role");

      if (!volunteer) {
        return NextResponse.json({ message: "Responsable introuvable ou non validé" }, { status: 404 });
      }

      prayer.assignedTo = volunteer._id;
      prayer.reserveTo = null;
      prayer.assignedBy = admin._id;
      prayer.assignedByRole = "admin";
      prayer.assignedAt = new Date();
      prayer.delegatedBySupervisor = null;
      prayer.delegatedAt = null;
      prayer.isAssigned = volunteer.role === "supervisor";
      prayer.isAnswered = false;
      prayer.finishedBy = null;
      prayer.isModerated = true;
      prayer.needsReview = false;
      prayer.rejectedAt = undefined;
      prayer.rejectedBy = undefined;
    }

    if (action === "release") {
      clearAssignmentFields(prayer);
    }

    if (action === "archive") {
      prayer.isAnswered = true;
      prayer.finishedBy = prayer.assignedTo || prayer.reserveTo || null;
    }

    if (action === "reopen") {
      prayer.isAnswered = false;
      prayer.finishedBy = null;

      if (reopenMode === "unassign") {
        clearAssignmentFields(prayer);
      }
    }

    const allowedActions = ["approve", "reject", "restore", "assign", "release", "archive", "reopen"];
    if (!allowedActions.includes(action)) {
      return NextResponse.json({ message: "Action inconnue" }, { status: 400 });
    }

    await prayer.save();

    const updatedPrayer = await PrayerRequest.findById(prayer._id)
      .populate({ path: "assignedTo", select: "firstName lastName email role isValidated status" })
      .populate({ path: "reserveTo", select: "firstName lastName email role isValidated status" })
      .populate({ path: "finishedBy", select: "firstName lastName email role isValidated status" })
      .populate({ path: "delegatedBySupervisor", select: "firstName lastName email role isValidated status" })
      .lean();

    return NextResponse.json({
      message: "Action admin appliquée",
      prayer: updatedPrayer,
    });
  } catch (error) {
    console.error("Erreur PUT /admin/prayer-request/[id]:", error);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    await dbConnect();

    const admin = await requireAuth("admin", req);
    if (!admin) {
      return NextResponse.json({ message: "Non autorisé" }, { status: 401 });
    }

    const { id } = await params;
    if (!id) {
      return NextResponse.json({ message: "ID manquant" }, { status: 400 });
    }

    const deleted = await deletePrayerById(id);
    if (!deleted) {
      return NextResponse.json({ message: "Demande non trouvée" }, { status: 404 });
    }

    return NextResponse.json({ message: "Demande supprimée" }, { status: 200 });
  } catch (error) {
    console.error("Erreur DELETE /admin/prayer-request/[id]:", error);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}
