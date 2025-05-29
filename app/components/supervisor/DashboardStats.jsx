"use client";

import { useState, useEffect } from "react";
import { FiUsers, FiVideo, FiInbox, FiCheck } from "react-icons/fi";
import { FaPrayingHands } from "react-icons/fa";
import { MdVolunteerActivism } from "react-icons/md";
import { motion } from "framer-motion";

export default function DashboardStats({
  allVolunteers,
  pendingVolunteers,
  prayersToAssign,
  urgentPrayers,
  availableVolunteers,
}) {
  const [displayedAllVolunteers, setDisplayedAllVolunteers] = useState(0);
  const [displayedPendingVolunteers, setDisplayedPendingVolunteers] = useState(0);
  const [displayedPrayers, setDisplayedPrayers] = useState(0);
  const [displayedUrgentPrayers, setDisplayedUrgentPrayers] = useState(0);
  const [displayedAvailableVolunteers, setDisplayedAvailableVolunteers] = useState(0);

  useEffect(() => {
    if (
        typeof allVolunteers !== "number" ||
        typeof pendingVolunteers !== "number" ||
        typeof prayersToAssign !== "number" ||
        typeof urgentPrayers !== "number" ||
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
    animateCounter(setDisplayedPrayers, prayersToAssign);
    animateCounter(setDisplayedUrgentPrayers, urgentPrayers);
    animateCounter(setDisplayedAvailableVolunteers, availableVolunteers);

    return () => {
      intervals.forEach(clearInterval);
    };
  }, [allVolunteers, pendingVolunteers, prayersToAssign, urgentPrayers, availableVolunteers]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      {[
        {
          icon: FiUsers,
          label: "Bénévoles validés",
          value: displayedAllVolunteers,
          bg: "bg-green-100",
          text: "text-green-700"
        },
        {
          icon: FiCheck,
          label: "Bénévoles en attente de validation",
          value: displayedPendingVolunteers,
          bg: "bg-yellow-100",
          text: "text-yellow-700"
        },
        {
          icon: FaPrayingHands,
          label: "Prières à dispatcher",
          value: displayedPrayers,
          bg: "bg-blue-100",
          text: "text-blue-700",
          subInfo: {
            label: "Urgentes",
            value: displayedUrgentPrayers,
            text: "text-red-700"
          }
        },
        {
          icon: MdVolunteerActivism,
          label: "Bénévoles disponibles",
          value: displayedAvailableVolunteers,
          bg: "bg-green-200",
          text: "text-green-700"
        }
      ].map((stat, idx) => (
        <motion.div
          key={idx}
          className={`p-4 rounded shadow hover:scale-105 transition-transform duration-300 cursor-pointer ${stat.bg}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.1 }}
        >
          <p className="text-sm text-gray-600 flex items-center gap-2">
            {stat.icon && <stat.icon size={20} />} {stat.label}
          </p>

          <h3 className={`text-2xl font-bold mt-2 ${stat.text}`}>{stat.value}</h3>
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
