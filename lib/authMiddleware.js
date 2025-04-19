import jwt from "jsonwebtoken";
import { cookies } from "next/headers"; // Utilisation des cookies dans Next.js

export function authenticateAdmin(handler) {
  return async (req, res) => {
    // Récupère les cookies
    const cookieStore = cookies();
    const tokenCookie = cookieStore.get("adminToken"); // Le nom du cookie peut varier, ajuste-le si nécessaire

    if (!tokenCookie) {
      return res.status(401).json({ message: "Accès refusé, token requis" });
    }

    const token = tokenCookie.value;

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET); // Vérification du token avec la clé secrète
      if (decoded.role !== "admin") {
        return res.status(403).json({ message: "Accès non autorisé" });
      }

      req.admin = decoded; // Attacher les informations de l'admin à la requête
      return handler(req, res); // Appeler le handler avec les infos de l'admin attachées
    } catch (error) {
      return res.status(400).json({ message: "Token invalide" });
    }
  };
}
