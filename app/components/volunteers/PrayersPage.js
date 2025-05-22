"use client";

import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { fetchApi } from "@/lib/fetchApi";
import Button from "../ui/button";

const PrayersPage = ({ onReserve }) => {
  const [prayerRequests, setPrayerRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [takingId, setTakingId] = useState(null); // 🔥 pour afficher un loader par prière

  const fetchVolunteerPrayerRequests = async () => {
    try {
      const data = await fetchApi("/api/volunteers/prayerRequests");
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error("Erreur récupération prières :", error.message);
      toast.error("Erreur lors du chargement des prières.");
      return [];
    }
  };

  useEffect(() => {
    const loadPrayerRequests = async () => {
      const data = await fetchVolunteerPrayerRequests();
      setPrayerRequests(data);
      setLoading(false);
    };

    loadPrayerRequests();
  }, []);

  const handleTakePrayer = async (id) => {
  setTakingId(id);
  try {
    await fetchApi("/api/volunteers/reservePrayer", {
      method: "PUT",
      body: { id }, // ✅ PAS de stringify ici
    });

    toast.success("🙏 Prière réservée avec succès !");
    if (onReserve) onReserve(); // ✅ mise à jour compteur

    const data = await fetchVolunteerPrayerRequests();
    setPrayerRequests(data);
  } catch (err) {
    console.error("Erreur prise mission :", err.message);
    toast.error(err.message || "Erreur lors de la réservation.");
  } finally {
    setTakingId(null);
  }
};



  return (
    <div className="p-4 bg-gray-50 rounded shadow">
      <h2 className="text-xl font-bold mb-6">🔎 Explorer les prières</h2>

      {loading ? (
        <p className="text-center text-gray-600">Chargement des prières en cours...</p>
      ) : (
        [...prayerRequests]
          .filter((prayer) => !prayer.assignedTo && !prayer.reserveTo)
          .sort((a, b) => {
            if (a.isUrgent === b.isUrgent) {
              return new Date(b.datePublication) - new Date(a.datePublication);
            }
            return b.isUrgent - a.isUrgent;
          })
          .map((prayer) => (
            <div
              key={prayer._id}
              className="flex flex-col p-4 rounded-lg shadow bg-white border-l-4 border-blue-300 mb-4"
            >
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-semibold text-blue-700">
                  {prayer.name || "Anonyme"}
                </h3>
                <span className="text-xs text-gray-500">
                  {prayer.datePublication
                    ? new Date(prayer.datePublication).toLocaleDateString("fr-FR")
                    : "Date inconnue"}
                </span>
              </div>

              <p className="text-gray-800 mb-1">
                {prayer.prayerRequest || "Demande non renseignée."}
              </p>

              <p className="text-sm text-gray-500">
                📂 Catégorie : {prayer.category || "Non renseignée"}
              </p>

              {prayer.subcategory && (
                <p className="text-sm text-gray-500">
                  📁 Sous-catégorie : {prayer.subcategory}
                </p>
              )}

              {prayer.isUrgent && (
                <p className="text-sm font-bold text-red-600 mt-2">🚨 Urgent</p>
              )}

              <div className="mt-4 flex justify-end">
                <Button
                  onClick={() => handleTakePrayer(prayer._id)}
                  className="bg-green-600 hover:bg-green-700 text-white"
                  disabled={takingId === prayer._id}
                >
                  {takingId === prayer._id ? "En cours..." : "Je m'en occupe 🙏"}
                </Button>
              </div>
            </div>
          ))
      )}
    </div>
  );
};

export default PrayersPage;
