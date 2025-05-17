"use client";

import { useState, useEffect } from "react";
import { HiBellAlert, HiOutlineCalendar, HiOutlineCheckCircle } from "react-icons/hi2";
import { HiOutlineArchive } from "react-icons/hi";
import { fetchApi } from "@/lib/fetchApi";
import { toast } from "react-toastify";

export default function DashboardStats() {
  const [stats, setStats] = useState({
    totalVolunteers: 0,
    totalMissions: 0,
    pendingPrayers: 0,
    pendingTestimonies: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await fetchApi("/api/supervisor/stats");
        setStats({
          totalVolunteers: data.totalVolunteers || 0,
          totalMissions: data.totalMissions || 0,
          pendingPrayers: data.pendingPrayers || 0,
          pendingTestimonies: data.pendingTestimonies || 0,
        });
      } catch (error) {
        console.error("Erreur lors de la récupération des statistiques :", error.message);
        toast.error("Erreur de chargement des statistiques.");
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <div className="p-4 bg-green-100 rounded shadow">
        <p className="text-sm text-gray-600 flex items-center gap-2">
          🟢 Bénévoles disponibles
        </p>
        <h3 className="text-xl font-bold text-green-700">{stats.totalVolunteers}</h3>
      </div>

      <div className="p-4 bg-blue-100 rounded shadow">
        <p className="text-sm text-gray-600 flex items-center gap-2">
          <HiBellAlert /> Prières à attribuer
        </p>
        <h3 className="text-xl font-bold text-blue-700">{stats.totalMissions}</h3>
      </div>

      <div className="p-4 bg-yellow-100 rounded shadow">
        <p className="text-sm text-gray-600 flex items-center gap-2">
          <HiOutlineCalendar /> Prières à modérer
        </p>
        <h3 className="text-xl font-bold text-yellow-700">{stats.pendingPrayers}</h3>
      </div>

      <div className="p-4 bg-pink-100 rounded shadow">
        <p className="text-sm text-gray-600 flex items-center gap-2">
          <HiOutlineArchive /> Témoignages à modérer
        </p>
        <h3 className="text-xl font-bold text-pink-700">{stats.pendingTestimonies}</h3>
      </div>
    </div>
  );
}
