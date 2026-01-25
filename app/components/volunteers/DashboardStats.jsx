"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { HiBellAlert, HiOutlineCalendar, HiOutlineCheckCircle } from "react-icons/hi2";
import { FaPrayingHands } from "react-icons/fa";

export default function DashboardStats({
  assignedMissions,
  prayerRequests,
  urgentPrayerRequests,
  reservePrayer,
  completedMissions,
}) {
  const [displayedAssignedMissions, setDisplayedAssignedMissions] = useState(0);
  const [displayedPrayerRequests, setDisplayedPrayerRequests] = useState(0);
  const [displayedUrgentPrayerRequests, setDisplayedUrgentPrayerRequests] = useState(0);
  const [displayedReservePrayer, setDisplayedReservePrayer] = useState(0);
  const [displayedCompletedMissions, setDisplayedCompletedMissions] = useState(0);

  useEffect(() => {
    if (
      typeof assignedMissions !== "number" ||
      typeof prayerRequests !== "number" ||
      typeof urgentPrayerRequests !== "number" ||
      typeof reservePrayer !== "number" ||
      typeof completedMissions !== "number"
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

    animateCounter(setDisplayedAssignedMissions, assignedMissions);
    animateCounter(setDisplayedPrayerRequests, prayerRequests);
    animateCounter(setDisplayedUrgentPrayerRequests, urgentPrayerRequests);
    animateCounter(setDisplayedReservePrayer, reservePrayer);
    animateCounter(setDisplayedCompletedMissions, completedMissions);

    return () => {
      intervals.forEach(clearInterval);
    };
  }, [assignedMissions, prayerRequests, urgentPrayerRequests, reservePrayer, completedMissions]);



return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      {[
          {
            icon: HiBellAlert,
            label: "Missions assignées",
            value: displayedAssignedMissions,
            bg: "bg-green-100",
            text: "text-yellow-700"
          },
          {
            icon: FaPrayingHands,
            label: "Prières disponibles",
            value: displayedPrayerRequests,
            bg: "bg-blue-100",
            text: "text-blue-700",
            subInfo: {
              label: "Urgentes",
              value: displayedUrgentPrayerRequests,
              text: "text-red-700"
            }
          },
          {
            icon: HiOutlineCalendar,
            label: "Personnes à contacter",
            value: displayedReservePrayer,
            bg: "bg-pink-100",
            text: "text-pink-700"
          },
          {
            icon: HiOutlineCheckCircle,
            label: "Historique de prières",
            value: displayedCompletedMissions,
            bg: "bg-green-200",
            text: "text-green-700"
          },
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

