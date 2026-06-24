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
    const adminToken = cookieStore.get("adminToken")?.value;

    if ((!expectedRole || expectedRole === "admin") && adminToken) {
      const decoded = jwt.verify(adminToken, process.env.JWT_SECRET, {
        algorithms: ["HS256"],
      });
      const admin = await Admin.findById(decoded.id).select("-password");

      if (!admin || decoded.role !== "admin") {
        throw new Error("Administrateur non autorisé");
      }

      return { ...admin.toObject(), role: "admin" };
    }

    /* ============== VOLUNTEER / SUPERVISOR ============== */
    const volunteerToken = cookieStore.get("volunteerToken")?.value;

    if (expectedRole !== "admin" && volunteerToken) {
      const decoded = jwt.verify(volunteerToken, process.env.JWT_SECRET, {
        algorithms: ["HS256"],
      });
      const volunteer = await Volunteer.findById(decoded.id).select("-password");

      if (!volunteer) throw new Error("Bénévole introuvable");

      if (!volunteer.isValidated || volunteer.status === "rejected") {
        throw new Error("Compte bénévole désactivé ou non validé");
      }

      const role = volunteer.role;

      if (expectedRole === "supervisor" && role !== "supervisor") {
        throw new Error("Rôle non autorisé");
      }

      if (expectedRole === "volunteer" && !["volunteer", "supervisor"].includes(role)) {
        throw new Error("Rôle non autorisé");
      }

      return { ...volunteer.toObject(), role };
    }

    /* ================= AUCUN TOKEN ================= */

    throw new Error("Token non trouvé");

  } catch (err) {
    console.error("❌ Erreur requireAuth :", err.message);
    return null;
  }
}
