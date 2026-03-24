"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchApi } from "@/lib/fetchApi";
import { toast } from "react-toastify";

import {
  FiSearch,
  FiUsers,
  FiBell,
  FiCheckCircle,
  FiTrendingUp,
} from "react-icons/fi";
import {
  HiBellAlert,
  HiOutlineCalendar,
  HiOutlineCheckCircle,
  HiSparkles,
  HiDocument
} from "react-icons/hi2";

import { FaExclamationTriangle, FaBookmark, FaTasks, FaCheckCircle } from "react-icons/fa";
import { FaHandsPraying } from "react-icons/fa6";
import { AiFillAlert } from "react-icons/ai";


import VolunteerNavbar from "../../components/volunteers/VolunteerNavbar";
import InactivityTimer from "../../components/volunteers/InactivityTimer";
import ToggleSwitch from "../../components/volunteers/ToggleSwitch";

import usePrayerRequestStore from "../../store/prayerRequestStore";
import useVolunteerStore from "../../store/VolunteerStore";

import PrayersPage from "../../components/volunteers/PrayersPage";
import MissionsPage from "../../components/volunteers/MissionsPage";
import AssignedPage from "../../components/volunteers/AssignedPage";
import CompletedMissionsPage from "../../components/volunteers/CompletedMissionsPage";

const BRAND = "#5c40e7";

/* ======================================================
   DASHBOARD BÉNÉVOLE (NOUVEAU DESIGN)
====================================================== */

export default function VolunteerDashboard() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("dashboard");

  const [volunteerName, setVolunteerName] = useState("Bénévole");
  const [assignedMissions, setAssignedMissions] = useState([]);
  const [completedPrayers, setCompletedPrayers] = useState([]);
  const [reservePrayer, setReservePrayer] = useState(0);
  const [isAvailable, setIsAvailable] = useState(false);

  const [missions, setMissions] = useState([]);
  const [urgentMissions, setUrgentMissions] = useState([]);


  const { prayerRequests, fetchPrayerRequests } = usePrayerRequestStore();
  const { volunteer } = useVolunteerStore();

  /* ================= INIT ================= */
  useEffect(() => {
    async function init() {
      try {
        const volunteerData = await fetchApi("/api/volunteers/me");

        if (!volunteerData?.firstName) {
          router.push("/volunteers/login");
          return;
        }

        setVolunteerName(
          `${volunteerData.firstName} ${volunteerData.lastName}`
        );
        setIsAvailable(volunteerData.isAvailable || false);

        const [
          assignedMissionsData,
          reservedCountData,
          completedMissionsData,
          prayerRequestsData,
        ] = await Promise.all([
          fetchApi("/api/volunteers/assignedMissions"),
          fetchApi("/api/volunteers/reserved-prayers-count"),
          fetchApi("/api/volunteers/completedMissions"),
          fetchApi("/api/volunteers/prayerRequests"),
        ]);

        setAssignedMissions(assignedMissionsData || []);
        setCompletedPrayers(completedMissionsData || []);
        setReservePrayer(reservedCountData?.reservedCount || 0);

        if (Array.isArray(prayerRequestsData)) {
          fetchPrayerRequests(prayerRequestsData);
        }
      } catch (e) {
        toast.error("Erreur chargement dashboard bénévole");
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
    ];
  }, [urgentMissions]);


  /* ================= PRIÈRES ================= */
  const availablePrayers = useMemo(
    () => prayerRequests.filter(
      (p) => !p.assignedTo && !p.reserveTo
    ),
    [prayerRequests]
  );

  const urgentAvailablePrayers = useMemo(
    () => availablePrayers.filter((p) => p.isUrgent),
    [availablePrayers]
  );

  const handleToggle = async () => {
    const next = !isAvailable;
    setIsAvailable(next);

    try {
      await fetchApi("/api/volunteers/updateAvailability", {
        method: "PUT",
        body: { isAvailable: next },
      });
      toast.success(
        `Disponibilité ${next ? "activée" : "désactivée"}`
      );
    } catch {
      toast.error("Erreur mise à jour disponibilité");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="animate-pulse text-gray-500">Chargement…</p>
      </div>
    );
  }

  const tabs = [
    { key: "dashboard", label: "Vue d'ensemble" },
    { key: "prayers", label: "Explorer les prières" },
    { key: "assigned", label: "Missions assignées" },
    { key: "missions", label: "Personnes à contacter" },
    { key: "completed", label: "Missions terminées" },
  ];

  return (
    <main className="min-h-screen bg-[#f6f6f8] mt-6">
      <VolunteerNavbar />
      <InactivityTimer />

      <section className="max-w-[1300px] mx-auto px-6 lg:px-20 py-24">
        {/* ================= HEADER ================= */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold flex items-center gap-3">
            Bienvenue <span className="font-normal">{volunteerName}</span>

            <div className="relative">
              <HiBellAlert
                size={26}
                className="text-yellow-600 cursor-pointer"
                onClick={() => setActiveTab("assigned")}
              />
              {assignedMissions.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center">
                  {assignedMissions.length}
                </span>
              )}
            </div>
          </h1>

          <ToggleSwitch isAvailable={isAvailable} onToggle={handleToggle} />
        </div>

        <p className="text-gray-600 text-sm mb-8">
          Merci pour ton engagement 💛 Ta prière peut changer une vie.
        </p>

        {/* ================= STATS ================= */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-10">
          <StatCard
            title="Prières dispo"
            value={availablePrayers.length}
            bgColor="#DBEAFE"
            icon={FaHandsPraying}
          />

          <StatCard
            title="Prières Urgentes"
            value={urgentAvailablePrayers.length}
            bgColor="#FEE2E2"
            icon={AiFillAlert}
          />

          <StatCard
            title="Prières Réservées"
            value={reservePrayer}
            bgColor="#FEF9C3"
            icon={FaBookmark}
          />

          <StatCard
            title="Missions Assignées"
            value={assignedMissions.length}
            bgColor="#DCFCE7"
            icon={FaTasks}
          />

          <StatCard
            title="Missions Terminées"
            value={completedPrayers.length}
            bgColor="#E0E7FF"
            icon={FaCheckCircle}
          />
        </div>

        {/* ================= TABS ================= */}
        <div className="flex gap-2 mb-10 border-b overflow-x-auto">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={`px-4 py-3 font-bold text-sm border-b-2 whitespace-nowrap ${
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
              <VolunteerChart data={chartData} />

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
              </div>
            </aside>
          </div>
        )}

        {activeTab === "prayers" && <PrayersPage />}
        {activeTab === "assigned" && <AssignedPage />}
        {activeTab === "missions" && <MissionsPage />}
        {activeTab === "completed" && <CompletedMissionsPage />}
      </section>
    </main>
  );
}

/* ======================================================
   COMPONENTS
====================================================== */

function StatCard({ title, value, bgColor, icon: Icon }) {
  return (
    <div
      className="rounded-xl p-4 shadow-sm"
      style={{ backgroundColor: bgColor }}
    >
      <div className="flex items-center gap-2 text-gray-700 text-sm font-medium">
        {Icon && <Icon className="text-base" />}
        <span>{title}</span>
      </div>

      <p className="text-2xl font-semibold text-gray-900 mt-1">
        {value}
      </p>
    </div>
  );
}

function VolunteerChart({ data }) {
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
