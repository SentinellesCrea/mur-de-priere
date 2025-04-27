"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function DashboardStats({ allVolunteers, pendingVolunteers, missions, urgentMissions, moderations, availableVolunteers }) {
  const [displayedAllVolunteers, setDisplayedAllVolunteers] = useState(0);
  const [displayedPendingVolunteers, setDisplayedPendingVolunteers] = useState(0);
  const [displayedMissions, setDisplayedMissions] = useState(0);
  const [displayedUrgentMissions, setDisplayedUrgentMissions] = useState(0);
  const [displayedModerations, setDisplayedModerations] = useState(0);
  const [displayedAvailableVolunteers, setDisplayedAvailableVolunteers] = useState(0);

  useEffect(() => {
    if (
      typeof allVolunteers !== "number" ||
      typeof pendingVolunteers !== "number" ||
      typeof missions !== "number" ||
      typeof urgentMissions !== "number" ||
      typeof moderations !== "number" ||
      typeof availableVolunteers !== "number"
    ) {
      return;
    }

    const intervals = [];

    const animateCounter = (setter, finalValue) => {
      if (typeof finalValue !== "number") return;
      let current = 0;
      const step = Math.max(1, Math.ceil(finalValue / 50));

      const interval = setInterval(() => {
        current += step;
        if (current >= finalValue) {
          current = finalValue;
          clearInterval(interval);
        }
        setter(current);
      }, 20);

      intervals.push(interval);
    };

    animateCounter(setDisplayedAllVolunteers, allVolunteers);
    animateCounter(setDisplayedPendingVolunteers, pendingVolunteers);
    animateCounter(setDisplayedMissions, missions);
    animateCounter(setDisplayedUrgentMissions, urgentMissions);
    animateCounter(setDisplayedModerations, moderations);
    animateCounter(setDisplayedAvailableVolunteers, availableVolunteers);

    return () => {
      intervals.forEach(clearInterval);
    };
  }, [allVolunteers, pendingVolunteers, missions, urgentMissions, moderations, availableVolunteers]);


  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
      {[
        { label: "🕒 Nombre total de Bénévoles validés", value: displayedAllVolunteers, bg: "bg-green-100", text: "text-yellow-700" },
        { label: "🕒 Bénévoles en attente de validation", value: displayedPendingVolunteers, bg: "bg-yellow-100", text: "text-yellow-700" },
        {
          label: "📤 Demandes de prières à dispatcher",
          value: displayedMissions,
          bg: "bg-blue-100",
          text: "text-blue-700",
          subInfo: { label: "Demandes urgentes", value: displayedUrgentMissions, text: "text-red-700" },
        },
        { label: "💬 Témoignages à modérer", value: displayedModerations, bg: "bg-pink-100", text: "text-pink-700" },
        { label: "🟢 Bénévoles disponibles", value: displayedAvailableVolunteers, bg: "bg-green-200", text: "text-green-700" },

      ].map((stat, idx) => (
        <motion.div
          key={idx}
          className={`p-4 rounded shadow hover:scale-105 transition-transform duration-300 cursor-pointer ${stat.bg}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.1 }}
        >
          <p className="text-sm text-gray-600">{stat.label}</p>
          <h3 className={`text-2xl font-bold mt-2 ${stat.text}`}>{stat.value}</h3>

          {/* Sous-info (ex : urgentes dans missions) */}
          {stat.subInfo && (
            <p className={`text-sm font-medium mt-1 ${stat.subInfo.text}`}>
              {stat.subInfo.label} : {stat.subInfo.value}
            </p>
          )}
        </motion.div>
      ))}
    </div>
  );
}
