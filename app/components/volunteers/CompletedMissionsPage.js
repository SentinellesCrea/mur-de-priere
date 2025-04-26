'use client';

import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { fetchApi } from "@/lib/fetchApi"; // ✅ Import du helper

const CompletedMissionsPage = () => {
  const [completedMissions, setCompletedMissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCompletedMissions = async () => {
      try {
        const data = await fetchApi("/api/volunteers/completedMissions");
        setCompletedMissions(data || []);
      } catch (err) {
        console.error("Erreur de chargement des missions terminées :", err.message);
        setCompletedMissions([]);
        toast.error(err.message || "Erreur lors de la récupération des missions.");
      } finally {
        setLoading(false);
      }
    };

    fetchCompletedMissions();
  }, []);

  return (
    <div>
      {loading ? (
        <h3>Chargement des missions terminées...</h3>
      ) : (
        completedMissions.length === 0 ? (
          <p className="text-gray-500">Aucune mission terminée.</p>
        ) : (
          completedMissions.map((prayer, index) => (
            <div
              key={`${prayer._id}-${index}`}
              className="p-4 rounded-lg shadow bg-white border-l-4 border-green-400 mb-4"
            >
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-semibold text-green-700">
                  🙌 {prayer.name}
                </h3>
                <span className="text-l text-gray-500">
                  {new Date(prayer.datePublication).toLocaleDateString("fr-FR")}
                </span>
              </div>
              <p className="text-gray-700"><strong>✉️ Email :</strong> {prayer.email}</p>
              {prayer.phone && (
                <p className="text-gray-700">
                  <strong>📞 Téléphone :</strong> {prayer.phone}
                </p>
              )}
              <p className="text-gray-800 my-2">
                <strong>📝 Demande :</strong> {prayer.prayerRequest}
              </p>
              <p className="text-sm text-gray-500">
                <strong>📂 Catégorie :</strong> {prayer.category}
              </p>
              {prayer.subcategory && (
                <p className="text-sm text-gray-500">
                  <strong>📁 Sous-catégorie :</strong> {prayer.subcategory}
                </p>
              )}
              {prayer.isUrgent && (
                <p className="text-sm font-bold text-red-600 mt-2">🚨 Urgent</p>
              )}
            </div>
          ))
        )
      )}
    </div>
  );
};

export default CompletedMissionsPage;
