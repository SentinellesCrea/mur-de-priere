"use client";

import { useState, useEffect } from "react";
import { HiBellAlert, HiOutlineArchive, HiOutlineCalendar, HiOutlineCheckCircle } from "react-icons/hi2";
import { fetchApi } from "@/lib/fetchApi";
import { toast } from "react-toastify";

export default function DashboardStats() {
  const [stats, setStats] = useState({
    assignedMissions: 0,
    prayerRequests: 0,
    reservePrayer: 0,
    completedMissions: 0,
  });

  useEffect(() => {
    const fetchAllStats = async () => {
      try {
        const [assignedData, prayerData, reserveData, completedData] = await Promise.all([
          fetchApi("/api/volunteers/assignedMissions"),
          fetchApi("/api/volunteers/prayerRequests"),
          fetchApi("/api/volunteers/reserved-prayers-count"),
          fetchApi("/api/volunteers/completedMissions"),
        ]);

        setStats({
          assignedMissions: Array.isArray(assignedData) ? assignedData.length : 0,
          prayerRequests: Array.isArray(prayerData) ? prayerData.length : 0,
          reservePrayer: reserveData?.reservedCount || 0,
          completedMissions: Array.isArray(completedData) ? completedData.length : 0,
        });

      } catch (error) {
        console.error("Erreur lors de la récupération des statistiques :", error.message);
        toast.error("Erreur de chargement des statistiques.");
      }
    };

    fetchAllStats();
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <div className="p-4 bg-pink-100 rounded shadow">
        <p className="text-sm text-gray-600 flex items-center gap-2">
          <HiBellAlert /> Missions assignées
        </p>
        <h3 className="text-xl font-bold text-green-700">{stats.assignedMissions}</h3>
      </div>

      <div className="p-4 bg-blue-100 rounded shadow">
        <p className="text-sm text-gray-600 flex items-center gap-2">
          🙏 Prières disponibles
        </p>
        <h3 className="text-xl font-bold text-blue-700">{stats.prayerRequests}</h3>
      </div>

      <div className="p-4 bg-yellow-100 rounded shadow">
        <p className="text-sm text-gray-600 flex items-center gap-2">
          <HiOutlineCalendar /> Personnes à contacter
        </p>
        <h3 className="text-xl font-bold text-yellow-700">{stats.reservePrayer}</h3>
      </div>

      <div className="p-4 bg-green-100 rounded shadow">
        <p className="text-sm text-gray-600 flex items-center gap-2">
          <HiOutlineCheckCircle /> Historique de prières
        </p>
        <h3 className="text-xl font-bold text-green-700">{stats.completedMissions}</h3>
      </div>
    </div>
  );
}
