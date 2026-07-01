"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchApi } from "@/lib/fetchApi";
import AdminNavbar from "../components/admin/AdminNavbar";
import InactivityTimerAdmin from "../components/admin/InactivityTimerAdmin";
import DashboardStats from "../components/admin/DashboardStats";
import {
  FiCheck,
  FiChevronRight,
  FiClipboard,
  FiHeart,
  FiHome,
  FiInbox,
  FiList,
  FiUsers,
  FiVideo,
} from "react-icons/fi";

import AdminVideosPage from "./videos/page";
import AdminVolunteersPendingPage from "./volunteers_pending/page";
import AdminManageVolunteersPage from "./manage_volunteers/page";
import AdminManageSupervisorsPage from "./manage_supervisors/page";
import AdminMissionsPage from "./missions/page";
import AdminTestimoniesPage from "./testimonies/page";
import AdminPrayersPage from "./prayers/page";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const NAV_GROUPS = [
  {
    label: "Piloter",
    items: [
      { id: "dashboard", label: "Accueil", icon: FiHome },
      { id: "moderationPrayers", label: "Prières", icon: FiHeart },
      { id: "missions", label: "Attributions", icon: FiList },
    ],
  },
  {
    label: "Équipe",
    items: [
      { id: "volunteers_pending", label: "Validations", icon: FiCheck },
      { id: "manage_volunteers", label: "Bénévoles", icon: FiUsers },
      { id: "supervisors", label: "Superviseurs", icon: FiUsers },
    ],
  },
  {
    label: "Contenus",
    items: [
      { id: "moderation", label: "Témoignages", icon: FiInbox },
      { id: "videos", label: "Vidéos", icon: FiVideo },
    ],
  },
];

const VIEW_COPY = {
  dashboard: {
    eyebrow: "Accueil",
    title: "Centre de pilotage",
    description: "Une vue large pour voir ce qui demande ton attention et où l'équipe en est.",
  },
  moderationPrayers: {
    eyebrow: "Prières",
    title: "Console des prières",
    description: "Comprendre, attribuer, rouvrir ou réparer les suivis depuis un seul endroit.",
  },
  missions: {
    eyebrow: "Attributions",
    title: "Demandes à confier",
    description: "Choisir la bonne personne pour accompagner chaque demande qui attend un suivi.",
  },
  volunteers_pending: {
    eyebrow: "Validation",
    title: "Nouveaux bénévoles",
    description: "Accueillir les personnes qui souhaitent rejoindre l'équipe de prière.",
  },
  manage_volunteers: {
    eyebrow: "Équipe",
    title: "Bénévoles actifs",
    description: "Suivre les comptes validés et ajuster les rôles quand c'est nécessaire.",
  },
  supervisors: {
    eyebrow: "Coordination",
    title: "Superviseurs",
    description: "Garder une vision claire des responsables qui soutiennent les bénévoles.",
  },
  moderation: {
    eyebrow: "Témoignages",
    title: "Paroles à relire",
    description: "Valider les témoignages avec attention avant publication.",
  },
  videos: {
    eyebrow: "Encouragement",
    title: "Vidéos proposées",
    description: "Ajouter et retirer les vidéos destinées à soutenir les visiteurs.",
  },
};

function getTabCount(tabId, data) {
  if (tabId === "moderationPrayers" || tabId === "missions") return data.missions.length;
  if (tabId === "volunteers_pending") return data.pendingVolunteers.length;
  if (tabId === "manage_volunteers") return data.allVolunteers.length;
  if (tabId === "supervisors") return data.allSupervisors.length;
  if (tabId === "moderation") return data.moderations.length;
  return null;
}

function LoadingState() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#fbf3ea]">
      <div className="w-full max-w-md rounded-[1.5rem] border border-[#eadfd3] bg-[#fffaf5] p-8 shadow-sm">
        <h2 className="mb-4 text-center text-lg font-semibold text-[#5f5146] animate-pulse">
          Chargement de l&apos;espace admin...
        </h2>
        <div className="h-2 w-full overflow-hidden rounded-full bg-[#f0e2d5]">
          <div className="h-full rounded-full bg-[#8B1E3F] animate-loading-bar" />
        </div>

        <style jsx>{`
          @keyframes loading-bar {
            0% {
              width: 0%;
            }
            50% {
              width: 80%;
            }
            100% {
              width: 0%;
            }
          }

          .animate-loading-bar {
            animation: loading-bar 1.8s ease-in-out infinite;
          }
        `}</style>
      </div>
    </div>
  );
}

