"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchApi } from "@/lib/fetchApi";
import { useAutoRefresh, VOLUNTEER_DATA_REFRESH_EVENT } from "@/lib/useAutoRefresh";
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

const BRAND = "#B97952";
const VOLUNTEER_DARK = "#3F3328";

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


  const { prayerRequests, setPrayerRequests } = usePrayerRequestStore();
  const { volunteer } = useVolunteerStore();

  const loadDashboardData = async ({ silent = false } = {}) => {
    try {
      const [
        assignedMissionsData,
        reservedCountData,
        completedMissionsData,
        prayerRequestsData,
        activeMissionsData,
      ] = await Promise.all([
        fetchApi("/api/volunteers/assignedMissions"),
        fetchApi("/api/volunteers/reserved-prayers-count"),
        fetchApi("/api/volunteers/completedMissions"),
        fetchApi("/api/volunteers/prayerRequests"),
        fetchApi("/api/volunteers/missions"),
      ]);

      const activeMissions = Array.isArray(activeMissionsData) ? activeMissionsData : [];

      setAssignedMissions(Array.isArray(assignedMissionsData) ? assignedMissionsData : []);
      setCompletedPrayers(Array.isArray(completedMissionsData) ? completedMissionsData : []);
      setReservePrayer(reservedCountData?.reservedCount || 0);
      setMissions(activeMissions);
      setUrgentMissions(activeMissions.filter((mission) => mission.isUrgent));

      if (Array.isArray(prayerRequestsData)) {
        setPrayerRequests(prayerRequestsData);
      }
    } catch (e) {
      if (!silent) {
        toast.error("Erreur chargement dashboard bénévole");
      }
    }
  };

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

        await loadDashboardData();
      } catch (e) {
        toast.error("Erreur chargement dashboard bénévole");
        router.push("/volunteers/login");
      } finally {
        setLoading(false);
      }
    }

    init();
  }, [router]);

  useAutoRefresh(() => loadDashboardData({ silent: true }), {
    enabled: !loading,
    intervalMs: 7000,
    eventName: VOLUNTEER_DATA_REFRESH_EVENT,
  });


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
      await loadDashboardData({ silent: true });
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
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_#F8E8DD,_transparent_34%),linear-gradient(135deg,_#FAF7F2,_#F3EEE7)] mt-6 text-[#3F3328]">
      <VolunteerNavbar />
      <InactivityTimer />

      <section className="max-w-[1500px] mx-auto px-6 lg:px-20 py-24">
        {/* ================= HEADER ================= */}
        <div className="bg-white/85 border border-white/70 shadow-sm rounded-[2rem] p-6 lg:p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.25em] text-[#B97952] mb-3">
              Espace bénévole
            </p>
            <h1 className="text-3xl lg:text-4xl font-extrabold flex items-center gap-3 text-[#3F3328]">
              Bienvenue <span className="font-semibold text-[#8A5A3B]">{volunteerName}</span>

              <div className="relative">
                <HiBellAlert
                  size={28}
                  className="text-[#B97952] cursor-pointer"
                  onClick={() => setActiveTab("assigned")}
                />
                {assignedMissions.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#D8614C] text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center">
                    {assignedMissions.length}
                  </span>
                )}
              </div>
            </h1>

            <p className="text-[#6F6256] text-sm mt-4 max-w-2xl leading-6">
              Merci pour ton engagement 💛 Ta prière peut changer une vie.
            </p>
          </div>

          <ToggleSwitch isAvailable={isAvailable} onToggle={handleToggle} />
        </div>

        {/* ================= STATS ================= */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-10">
          <StatCard
            title="Prières dispo"
            value={availablePrayers.length}
            bgColor="#EAF3E6"
            icon={FaHandsPraying}
          />

          <StatCard
            title="Prières Urgentes"
            value={urgentAvailablePrayers.length}
            bgColor="#FFE3DC"
            icon={AiFillAlert}
          />

          <StatCard
            title="Prières Réservées"
            value={reservePrayer}
            bgColor="#FFF0CF"
            icon={FaBookmark}
          />

          <StatCard
            title="Missions Assignées"
            value={assignedMissions.length}
            bgColor="#E8F2DD"
            icon={FaTasks}
          />

          <StatCard
            title="Missions Terminées"
            value={completedPrayers.length}
            bgColor="#F6E7D7"
            icon={FaCheckCircle}
          />
        </div>

        {/* ================= TABS ================= */}
        <div className="flex gap-2 mb-10 overflow-x-auto bg-white/85 p-2 rounded-[1.5rem] shadow-sm border border-white/70">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={`px-5 py-3 font-bold text-sm rounded-2xl whitespace-nowrap transition ${
                activeTab === t.key
                  ? "bg-[#B97952] text-white shadow-md shadow-[#B97952]/20"
                  : "text-[#7A6B5E] hover:bg-[#FFF0CF] hover:text-[#8A5A3B]"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* ================= DASHBOARD ================= */}
        {activeTab === "dashboard" && (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <VolunteerChart data={chartData} />

              <div
                className="p-6 rounded-[2rem] text-white relative overflow-hidden shadow-lg shadow-[#B97952]/10"
                style={{ backgroundColor: BRAND }}
              >
                <h4 className="font-bold text-lg mb-2">
                  Rapport mensuel
                </h4>
                <p className="text-white/80 text-sm mb-4">
                  Analyse globale des missions et prières
                </p>
                <button className="bg-white text-[#B97952] px-4 py-2 rounded-full text-xs font-bold">
                  Générer PDF
                </button>
                <HiDocument className="absolute -bottom-6 -right-6 text-white/10 text-9xl" />
              </div>
            </div>

            <aside className="space-y-6">
              <div className="bg-white/90 p-6 rounded-[2rem] shadow-sm border border-white/70">
                <h3 className="font-bold mb-4">Activité récente</h3>
                {activities.map((a, i) => (
                  <ActivityItem key={i} {...a} />
                ))}
              </div>

              <div className="bg-[#3F3328] p-6 rounded-[2rem] text-white overflow-hidden">
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
      className="rounded-[2rem] p-5 shadow-sm border border-white/70"
      style={{ backgroundColor: bgColor }}
    >
      <div className="flex items-center gap-2 text-[#6F6256] text-sm font-extrabold">
        {Icon && <Icon className="text-base" />}
        <span>{title}</span>
      </div>

      <p className="text-3xl font-extrabold text-[#3F3328] mt-2">
        {value}
      </p>
    </div>
  );
}

function VolunteerChart({ data }) {
  const max = Math.max(...data.map((d) => d.value), 1);

  return (
    <div className="bg-white/90 p-6 rounded-[2rem] shadow-sm border border-white/70">
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
