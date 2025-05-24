import jwt from "jsonwebtoken";
import Volunteer from "@/models/Volunteer";
import Admin from "@/models/Admin";
import dbConnect from "@/lib/dbConnect";
import { cookies } from "next/headers";

export async function getToken(expectedRole = null, req) {
  try {
    await dbConnect();

    const cookieHeader = req?.headers.get("cookie") || "";
    const cookieMap = Object.fromEntries(
      cookieHeader.split(";").map(c => {
        const [k, v] = c.trim().split("=");
        return [k, v];
      })
    );

    const volunteerToken = cookieMap["volunteerToken"];
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
    console.error("❌ Erreur dans getToken :", err.message);
    return null;
  }
}
