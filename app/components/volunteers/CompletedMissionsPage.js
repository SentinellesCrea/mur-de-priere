"use client";

import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { fetchApi } from "@/lib/fetchApi";

const CompletedMissionsPage = () => {
  const [completedMissions, setCompletedMissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCompletedMissions = async () => {
      try {
        const data = await fetchApi("/api/volunteers/completedMissions");
        setCompletedMissions(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Erreur de chargement des missions terminées :", err.message);
        toast.error(err.message || "Erreur lors de la récupération des missions.");
      } finally {
        setLoading(false);
      }
    };

    fetchCompletedMissions();
  }, []);

  return (
    <div className="p-4 bg-gray-50 rounded shadow">
      <h2 className="text-xl font-bold mb-6">🎯 Missions terminées</h2>

      {loading ? (
        <p className="text-center text-gray-600">Chargement des missions terminées...</p>
      ) : completedMissions.length === 0 ? (
        <p className="text-gray-500">Aucune mission terminée pour le moment.</p>
      ) : (
        completedMissions.map((prayer) => (
          <div
            key={prayer._id}
            className="p-4 rounded-lg shadow bg-white border-l-4 border-green-400 mb-4"
          >
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-semibold text-green-700">
                🙌 {prayer.name || "Anonyme"}
              </h3>
              <span className="text-sm text-gray-500">
                {prayer.datePublication
                  ? new Date(prayer.datePublication).toLocaleDateString("fr-FR")
                  : "Date inconnue"}
              </span>
            </div>

            <p className="text-gray-700"><strong>✉️ Email :</strong> {prayer.email || "Non renseigné"}</p>

            {prayer.phone && (
              <p className="text-gray-700">
                <strong>📞 Téléphone :</strong> {prayer.phone}
              </p>
            )}

            <p className="text-gray-800 my-2">
              <strong>📝 Demande :</strong> {prayer.prayerRequest || "Non renseignée"}
            </p>

            <p className="text-sm text-gray-500">
              <strong>📂 Catégorie :</strong> {prayer.category || "Non renseignée"}
            </p>

            {prayer.subcategory && (
              <p className="text-sm text-gray-500">
                <strong>📁 Sous-catégorie :</strong> {prayer.subcategory}
              </p>
            )}

            {prayer.isUrgent && (
              <p className="text-sm font-bold text-red-600 mt-2">🚨 Urgence signalée</p>
            )}
          </div>
        ))
      )}
    </div>
  );
};

export default CompletedMissionsPage;
