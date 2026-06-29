// /lib/auth.js
import jwt from "jsonwebtoken";
import Volunteer from "@/models/Volunteer";
import Admin from "@/models/Admin";
import dbConnect from "@/lib/dbConnect";
import { cookies } from "next/headers";
import { ensureRoleProfile, findUserById, publicAuthUser } from "@/lib/teamUser";

function clearAuthCookie(cookieStore, name) {
  cookieStore.set(name, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

function isJwtError(error) {
  return ["JsonWebTokenError", "TokenExpiredError", "NotBeforeError"].includes(error?.name);
}

export async function requireAuth(expectedRole = null) {
  let cookieStore;

  try {
    await dbConnect();

    cookieStore = await cookies();

    /* ================= ADMIN ================= */
    const adminToken = cookieStore.get("adminToken")?.value;

    if ((!expectedRole || expectedRole === "admin") && adminToken) {
      let decoded;
      try {
        decoded = jwt.verify(adminToken, process.env.JWT_SECRET, {
          algorithms: ["HS256"],
        });
      } catch (error) {
        if (isJwtError(error)) {
          clearAuthCookie(cookieStore, "adminToken");
          if (!expectedRole) {
            // Un vieux cookie admin ne doit pas bloquer une session bénévole/superviseur valide.
          } else {
            return null;
          }
        } else {
          throw error;
        }
      }

      if (!decoded) {
        // Continue vers le token bénévole/superviseur si requireAuth() accepte tous les rôles.
      } else {
        const user = await findUserById(decoded.id);
        if (user?.role === "admin") {
          if (user.deletedAt || user.status !== "validated" || !user.isValidated) return null;
          const profile = await ensureRoleProfile(user);
          return publicAuthUser(user, profile);
        }

        const admin = await Admin.findById(decoded.id).select("-password");

        if (!admin || decoded.role !== "admin") {
          return null;
        }

        return { ...admin.toObject(), role: "admin" };
      }
    }

    /* ============== VOLUNTEER / SUPERVISOR ============== */
    const volunteerToken = cookieStore.get("volunteerToken")?.value;

    if (expectedRole !== "admin" && volunteerToken) {
      let decoded;
      try {
        decoded = jwt.verify(volunteerToken, process.env.JWT_SECRET, {
          algorithms: ["HS256"],
        });
      } catch (error) {
        if (isJwtError(error)) {
          clearAuthCookie(cookieStore, "volunteerToken");
          return null;
        }
        throw error;
      }
      const user = await findUserById(decoded.id);
      if (user && ["volunteer", "supervisor"].includes(user.role)) {
        if (user.deletedAt || user.status === "rejected" || !user.isValidated) return null;
        if (expectedRole === "supervisor" && user.role !== "supervisor") return null;
        if (expectedRole === "volunteer" && !["volunteer", "supervisor"].includes(user.role)) return null;

        const profile = await ensureRoleProfile(user);
        return publicAuthUser(user, profile);
      }

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

    return null;

  } catch (err) {
    console.error("❌ Erreur requireAuth :", err.message);
    return null;
  }
}
