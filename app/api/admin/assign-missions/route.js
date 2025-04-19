import { authenticateAdmin } from "@/lib/authMiddleware"; 
import Mission from "@/models/Mission"; // Assurez-vous d'importer le modèle Mission
import PrayerRequest from "@/models/PrayerRequest"; 
import dbConnect from "@/lib/dbConnect";

export default authenticateAdmin(async function assignMissions(req, res) {
  await dbConnect(); // Assure la connexion à la base de données

  const { volunteerId, prayerRequestIds } = req.body;

  if (!volunteerId || !prayerRequestIds || prayerRequestIds.length === 0) {
    return res.status(400).json({ message: "Volunteer ID et prayerRequestIds sont requis" });
  }

  try {
    // Vérification si une mission similaire existe déjà pour ces demandes de prière
    const existingMission = await Mission.findOne({
      assignedTo: volunteerId,
      prayerRequestIds: { $in: prayerRequestIds }, // Recherche des missions assignées à ce bénévole avec ces ID de prières
    });

    if (existingMission) {
      return res.status(400).json({ message: "Cette mission est déjà assignée" });
    }

    // Créer une nouvelle mission pour le bénévole
    const newMission = new Mission({
      assignedTo: volunteerId,
      prayerRequestIds,
      status: "assigned", // Marque la mission comme assignée
    });

    await newMission.save(); // Sauvegarder la mission dans la base de données

    // Mettre à jour les demandes de prière pour indiquer qu'elles sont assignées
    await PrayerRequest.updateMany(
      { _id: { $in: prayerRequestIds } },
      { assignedTo: volunteerId }
    );

    // Mettre à jour le statut de la mission dans le modèle Mission
    await Mission.updateMany(
      { _id: { $in: prayerRequestIds }, status: "available" }, // Recherche des missions disponibles
      { status: "assigned" } // Changer leur statut en "assigned"
    );

    res.status(200).json({ message: "Missions attribuées avec succès", mission: newMission });
  } catch (error) {
    console.error("Erreur lors de l'attribution des missions : ", error);
    res.status(500).json({ message: "Erreur serveur lors de l'attribution des missions" });
  }
});