function SideNavigation({ activeTab, setActiveTab, data }) {
  return (
    <aside className="lg:sticky lg:top-28 lg:self-start">
      <div className="rounded-[1.75rem] border border-[#eadfd3] bg-[#fffaf5] p-4 shadow-sm">
        <div className="rounded-[1.25rem] bg-[#8B1E3F] p-5 text-white">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#ffd8c2]">Mur de Prière</p>
          <p className="mt-3 text-2xl font-bold">Admin</p>
          <p className="mt-2 text-sm leading-6 text-[#ffe8dc]">
            Un espace pour veiller sur les demandes, les personnes et les contenus.
          </p>
        </div>

        <nav className="mt-5 space-y-5">
          {NAV_GROUPS.map((group) => (
            <div key={group.label}>
              <p className="px-2 text-xs font-bold uppercase tracking-[0.16em] text-[#9b806d]">
                {group.label}
              </p>
              <div className="mt-2 space-y-1">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  const count = getTabCount(item.id, data);

                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={`flex w-full items-center justify-between gap-3 rounded-[1rem] px-3 py-3 text-left transition ${
                        isActive
                          ? "bg-[#fff1e8] text-[#8B1E3F] shadow-sm"
                          : "text-[#5f5146] hover:bg-white hover:text-[#8B1E3F]"
                      }`}
                    >
                      <span className="flex min-w-0 items-center gap-3">
                        <span
                          className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-[0.9rem] ${
                            isActive ? "bg-white" : "bg-[#fff8f1]"
                          }`}
                        >
                          <Icon className="h-4 w-4" />
                        </span>
                        <span className="text-sm font-bold">{item.label}</span>
                      </span>
                      {count !== null && (
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                            isActive ? "bg-[#8B1E3F] text-white" : "bg-white text-[#8a7463]"
                          }`}
                        >
                          {count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </div>
    </aside>
  );
}

function DashboardHome({ data, setActiveTab }) {
  const priorityCards = [
    {
      title: "Prières à orienter",
      value: data.missions.length,
      text: "Les demandes qui attendent une attribution ou une reprise admin.",
      action: "Ouvrir la console",
      tab: "moderationPrayers",
      tone: "bg-[#fff1e8]",
    },
    {
      title: "Bénévoles à accueillir",
      value: data.pendingVolunteers.length,
      text: "Les inscriptions qui demandent une validation.",
      action: "Voir les validations",
      tab: "volunteers_pending",
      tone: "bg-[#fff7dc]",
    },
    {
      title: "Témoignages à relire",
      value: data.moderations.length,
      text: "Les paroles à vérifier avant publication.",
      action: "Relire",
      tab: "moderation",
      tone: "bg-[#eaf8f5]",
    },
  ];

  return (
    <div className="space-y-8">
      <section className="rounded-[2rem] border border-[#eadfd3] bg-[#fffaf5] p-6 shadow-sm md:p-8">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#8B1E3F]">
              À traiter maintenant
            </p>
            <h2 className="mt-3 max-w-2xl text-3xl font-bold leading-tight text-[#2f2a26] md:text-4xl">
              Un espace pour décider calmement, sans perdre la vue d&apos;ensemble.
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-7 text-[#6B5B4D]">
              Les priorités restent devant toi, les actions sont regroupées par responsabilité,
              et chaque zone garde assez d&apos;air pour être lue rapidement.
            </p>
          </div>

          <div className="rounded-[1.5rem] bg-white p-5 shadow-sm">
            <p className="text-sm font-bold text-[#2f2a26]">État de l&apos;équipe</p>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-[1rem] bg-[#eff8ed] p-4">
                <p className="text-3xl font-bold text-[#2f2a26]">{data.availableVolunteers.length}</p>
                <p className="mt-1 text-xs font-bold text-[#5F8A61]">disponibles</p>
              </div>
              <div className="rounded-[1rem] bg-[#f4f0fa] p-4">
                <p className="text-3xl font-bold text-[#2f2a26]">{data.allSupervisors.length}</p>
                <p className="mt-1 text-xs font-bold text-[#6D5A8D]">superviseurs</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        {priorityCards.map((item) => (
          <article
            key={item.title}
            className={`rounded-[1.5rem] border border-[#eadfd3] ${item.tone} p-6 shadow-sm`}
          >
            <p className="text-sm font-bold text-[#5f5146]">{item.title}</p>
            <p className="mt-3 text-5xl font-bold text-[#2f2a26]">{item.value}</p>
            <p className="mt-4 min-h-12 text-sm leading-6 text-[#6B5B4D]">{item.text}</p>
            <button
              onClick={() => setActiveTab(item.tab)}
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#8B1E3F] px-4 py-2 text-sm font-bold text-white transition hover:bg-[#741733]"
            >
              {item.action}
              <FiChevronRight className="h-4 w-4" />
            </button>
          </article>
        ))}
      </section>

      <DashboardStats
        allVolunteers={data.allVolunteers.length}
        pendingVolunteers={data.pendingVolunteers.length}
        missions={data.missions.length}
        urgentMissions={data.urgentMissions.length}
        moderations={data.moderations.length}
        availableVolunteers={data.availableVolunteers.length}
        allSupervisors={data.allSupervisors.length}
      />
    </div>
  );
}

function ViewFrame({ activeTab, children }) {
  const copy = VIEW_COPY[activeTab] || VIEW_COPY.dashboard;

  return (
    <section className="space-y-5">
      <div className="rounded-[2rem] border border-[#eadfd3] bg-[#fffaf5] p-6 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#8B1E3F]">{copy.eyebrow}</p>
        <h1 className="mt-2 text-3xl font-bold text-[#2f2a26]">{copy.title}</h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-[#6B5B4D]">{copy.description}</p>
      </div>
      {children}
    </section>
  );
}

export default function AdminDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [adminName, setAdminName] = useState("");
  const [pendingVolunteers, setPendingVolunteers] = useState([]);
  const [allVolunteers, setAllVolunteers] = useState([]);
  const [allSupervisors, setAllSupervisors] = useState([]);
  const [missions, setMissions] = useState([]);
  const [moderations, setModerations] = useState([]);
  const [urgentMissions, setUrgentMissions] = useState([]);
  const [availableVolunteers, setAvailableVolunteers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function init() {
      try {
        const adminData = await fetchApi("/api/admin/me");

        if (!adminData || !adminData.firstName) {
          router.push("/admin/login");
          return;
        }

        setAdminName(`${adminData.firstName} ${adminData.lastName}`.trim());

        const [
          allVolunteersData,
          volunteersData,
          missionsData,
          testimoniesData,
          availableData,
          supervisorsData,
        ] = await Promise.all([
          fetchApi("/api/volunteers/all"),
          fetchApi("/api/admin/volunteers"),
          fetchApi("/api/admin/missions"),
          fetchApi("/api/admin/testimony/moderation"),
          fetchApi("/api/volunteers/available"),
          fetchApi("/api/admin/supervisors"),
        ]);

        if (Array.isArray(allVolunteersData)) {
          setAllVolunteers(allVolunteersData.filter((v) => v.role === "volunteer"));
        }

        if (Array.isArray(supervisorsData)) setAllSupervisors(supervisorsData);

        if (Array.isArray(volunteersData)) {
          setPendingVolunteers(volunteersData.filter((v) => v.status === "pending" || !v.isValidated));
        }

        if (Array.isArray(missionsData)) {
          setMissions(missionsData);
          setUrgentMissions(missionsData.filter((m) => m.isUrgent));
        }

        if (Array.isArray(testimoniesData)) setModerations(testimoniesData);
        if (Array.isArray(availableData)) setAvailableVolunteers(availableData);
      } catch (err) {
        console.error("Erreur chargement dashboard admin :", err.message);
        toast.error("Erreur lors du chargement des données du dashboard.");
        router.push("/admin/login");
      } finally {
        setLoading(false);
      }
    }

    init();
  }, [router]);

  const dashboardData = useMemo(
    () => ({
      pendingVolunteers,
      allVolunteers,
      allSupervisors,
      missions,
      moderations,
      urgentMissions,
      availableVolunteers,
    }),
    [
      pendingVolunteers,
      allVolunteers,
      allSupervisors,
      missions,
      moderations,
      urgentMissions,
      availableVolunteers,
    ]
  );

  if (loading) return <LoadingState />;

  return (
    <div className="min-h-screen bg-[#fbf3ea] text-[#332c26]">
      <AdminNavbar />
      <InactivityTimerAdmin />

      <main className="mx-auto grid max-w-8xl gap-6 px-4 pb-12 pt-28 sm:px-6 lg:grid-cols-[300px_minmax(0,1fr)] lg:px-8">
        <SideNavigation activeTab={activeTab} setActiveTab={setActiveTab} data={dashboardData} />

        <div className="min-w-0">
          <div className="mb-6 flex flex-col gap-3 rounded-[2rem] border border-[#eadfd3] bg-[#fffaf5] p-6 shadow-sm md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#8B1E3F]">
                Espace administrateur
              </p>
              <h1 className="mt-2 text-3xl font-bold text-[#2f2a26] md:text-4xl">
                Bonjour {adminName || "Admin"}
              </h1>
            </div>
            <p className="max-w-md text-sm leading-6 text-[#6B5B4D]">
              Un poste de responsabilité pensé pour voir, accueillir, orienter et réparer.
            </p>
          </div>

          {activeTab === "dashboard" && (
            <DashboardHome data={dashboardData} setActiveTab={setActiveTab} />
          )}

          {activeTab === "moderationPrayers" && (
            <ViewFrame activeTab={activeTab}>
              <AdminPrayersPage />
            </ViewFrame>
          )}
          {activeTab === "missions" && (
            <ViewFrame activeTab={activeTab}>
              <AdminMissionsPage />
            </ViewFrame>
          )}
          {activeTab === "volunteers_pending" && (
            <ViewFrame activeTab={activeTab}>
              <AdminVolunteersPendingPage />
            </ViewFrame>
          )}
          {activeTab === "manage_volunteers" && (
            <ViewFrame activeTab={activeTab}>
              <AdminManageVolunteersPage />
            </ViewFrame>
          )}
          {activeTab === "supervisors" && (
            <ViewFrame activeTab={activeTab}>
              <AdminManageSupervisorsPage />
            </ViewFrame>
          )}
          {activeTab === "moderation" && (
            <ViewFrame activeTab={activeTab}>
              <AdminTestimoniesPage />
            </ViewFrame>
          )}
          {activeTab === "videos" && (
            <ViewFrame activeTab={activeTab}>
              <AdminVideosPage />
            </ViewFrame>
          )}
        </div>
      </main>
    </div>
  );
}
