"use client";

import { useState, useEffect } from "react";
import { FcCalendar, FcFolder } from "react-icons/fc";
import { HiBellAlert } from "react-icons/hi2";
import { fetchApi } from "@/lib/fetchApi"; // ✅ Import du helper fetchApi

export default function DashboardStats() {
  const [assignedMissions, setAssignedMissions] = useState(0);
  const [prayerRequests, setPrayerRequests] = useState(0);
  const [reservePrayer, setReservePrayer] = useState(0);
  const [completedMissions, setCompletedMissions] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const assigned = await fetchAssignedMissions();
        const requests = await fetchPrayerRequests();
        const reserved = await fetchReservePrayer();
        const completed = await fetchCompletedMissions();

        setAssignedMissions(assigned);
        setPrayerRequests(requests);
        setReservePrayer(reserved);
        setCompletedMissions(completed);
      } catch (error) {
        console.error("Erreur lors de la récupération des statistiques :", error.message);
      }
    };

    fetchData();
  }, []);

  // Fonctions de récupération API utilisant fetchApi
  const fetchAssignedMissions = async () => {
    const data = await fetchApi("/api/volunteers/assignedMissions");
    return data.length || 0;
  };

  const fetchPrayerRequests = async () => {
    const data = await fetchApi("/api/volunteers/prayerRequests");
    return data.length || 0;
  };

  const fetchReservePrayer = async () => {
    const data = await fetchApi("/api/volunteers/reserved-prayers-count");
    return data.reservedCount || 0;
  };

  const fetchCompletedMissions = async () => {
    const data = await fetchApi("/api/volunteers/completedMissions");
    return data.length || 0;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <div className="p-4 bg-pink-100 rounded shadow">
        <p className="text-sm text-gray-600 flex items-center gap-2">
          <HiBellAlert /> Missions assignées
        </p>
        <h3 className="text-xl font-bold text-green-700">{assignedMissions}</h3>
      </div>

      <div className="p-4 bg-blue-100 rounded shadow">
        <p className="text-sm text-gray-600 flex items-center gap-2">
          🙏 Prières disponibles
        </p>
        <h3 className="text-xl font-bold text-blue-700">{prayerRequests}</h3>
      </div>

      <div className="p-4 bg-yellow-100 rounded shadow">
        <p className="text-sm text-gray-600 flex items-center gap-2">
          <FcCalendar /> Personnes à contacter
        </p>
        <h3 className="text-xl font-bold text-green-700">{reservePrayer}</h3>
      </div>

      <div className="p-4 bg-green-100 rounded shadow">
        <p className="text-sm text-gray-600 flex items-center gap-2">
          <FcFolder /> Historique de prières
        </p>
        <h3 className="text-xl font-bold text-green-700">{completedMissions}</h3>
      </div>
    </div>
  );
}
