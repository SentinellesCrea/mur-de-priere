import { authenticateSupervisor } from "@/lib/authMiddleware";

async function handler(req, res) {
  return res.status(200).json({ message: "Accès autorisé", supervisor: req.supervisor });
}

export default authenticateSupervisor(handler);
