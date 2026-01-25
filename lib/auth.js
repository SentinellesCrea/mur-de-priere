// /lib/auth.js
import jwt from "jsonwebtoken";
import Volunteer from "@/models/Volunteer";
import Admin from "@/models/Admin";
import dbConnect from "@/lib/dbConnect";
import { cookies } from "next/headers";

export async function requireAuth(expectedRole = null) {
  try {
    await dbConnect();

    const cookieStore = await cookies();

    /* ================= ADMIN ================= */
    const adminToken = await cookieStore.get("adminToken")?.value;
    if (adminToken) {
      const decoded = jwt.verify(adminToken, process.env.JWT_SECRET);
      const admin = await Admin.findById(decoded.id).select("-password");
      if (!admin) throw new Error("Administrateur non trouvé");
      if (expectedRole && expectedRole !== "admin") {
        throw new Error("Rôle non autorisé");
      }
      return { ...admin.toObject(), role: "admin" };
    }

    /* ============== VOLUNTEER / SUPERVISOR ============== */
    const volunteerToken = await cookieStore.get("volunteerToken")?.value;
    if (!volunteerToken) throw new Error("Token non trouvé");

    const decoded = jwt.verify(volunteerToken, process.env.JWT_SECRET);
    const volunteer = await Volunteer.findById(decoded.id).select("-password");
    if (!volunteer) throw new Error("Bénévole introuvable");

    const role = volunteer.role;

    if (expectedRole === "supervisor" && role !== "supervisor") {
      throw new Error("Rôle non autorisé");
    }

    if (expectedRole === "volunteer" && !["volunteer", "supervisor"].includes(role)) {
      throw new Error("Rôle non autorisé");
    }

    return { ...volunteer.toObject(), role };

  } catch (err) {
    console.error("❌ Erreur requireAuth :", err.message);
    return null;
  }
}
