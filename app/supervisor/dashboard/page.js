"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchApi } from "@/lib/fetchApi";
import { toast } from "react-toastify";

import {
  FiUsers,
  FiBookOpen,
  FiFlag,
  FiBell,
  FiTrendingUp,
} from "react-icons/fi";
import {
  HiHandRaised,
  HiSparkles,
  HiDocument,
} from "react-icons/hi2";
import { FaHandsPraying } from "react-icons/fa6";


import SupervisorNavbar from "../../components/supervisor/SupervisorNavbar";
import SupervisorFooter from "../../components/supervisor/SupervisorFooter";
import InactivityTimerSupervisor from "../../components/supervisor/InactivityTimerSupervisor";
import usePrayerRequestStore from "../../store/prayerRequestStore";

import SupervisorResourcesPage from "../resources/page";
import PrayersPage from "../../components/volunteers/PrayersPage";
import AdminVolunteersPendingPage from "../volunteers_pending/page";
import AdminManageVolunteersPage from "../manage_volunteers/page";
import AdminMissionsPage from "../missions/page";
import AdminTestimoniesPage from "../testimonies/page";

const BRAND = "#5c40e7";

/* ======================================================
   PAGE
====================================================== */

export default function SupervisorPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [supervisorName, setSupervisorName] = useState("");

  const [allVolunteers, setAllVolunteers] = useState([]);
  const [pendingVolunteers, setPendingVolunteers] = useState([]);
  const [missions, setMissions] = useState([]);
  const [urgentMissions, setUrgentMissions] = useState([]);
  const [moderations, setModerations] = useState([]);
  const [availableVolunteers, setAvailableVolunteers] = useState([]);
  const { prayerRequests, fetchPrayerRequests } = usePrayerRequestStore();

  /* ================= INIT ================= */
  useEffect(() => {
    async function init() {
      try {
        const me = await fetchApi("/api/supervisor/me");
        if (!me || me.role !== "supervisor") {
          router.push("/volunteers/login");
          return;
        }

        setSupervisorName(`${me.firstName} ${me.lastName || ""}`);

        const [
          prayerRequestsData,
          allVolunteersData,
          volunteersData,
          missionsData,
          moderationsData,
          availableData,
        ] = await Promise.all([
          fetchApi("/api/volunteers/prayerRequests"),
          fetchApi("/api/volunteers/all"),
          fetchApi("/api/supervisor/volunteers"),
          fetchApi("/api/supervisor/missions"),
          fetchApi("/api/supervisor/testimony/moderation"),
          fetchApi("/api/volunteers/available"),
        ]);

        if (Array.isArray(prayerRequestsData)) {
          fetchPrayerRequests(prayerRequestsData);
        }

        setAllVolunteers(
          (allVolunteersData || []).filter((v) => v.role === "volunteer")
        );

        setPendingVolunteers(
          (volunteersData || []).filter(
            (v) => v.status === "pending" || !v.isValidated
          )
        );

        const normalizedMissions = Array.isArray(missionsData)
          ? missionsData
          : missionsData?.missions || [];

        setMissions(normalizedMissions);

        setUrgentMissions(
          normalizedMissions.filter((m) => m.isUrgent)
        );


        setModerations(moderationsData || []);
        setAvailableVolunteers(availableData || []);
      } catch (e) {
        toast.error("Erreur chargement dashboard superviseur");
        router.push("/volunteers/login");
      } finally {
        setLoading(false);
      }
    }

    init();
  }, [router]);

  /* ================= CHART DATA ================= */
  const chartData = useMemo(() => {
    const days = [...Array(7)].map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return d.toISOString().slice(0, 10);
    });

    return days.map((day) => ({
      day,
      value: missions.filter(
        (m) => m.createdAt?.startsWith(day)
      ).length,
    }));
  }, [missions]);

  /* ================= ACTIVITY ================= */
  const activities = useMemo(() => {
    return [
      ...urgentMissions.slice(0, 3).map((m) => ({
        type: "urgent",
        title: "Mission urgente",
        text: m.prayerRequest?.slice(0, 60) + "...",
      })),
      ...pendingVolunteers.slice(0, 2).map(() => ({
        type: "pending",
        title: "Bénévole à valider",
        text: "Un bénévole attend validation",
      })),
      ...moderations.slice(0, 2).map(() => ({
        type: "moderation",
        title: "Témoignage à modérer",
        text: "Contenu en attente de validation",
      })),
    ];
  }, [urgentMissions, pendingVolunteers, moderations]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="animate-pulse text-gray-500">Chargement...</p>
      </div>
    );
  }

  const tabs = [
    { key: "dashboard", label: "Vue d'ensemble" },
    { key: "manage_volunteers", label: "Gérer les bénévoles" },
    { key: "volunteers_pending", label: "Valider un bénévole" },
    { key: "missions", label: "Attribuer des missions" },
    { key: "moderation", label: "Modération témoignages" },
    { key: "resources", label: "Publier une ressource" },
  ];

  return (
    <main className="min-h-screen bg-[#f6f6f8]">
      <SupervisorNavbar />
      <InactivityTimerSupervisor />

      <section className="max-w-[1300px] mx-auto px-6 lg:px-20 py-24">
        <div className="mb-6">
          <h1 className="text-2xl text-gray-800 mb-2 flex items-center">
            Bienvenue <span className="font-bold ml-2">{supervisorName || "Superviseur"}</span> 
          </h1>
          <p className="text-gray-600 text-sm">
            En tant que Superviseur, tu as un rôle essentiel pour dispatcher les prières, accompagner les bénévoles et modérer les contenus du Mur de Prière 🙏
          </p>
        </div>

        {/* ================= STATS ================= */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-10">
          <StatCard title="Toutes les prières" value={Array.isArray(prayerRequests) ? prayerRequests.length : 0} icon={<FaHandsPraying />} bgColor="#FBE8FD" />          
          <StatCard title="Bénévoles" value={allVolunteers.length} icon={<FiUsers />} bgColor="#DBEAFE" />
          <StatCard title="Témoignages à modérer" value={moderations.length} icon={<FiFlag />} bgColor="#FCE7F3" />
          <StatCard title="Bénévoles Disponibles" value={availableVolunteers.length} icon={<FiBookOpen />} bgColor="#FEF9C3" />
          <StatCard title="Mes missions" value={Array.isArray(missions) ? missions.length : 0} icon={<HiHandRaised />} bgColor="#DCFCE7" />
        </div>

        {/* ================= TABS ================= */}
        <div className="flex gap-2 mb-10 border-b overflow-x-auto">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={`px-4 py-3 font-bold text-sm border-b-2 ${
                activeTab === t.key
                  ? "border-[#5c40e7] text-[#5c40e7]"
                  : "border-transparent text-gray-500"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* ================= DASHBOARD ================= */}
        {activeTab === "dashboard" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <SupervisorChart data={chartData} />

              <div
                className="p-6 rounded-xl text-white relative"
                style={{ backgroundColor: BRAND }}
              >
                <h4 className="font-bold text-lg mb-2">
                  Rapport mensuel
                </h4>
                <p className="text-white/80 text-sm mb-4">
                  Analyse globale des missions et prières
                </p>
                <button className="bg-white text-[#5c40e7] px-4 py-2 rounded-full text-xs font-bold">
                  Générer PDF
                </button>
                <HiDocument className="absolute -bottom-6 -right-6 text-white/10 text-9xl" />
              </div>
            </div>

            <aside className="space-y-6">
              <div className="bg-white p-6 rounded-xl shadow">
                <h3 className="font-bold mb-4">Activité récente</h3>
                {activities.map((a, i) => (
                  <ActivityItem key={i} {...a} />
                ))}
              </div>

              <div className="bg-gray-900 p-6 rounded-xl text-white">
                <div className="flex items-center gap-2 mb-4">
                  <HiSparkles style={{ color: BRAND }} />
                  <h3 className="font-bold">Aperçu</h3>
                </div>
                <ProgressRow label="Urgentes" value={urgentMissions.length} percent="70%" />
                <ProgressRow label="En attente" value={pendingVolunteers.length} percent="50%" />
              </div>
            </aside>
          </div>
        )}

        {activeTab === "manage_volunteers" && <AdminManageVolunteersPage />}
        {activeTab === "volunteers_pending" && <AdminVolunteersPendingPage />}
        {activeTab === "missions" && <AdminMissionsPage />}
        {activeTab === "moderation" && <AdminTestimoniesPage />}
        {activeTab === "resources" && <SupervisorResourcesPage />}
      </section>

      <SupervisorFooter />
    </main>
  );
}

/* ======================================================
   COMPONENTS
====================================================== */

function StatCard({ title, value, icon, bgColor }) {
  return (
    <div
      className="p-6 rounded-3xl shadow"
      style={{ backgroundColor: bgColor }}
    >
      <div className="flex justify-between mb-2">
        <p className="text-sm text-gray-500">{title}</p>
        <span style={{ color: BRAND }}>{icon}</span>
      </div>

      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
}


function SupervisorChart({ data }) {
  const max = Math.max(...data.map((d) => d.value), 1);

  return (
    <div className="bg-white p-6 rounded-xl shadow">
      <h3 className="font-bold mb-4 flex items-center gap-2">
        <FiTrendingUp /> Activité sur 7 jours
      </h3>

      <div className="flex items-end gap-2 h-40">
        {data.map((d, i) => (
          <div key={i} className="flex-1 flex flex-col items-center">
            <div
              className="w-full rounded"
              style={{
                height: `${(d.value / max) * 100}%`,
                backgroundColor: BRAND,
              }}
            />
            <span className="text-[10px] mt-1 text-gray-400">
              {d.day.slice(8)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ActivityItem({ type, title, text }) {
  const colors = {
    urgent: "bg-red-100 text-red-600",
    pending: "bg-orange-100 text-orange-600",
    moderation: "bg-purple-100 text-purple-600",
  };

  return (
    <div className="flex gap-3 mb-4">
      <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${colors[type]}`}>
        {type.toUpperCase()}
      </span>
      <div>
        <p className="text-sm font-bold">{title}</p>
        <p className="text-xs text-gray-500">{text}</p>
      </div>
    </div>
  );
}

function ProgressRow({ label, value, percent }) {
  return (
    <>
      <div className="flex justify-between text-sm mb-1">
        <span className="text-gray-400">{label}</span>
        <span className="font-bold" style={{ color: BRAND }}>{value}</span>
      </div>
      <div className="h-1.5 bg-gray-800 rounded-full mb-3">
        <div
          className="h-full rounded-full"
          style={{ width: percent, backgroundColor: BRAND }}
        />
      </div>
    </>
  );
}
