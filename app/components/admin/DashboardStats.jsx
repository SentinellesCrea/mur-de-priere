"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function DashboardStats({ allVolunteers, pendingVolunteers, missions, urgentMissions, moderations }) {
  const [displayedAllVolunteers, setDisplayedAllVolunteers] = useState(0);
  const [displayedPendingVolunteers, setDisplayedPendingVolunteers] = useState(0);
  const [displayedMissions, setDisplayedMissions] = useState(0);
  const [displayedUrgentMissions, setDisplayedUrgentMissions] = useState(0);
  const [displayedModerations, setDisplayedModerations] = useState(0);

  useEffect(() => {
    const intervals = []; // ➔ on garde trace de tous les intervals ici !

    const animateCounter = (setter, finalValue) => {
      if (typeof finalValue !== "number") return; // ✅ Sécurité supplémentaire
      let current = 0;
      const step = Math.ceil(finalValue / 50); // vitesse proportionnelle

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

    // ✅ Cleanup: arrêter tous les intervals si le composant démonte
    return () => {
      intervals.forEach(clearInterval);
    };
  }, [allVolunteers, pendingVolunteers, missions, urgentMissions, moderations]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
      {[
        { label: "🕒 Nombre total de Bénévoles", value: displayedAllVolunteers, bg: "bg-green-100", text: "text-yellow-700" },
        { label: "🕒 Bénévoles en attente de validation", value: displayedPendingVolunteers, bg: "bg-yellow-100", text: "text-yellow-700" },
        { label: "📤 Demandes de prières à dispatcher", value: displayedMissions, bg: "bg-blue-100", text: "text-blue-700" },
        { label: "🚨 Demandes Urgentes à dispatcher", value: displayedUrgentMissions, bg: "bg-red-100", text: "text-red-700" },
        { label: "💬 Témoignages à modérer", value: displayedModerations, bg: "bg-pink-100", text: "text-pink-700" },
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
        </motion.div>
      ))}
    </div>
  );
}
