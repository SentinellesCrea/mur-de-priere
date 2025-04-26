"use client";

import { useState, useEffect } from "react";
import { toast } from "react-toastify"; // ✅ Ajouté pour les toasts
import { fetchApi } from "@/lib/fetchApi"; // ✅ Import de fetchApi
import Button from "../ui/button";
import { FiUserCheck, FiInbox, FiSearch, FiPhoneCall, FiArrowLeftCircle, FiToggleLeft, FiToggleRight, FiCheckCircle } from "react-icons/fi";


const PrayersPage = () => {
  const [prayerRequests, setPrayerRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🔥 Fonction directement dans la page
  const fetchVolunteerPrayerRequests = async () => {
    try {
      const data = await fetchApi("/api/volunteers/prayerRequests");

      if (!Array.isArray(data)) {
        console.error("Résultat inattendu:", data);
        return [];
      }

      return data;
    } catch (error) {
      console.error("Erreur de récupération des demandes de prière :", error.message);
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
    try {
      await fetchApi("/api/volunteers/reservePrayer", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      toast.success("La prière a été ajoutée à vos missions 🙏");
      
      const data = await fetchVolunteerPrayerRequests();
      setPrayerRequests(data);
    } catch (err) {
      console.error("Erreur prise de mission :", err.message);
      toast.error(err.message || "Erreur lors de la réservation");
    }
  };

  return (
    <div className="p-4 bg-gray-50 rounded shadow">
      <div className="flex justify-between items-center mb-10">
        <h2 className="text-xl font-bold">🔎 Explorer les prières</h2>
      </div>

      {loading ? (
        <h3>Chargement des prières...</h3>
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
            <div key={prayer._id} className="flex flex-col p-4 rounded-lg shadow bg-white border-l-4 border-blue-300 mb-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-semibold text-blue-700">{prayer.name}</h3>
                <span className="text-xs text-gray-500">
                  {new Date(prayer.datePublication).toLocaleDateString("fr-FR")}
                </span>
              </div>

              <p className="text-gray-800 mb-1">{prayer.prayerRequest}</p>
              <p className="text-sm text-gray-500">Catégorie : {prayer.category}</p>
              <p className="text-sm text-gray-500">Sous-catégorie : {prayer.subcategory}</p>
              {prayer.isUrgent && <p className="text-sm font-bold text-red-600">🚨 Urgent</p>}

              <div className="mt-auto flex justify-end">
                <Button
                  onClick={() => handleTakePrayer(prayer._id)}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  Je m&apos;en occupe
                </Button>
              </div>
            </div>
          ))
      )}
    </div>
  );
};

export default PrayersPage;
