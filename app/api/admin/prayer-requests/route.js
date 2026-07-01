import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import PrayerRequest from "@/models/PrayerRequest";
import "@/models/Volunteer";
import { requireAuth } from "@/lib/auth";

export async function GET(req) {
  await dbConnect();
  const admin = await requireAuth("admin", req);
  if (!admin) return NextResponse.json({ message: "Non autorisé" }, { status: 401 });

  const prayers = await PrayerRequest.find({})
    .select(
      "name email phone prayerRequest notify wantsVolunteer isUrgent nombrePriants datePublication " +
        "reserveTo assignedTo assignedBy assignedByRole assignedAt delegatedBySupervisor delegatedAt finishedBy " +
        "isAnswered isAssigned isModerated needsReview rejectedAt rejectedBy category subcategory allowComments createdAt updatedAt"
    )
    .populate({ path: "assignedTo", select: "firstName lastName email role isValidated status" })
    .populate({ path: "reserveTo", select: "firstName lastName email role isValidated status" })
    .populate({ path: "finishedBy", select: "firstName lastName email role isValidated status" })
    .populate({ path: "delegatedBySupervisor", select: "firstName lastName email role isValidated status" })
    .sort({ datePublication: -1, createdAt: -1 })
    .lean();

  return NextResponse.json(prayers);
}
