require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const dbConnect = require('./lib/dbConnect'); // Vérifiez le chemin d'importation
const PrayerRequest = require('./models/PrayerRequest'); // Assurez-vous que le chemin est correct

dotenv.config(); // Assurez-vous que c'est bien au début

const cors = require('cors');
app.use(cors());
const app = express();

dbConnect()
    .then(() => console.log("✅ Connecté à MongoDB"))
    .catch(err => console.error("❌ Erreur de connexion :", err));

app.listen(5002, () => {
    console.log("🚀 Serveur lancé sur http://localhost:5002");
});

console.log("🔍 MONGODB_URI:", process.env.MONGODB_URI); // Vérifie si la variable est bien lue

app.use(express.json()); // Middleware pour traiter les requêtes JSON

// Connexion à la base de données
dbConnect().then(() => console.log("✅ Connecté à MongoDB")).catch(err => console.error("❌ Erreur de connexion :", err));



// Route pour ajouter une nouvelle demande de prière
app.post('app/api/prayer-requests', async (req, res) => {
  try {
    const prayerRequest = new PrayerRequest(req.body);
    await prayerRequest.save();
    res.status(201).json({ message: 'Demande de prière enregistrée !' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de l\'enregistrement de la demande.', error });
  }
});


// Route pour récupérer toutes les demandes de prière
app.get('app/api/prayer-requests', async (req, res) => {
  try {
    const requests = await PrayerRequest.find({});
    res.status(200).json(requests);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération des demandes', error });
  }
});

// Démarrer le serveur
const PORT = process.env.PORT || 5002;
app.listen(PORT, () => {
  console.log(`🚀 Serveur lancé sur http://localhost:${PORT}`);
});
