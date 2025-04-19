import PrayerRequest from "@/models/PrayerRequest"; // Assurez-vous d'importer le modèle PrayerRequest
import dbConnect from "@/lib/dbConnect"; // Connecter à MongoDB

export default async function handler(req, res) {
  if (req.method !== "PUT") {
    return res.status(405).json({ message: "Méthode non autorisée" });
  }

  const { prayerRequestId, volunteerId } = req.body;

  if (!prayerRequestId || !volunteerId) {
    return res.status(400).json({ message: "ID de prière et de bénévole requis" });
  }

  try {
    // Connecter à la base de données
    await dbConnect();

    // Mettre à jour le champ finishedBy dans PrayerRequest
    const updatedPrayer = await PrayerRequest.findByIdAndUpdate(
      prayerRequestId,
      { finishedBy: volunteerId }, // Mettre à jour le champ finishedBy
      { new: true } // Retourner l'objet mis à jour
    );

    if (!updatedPrayer) {
      return res.status(404).json({ message: "Prière non trouvée" });
    }

    res.status(200).json({ message: "Prière marquée comme terminée", prayer: updatedPrayer });
  } catch (error) {
    console.error("Erreur de mise à jour de la prière :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
}
