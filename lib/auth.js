import jwt from "jsonwebtoken";
import Volunteer from "@/models/Volunteer";
import Admin from "@/models/Admin";
import dbConnect from "@/lib/dbConnect";
import { cookies } from 'next/headers';

export async function getToken(expectedRole = null) {
  try {
    await dbConnect();

    const cookieStore = await cookies(); // 🔥 await ici obligatoire

    const adminToken = cookieStore.get("adminToken");
    const volunteerToken = cookieStore.get("volunteerToken");

    if (adminToken) {
      const decoded = jwt.verify(adminToken.value, process.env.JWT_SECRET);
      const admin = await Admin.findById(decoded.id).select("-password");
      if (!admin) {
        throw new Error("Admin introuvable");
      }
      if (expectedRole && expectedRole !== "admin") {
        throw new Error("Rôle non autorisé");
      }
      return { ...admin.toObject(), role: "admin" };
    }

    if (volunteerToken) {
      const decoded = jwt.verify(volunteerToken.value, process.env.JWT_SECRET);
      const volunteer = await Volunteer.findById(decoded.id).select("-password");
      if (!volunteer) {
        throw new Error("Bénévole introuvable");
      }
      if (expectedRole && expectedRole !== "volunteer") {
        throw new Error("Rôle non autorisé");
      }
      return { ...volunteer.toObject(), role: "volunteer" };
    }

    throw new Error("Token non trouvé");
  } catch (error) {
    console.error("❌ Erreur dans getToken :", error.message);
    return null;
  }
}
