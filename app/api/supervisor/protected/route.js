import { authenticateAdmin } from "@/lib/authMiddleware";

async function handler(req, res) {
  return res.status(200).json({ message: "Accès autorisé", admin: req.admin });
}

export default authenticateAdmin(handler);
