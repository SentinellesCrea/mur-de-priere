"use client";

import { FiAlertTriangle, FiCheckCircle, FiClock, FiInbox, FiUsers } from "react-icons/fi";
import { FaPrayingHands } from "react-icons/fa";

export default function DashboardStats({
  allVolunteers,
  pendingVolunteers,
  missions,
  urgentMissions,
  moderations,
  availableVolunteers,
  allSupervisors,
}) {
  const stats = [
    {
      icon: FiUsers,
      label: "Bénévoles",
      value: allVolunteers,
      accent: "bg-[#8B1E3F]",
      tint: "bg-[#FFF0F4]",
      detail: `${availableVolunteers} disponibles`,
    },
    {
      icon: FiClock,
      label: "À valider",
      value: pendingVolunteers,
      accent: "bg-[#C76A2A]",
      tint: "bg-[#FFF4E8]",
      detail: "Inscriptions en attente",
    },
    {
      icon: FaPrayingHands,
      label: "Prières à attribuer",
      value: missions,
      accent: "bg-[#3569A8]",
      tint: "bg-[#EEF6FF]",
      detail: `${urgentMissions} urgentes`,
      detailTone: urgentMissions > 0 ? "text-[#A3193F]" : "text-[#7a6b5f]",
    },
    {
      icon: FiInbox,
      label: "Témoignages",
      value: moderations,
      accent: "bg-[#0F766E]",
      tint: "bg-[#EAF8F5]",
      detail: "Modération",
    },
    {
      icon: FiCheckCircle,
      label: "Disponibles",
      value: availableVolunteers,
      accent: "bg-[#5F8A61]",
      tint: "bg-[#EFF8ED]",
      detail: "Actifs maintenant",
    },
    {
      icon: FiAlertTriangle,
      label: "Superviseurs",
      value: allSupervisors,
      accent: "bg-[#6D5A8D]",
      tint: "bg-[#F4F0FA]",
      detail: "Coordination",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
      {stats.map((stat) => {
        const Icon = stat.icon;

        return (
          <div
            key={stat.label}
            className={`rounded-lg border border-[#eadfd3] ${stat.tint} p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md`}
          >
            <div className="flex items-center justify-between gap-3">
              <span className={`inline-flex h-10 w-10 items-center justify-center rounded-lg text-white ${stat.accent}`}>
                <Icon className="h-5 w-5" />
              </span>
              <span className="text-3xl font-bold text-[#2f2a26]">{stat.value}</span>
            </div>
            <p className="mt-5 text-sm font-bold text-[#332c26]">{stat.label}</p>
            <p className={`mt-1 text-xs font-medium ${stat.detailTone || "text-[#7a6b5f]"}`}>
              {stat.detail}
            </p>
          </div>
        );
      })}
    </div>
  );
}
