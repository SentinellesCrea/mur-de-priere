import jwt from "jsonwebtoken";
import Volunteer from "@/models/Volunteer";
import Admin from "@/models/Admin";
import dbConnect from "@/lib/dbConnect";

export async function getToken(expectedRole, req) {
  try {
    // Connexion à la base de données
    await dbConnect();

    // Récupérer les cookies depuis les headers
    const cookieHeader = req.headers.get("cookie") || "";
    const cookies = Object.fromEntries(cookieHeader.split("; ").map(c => c.split("=")));

    // Log pour vérifier les cookies extraits
    console.log("Cookies extraits :", cookies);

    // Récupérer le token en fonction du rôle attendu (admin ou volunteer)
    const token =
      expectedRole === "admin"
        ? cookies["adminToken"]
        : cookies["volunteerToken"];

    if (!token) {
      console.log(`Token ${expectedRole} introuvable`);
      throw new Error("Token non trouvé");
    }

    // Décoder le token avec JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Log pour vérifier le contenu du token décodé
    console.log(`Token décodé pour ${expectedRole} :`, decoded);

    // Vérification du rôle et récupération de l'utilisateur associé
    if (expectedRole === "admin") {
      const admin = await Admin.findById(decoded.id).select("-password");
      if (!admin) {
        console.log("Admin introuvable");
        throw new Error("Admin introuvable");
      }
      return { ...admin.toObject(), role: "admin" };
    }

    if (expectedRole === "volunteer") {
      const volunteer = await Volunteer.findById(decoded.id).select("-password");
      if (!volunteer) {
        console.log("Bénévole introuvable");
        throw new Error("Bénévole introuvable");
      }
      return { ...volunteer.toObject(), role: "volunteer" };
    }

    // Si le rôle est non valide
    console.log("Rôle non valide dans le token");
    throw new Error("Rôle non valide");
  } catch (error) {
    console.error("❌ Erreur dans la fonction getToken :", error.message);
    return null;
  }
}
