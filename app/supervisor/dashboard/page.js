"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchApi } from "@/lib/fetchApi";
import { useAutoRefresh } from "@/lib/useAutoRefresh";
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
} from "react-icons/hi2";
import { FaHandsPraying } from "react-icons/fa6";


import SupervisorNavbar from "../../components/supervisor/SupervisorNavbar";
import SupervisorFooter from "../../components/supervisor/SupervisorFooter";
import InactivityTimerSupervisor from "../../components/supervisor/InactivityTimerSupervisor";

import SupervisorResourcesPage from "../resources/page";
import PrayersPage from "../../components/volunteers/PrayersPage";
import AdminVolunteersPendingPage from "../volunteers_pending/page";
import AdminManageVolunteersPage from "../manage_volunteers/page";
import AdminMissionsPage from "../missions/page";
import AdminTestimoniesPage from "../testimonies/page";
import SupervisorSelfMissionsPage from "../self_missions/page";
import SupervisorAvailablePrayersPage from "../available_prayers/page";

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
  const [prayersToProcess, setPrayersToProcess] = useState([]);

  const loadDashboardData = async ({ silent = false } = {}) => {
    try {
      const [
        prayerRequestsResult,
        validatedVolunteersResult,
        pendingVolunteersResult,
        missionsResult,
        moderationsResult,
        availableResult,
      ] = await Promise.allSettled([
        fetchApi("/api/supervisor/prayerRequests"),
        fetchApi("/api/supervisor/volunteers/validate"),
        fetchApi("/api/supervisor/volunteers/pending"),
        fetchApi("/api/supervisor/missions"),
        fetchApi("/api/supervisor/testimony/moderation"),
        fetchApi("/api/supervisor/connected-volunteers"),
      ]);

      const prayerRequestsData =
        prayerRequestsResult.status === "fulfilled" ? prayerRequestsResult.value : [];
      const validatedVolunteersData =
        validatedVolunteersResult.status === "fulfilled" ? validatedVolunteersResult.value : [];
      const pendingVolunteersData =
        pendingVolunteersResult.status === "fulfilled" ? pendingVolunteersResult.value : [];
      const missionsData =
        missionsResult.status === "fulfilled" ? missionsResult.value : [];
      const moderationsData =
        moderationsResult.status === "fulfilled" ? moderationsResult.value : [];
      const availableData =
        availableResult.status === "fulfilled" ? availableResult.value : [];

      setPrayersToProcess(Array.isArray(prayerRequestsData) ? prayerRequestsData : []);

      setAllVolunteers(
        (validatedVolunteersData || []).filter((v) => v.role === "volunteer")
      );

      setPendingVolunteers(
        (pendingVolunteersData || []).filter(
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

      setModerations(Array.isArray(moderationsData) ? moderationsData : []);
      setAvailableVolunteers(Array.isArray(availableData) ? availableData : []);
    } catch (e) {
      if (!silent) {
        toast.error("Erreur chargement dashboard superviseur");
      }
    }
  };

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
        await loadDashboardData();
      } catch (e) {
        toast.error("Erreur chargement dashboard superviseur");
      } finally {
        setLoading(false);
      }
    }

    init();
  }, [router]);

  useAutoRefresh(() => loadDashboardData({ silent: true }), {
    enabled: !loading,
    intervalMs: 7000,
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

  const urgentPrayers = useMemo(
    () => prayersToProcess.filter((p) => p.isUrgent).slice(0, 4),
    [prayersToProcess]
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="animate-pulse text-gray-500">Chargement...</p>
      </div>
    );
  }

  const tabs = [
    { key: "dashboard", label: "Vue d'ensemble" },
    { key: "manage_volunteers", label: "Bénévoles" },
    { key: "volunteers_pending", label: "Validations" },
    { key: "available_prayers", label: "Prières disponibles" },
    { key: "missions", label: "Missions reçues" },
    { key: "self_missions", label: "Mes prières" },
    { key: "moderation", label: "Modération" },
    { key: "resources", label: "Ressources" },
  ];

  return (
    <main className="min-h-screen bg-[#f6f6f8]">
      <SupervisorNavbar />
      <InactivityTimerSupervisor />

      <section className="max-w-[1500px] mx-auto px-6 lg:px-20 py-24">
        <div className="mb-8 rounded-[2rem] bg-white shadow-sm border border-white/70 p-6 lg:p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.25em] text-[#5c40e7] mb-3">
              Espace superviseur
            </p>
            <h1 className="text-3xl lg:text-4xl text-gray-900 font-extrabold mb-3">
              Bonjour {supervisorName || "Superviseur"} 👋
            </h1>
            <p className="text-gray-600 text-sm max-w-2xl leading-6">
              Voici les priorités de ton équipe aujourd’hui : les prières à traiter, les missions reçues de l’admin et les contenus à modérer.
            </p>
          </div>

          <div className="rounded-[1.75rem] bg-[#F1EEFF] p-5 min-w-[260px] border border-[#e4dcff]">
            <div className="flex items-center gap-2 mb-4">
              <span className="size-10 rounded-2xl bg-white flex items-center justify-center text-[#5c40e7]">
                <FiBell />
              </span>
              <div>
                <p className="text-xs text-gray-500 font-bold uppercase">Statut du jour</p>
                <p className="text-sm font-extrabold text-gray-900">Centre opérationnel</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3 text-center">
              <MiniDailyStat value={missions.length} label="Missions" />
              <MiniDailyStat value={prayersToProcess.length} label="Prières" />
              <MiniDailyStat value={availableVolunteers.length} label="Dispos" />
            </div>
          </div>
        </div>

        {/* ================= TABS ================= */}
        <div className="flex gap-2 mb-8 overflow-x-auto bg-white p-2 rounded-[1.5rem] shadow-sm border border-white/70">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={`px-5 py-3 font-bold text-sm rounded-2xl whitespace-nowrap transition ${
                activeTab === t.key
                  ? "bg-[#5c40e7] text-white shadow-md shadow-[#5c40e7]/20"
                  : "text-gray-500 hover:bg-[#F6F4FF] hover:text-[#5c40e7]"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* ================= DASHBOARD ================= */}
        {activeTab === "dashboard" && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
              <HeroMetricCard
                title="Prières à traiter"
                value={prayersToProcess.length}
                description="Demandes qui attendent encore un bénévole."
                icon={<FaHandsPraying />}
                onClick={() => setActiveTab("available_prayers")}
              />
              <StatCard title="Missions reçues" value={missions.length} icon={<HiHandRaised />} bgColor="#DCFCE7" />
              <StatCard title="Bénévoles disponibles" value={availableVolunteers.length} icon={<FiBookOpen />} bgColor="#FEF9C3" />
              <StatCard title="Témoignages" value={moderations.length} icon={<FiFlag />} bgColor="#FCE7F3" />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
              <div className="xl:col-span-2 space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                  <PriorityPanel title="Missions reçues de l’admin" accent="#DCFCE7">
                    {missions.slice(0, 4).map((mission) => (
                      <PriorityItem
                        key={mission._id}
                        title={mission.name || "Demande anonyme"}
                        text={mission.prayerRequest}
                        badge={mission.isUrgent ? "Urgent" : "Mission"}
                      />
                    ))}
                    {missions.length === 0 && <EmptyPriority text="Aucune mission reçue pour le moment." />}
                  </PriorityPanel>

                  <PriorityPanel title="Prières urgentes" accent="#FEE2E2">
                    {urgentPrayers.map((prayer) => (
                      <PriorityItem
                        key={prayer._id}
                        title={prayer.name || "Demande anonyme"}
                        text={prayer.prayerRequest}
                        badge="Urgent"
                      />
                    ))}
                    {urgentPrayers.length === 0 && <EmptyPriority text="Aucune prière urgente en attente." />}
                  </PriorityPanel>

                  <PriorityPanel title="Bénévoles en attente" accent="#DBEAFE">
                    {pendingVolunteers.slice(0, 4).map((volunteer) => (
                      <PriorityItem
                        key={volunteer._id}
                        title={`${volunteer.firstName || ""} ${volunteer.lastName || ""}`.trim() || "Bénévole"}
                        text={volunteer.email || "Validation à faire"}
                        badge="À valider"
                      />
                    ))}
                    {pendingVolunteers.length === 0 && <EmptyPriority text="Aucun bénévole en attente." />}
                  </PriorityPanel>
                </div>

                <SupervisorChart data={chartData} />
              </div>

              <aside className="space-y-6">
                <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-white/70">
                  <h3 className="font-extrabold mb-4">Activité récente</h3>
                  {activities.length > 0 ? (
                    activities.map((a, i) => <ActivityItem key={i} {...a} />)
                  ) : (
                    <p className="text-sm text-gray-500">Aucune activité prioritaire pour le moment.</p>
                  )}
                </div>

                <div className="bg-gray-950 p-6 rounded-[2rem] text-white overflow-hidden relative">
                  <div className="absolute -right-8 -bottom-8 size-32 rounded-full bg-[#5c40e7]/20" />
                  <div className="flex items-center gap-2 mb-4 relative">
                    <HiSparkles style={{ color: "#A99BFF" }} />
                    <h3 className="font-extrabold">Aperçu équipe</h3>
                  </div>
                  <ProgressRow label="Missions urgentes" value={urgentMissions.length} percent={`${Math.min(100, urgentMissions.length * 25)}%`} />
                  <ProgressRow label="Validations" value={pendingVolunteers.length} percent={`${Math.min(100, pendingVolunteers.length * 20)}%`} />
                  <ProgressRow label="Disponibles" value={availableVolunteers.length} percent={`${Math.min(100, availableVolunteers.length * 10)}%`} />
                </div>
              </aside>
            </div>
          </div>
        )}

        {activeTab === "manage_volunteers" && <AdminManageVolunteersPage />}
        {activeTab === "volunteers_pending" && <AdminVolunteersPendingPage />}
        {activeTab === "available_prayers" && <SupervisorAvailablePrayersPage />}
        {activeTab === "missions" && <AdminMissionsPage />}
        {activeTab === "self_missions" && <SupervisorSelfMissionsPage />}
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

function MiniDailyStat({ value, label }) {
  return (
    <div className="rounded-2xl bg-white px-3 py-3">
      <p className="text-xl font-extrabold text-gray-900">{value}</p>
      <p className="text-[10px] font-bold uppercase tracking-wide text-gray-400">{label}</p>
    </div>
  );
}

function HeroMetricCard({ title, value, description, icon, onClick }) {
  return (
    <div className="lg:col-span-2 p-7 rounded-[2rem] bg-gradient-to-br from-[#5c40e7] to-[#7C62F2] text-white shadow-lg shadow-[#5c40e7]/20 relative overflow-hidden">
      <div className="absolute -right-10 -bottom-10 size-40 rounded-full bg-white/10" />
      <div className="relative">
        <div className="size-12 rounded-2xl bg-white/15 flex items-center justify-center text-2xl mb-6">
          {icon}
        </div>
        <p className="text-sm font-bold text-white/75 mb-2">{title}</p>
        <p className="text-5xl font-extrabold mb-3">{value}</p>
        <p className="text-sm text-white/80 leading-6 max-w-sm mb-6">{description}</p>
        <button
          type="button"
          onClick={onClick}
          className="bg-white text-[#5c40e7] px-5 py-3 rounded-2xl text-xs font-extrabold hover:scale-[1.02] transition"
        >
          Voir les prières
        </button>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, bgColor }) {
  return (
    <div
      className="p-6 rounded-[2rem] shadow-sm border border-white/70"
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

function PriorityPanel({ title, accent, children }) {
  return (
    <div className="bg-white rounded-[2rem] p-5 shadow-sm border border-white/70 min-h-[280px]">
      <div className="flex items-center gap-3 mb-5">
        <span className="size-3 rounded-full" style={{ backgroundColor: accent }} />
        <h3 className="font-extrabold text-gray-900 text-sm">{title}</h3>
      </div>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function PriorityItem({ title, text, badge }) {
  return (
    <div className="rounded-2xl bg-[#F7F7FB] p-4 border border-gray-100">
      <div className="flex items-center justify-between gap-3 mb-2">
        <p className="font-extrabold text-sm text-gray-900 truncate">{title}</p>
        <span className="text-[10px] font-extrabold px-2 py-1 rounded-full bg-white text-[#5c40e7] whitespace-nowrap">
          {badge}
        </span>
      </div>
      <p className="text-xs text-gray-500 leading-5 line-clamp-2">
        {text || "Aucun détail disponible"}
      </p>
    </div>
  );
}

function EmptyPriority({ text }) {
  return (
    <div className="rounded-2xl bg-[#F7F7FB] p-4 text-sm text-gray-500">
      {text}
    </div>
  );
}

function SupervisorChart({ data }) {
  const max = Math.max(...data.map((d) => d.value), 1);

  return (
    <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-white/70">
      <h3 className="font-extrabold mb-4 flex items-center gap-2">
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
