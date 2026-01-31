"use client";

import Link from "next/link";
import {
  FiPlus,
  FiSearch,
  FiEye,
  FiEdit2,
  FiTrash2,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";
import {
  HiOutlineBookOpen,
  HiOutlineHeart,
  HiOutlineEye,
  HiOutlineClock,
  HiOutlineSparkles,
} from "react-icons/hi";

/* ======================================================
   SUPERVISOR – GESTION DES RESSOURCES
   Sidebar supprimée volontairement
====================================================== */

export default function SupervisorResourcesPage() {
  return (
    <main className="min-h-screen bg-[#F8F9FC] dark:bg-[#0f1323] text-[#1E1B39] dark:text-white">

      {/* ================= HEADER PAGE ================= */}
      <header className="sticky top-0 z-20 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md px-6 py-8 lg:px-12">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">
              Gestion des Ressources
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 font-medium">
              Contrôlez et optimisez vos contenus spirituels
            </p>
          </div>

          <Link
            href="/supervisor/resources/create"
            className="flex items-center gap-3 bg-gradient-to-r from-primary to-[#7C62F2] text-white font-bold py-3.5 px-6 rounded-2xl shadow-glow hover:-translate-y-0.5 transition">
            <FiPlus className="text-lg" />
            <span className="text-sm tracking-wide">Créer une ressource</span>
          </Link>
        </div>
      </header>

      {/* ================= CONTENT ================= */}
      <section className="px-6 lg:px-12 pb-14 max-w-7xl mx-auto space-y-10">

        {/* ================= KPI ================= */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            icon={<HiOutlineBookOpen />}
            value="124"
            label="Total Ressources"
            badge="+12%"
            color="blue"
            badgeColor="green"
          />
          <StatCard
            icon={<HiOutlineEye />}
            value="12.4k"
            label="Vues Totales"
            badge="Hebdo"
            color="amber"
            badgeColor="gray"
          />
          <StatCard
            icon={<HiOutlineHeart />}
            value="8"
            label="Mes ressources publiés"
            badge="Active"
            color="purple"
            badgeColor="green"
          />        
          <StatCard
            icon={<HiOutlineClock />}
            value="3"
            label="Mes Brouillons"
            badge="Urgent"
            color="rose"
            badgeColor="red"
          />
        </div>

        {/* ================= SEARCH & FILTER ================= */}
        <div className="flex flex-col md:flex-row items-center gap-4 bg-white dark:bg-white/5 p-3 rounded-[2rem] border border-border-light dark:border-white/5 shadow-soft">
          <div className="relative flex-1 w-full">
            <FiSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
            <input
              type="text"
              placeholder="Rechercher une ressource par titre ou étiquette..."
              className="w-full pl-14 pr-6 py-4 bg-transparent border-none focus:ring-0 text-sm font-medium placeholder:text-gray-400"
            />
          </div>

          <div className="hidden md:block h-10 w-px bg-border-light" />

          <div className="flex items-center gap-2 w-full md:w-auto">
            <select className="bg-gray-50 dark:bg-white/5 rounded-2xl px-6 py-3 text-sm font-bold text-gray-600 focus:ring-2 focus:ring-primary/20 cursor-pointer">
              <option>Toutes les Catégories</option>
              <option>Enseignements</option>
              <option>Prière</option>
              <option>Méditation</option>
            </select>

            <button className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 size-12 rounded-2xl flex items-center justify-center hover:scale-105 transition">
              <HiOutlineSparkles />
            </button>
          </div>
        </div>

        {/* ================= LIST HEADER ================= */}
        <div className="flex items-center justify-between px-4">
          <h3 className="text-xs font-extrabold text-gray-400 uppercase tracking-[0.2em]">
            Liste des Ressources
          </h3>
          <span className="text-xs font-bold text-primary cursor-pointer">
            Afficher tout
          </span>
        </div>

        {/* ================= RESOURCE LIST ================= */}
        <div className="space-y-4">
          {resources.map((r, i) => (
            <ResourceRow key={i} resource={r} />
          ))}
        </div>

        {/* ================= PAGINATION ================= */}
        <div className="flex items-center justify-between pt-6">
          <p className="text-sm font-bold text-gray-400 italic">
            Affichage de 3 sur 124 ressources
          </p>

          <div className="flex items-center gap-3">
            <button
              disabled
              className="size-11 flex items-center justify-center rounded-2xl border border-border-light bg-white dark:bg-white/5 text-gray-400 opacity-30"
            >
              <FiChevronLeft />
            </button>

            <div className="flex gap-1">
              <button className="size-11 rounded-2xl bg-primary text-white font-bold shadow-glow">
                1
              </button>
              <button className="size-11 rounded-2xl hover:bg-gray-100 dark:hover:bg-white/10 font-bold">
                2
              </button>
              <button className="size-11 rounded-2xl hover:bg-gray-100 dark:hover:bg-white/10 font-bold">
                3
              </button>
            </div>

            <button className="size-11 flex items-center justify-center rounded-2xl border border-border-light bg-white dark:bg-white/5 text-gray-400 hover:text-primary">
              <FiChevronRight />
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}

/* ======================================================
   COMPONENTS
====================================================== */

function StatCard({ icon, value, label, badge, color, badgeColor }) {
  return (
    <Link 
      href="/"
      className="bg-white dark:bg-white/5 p-6 rounded-3xl border border-border-light dark:border-white/5 shadow-soft hover:border-primary/30 transition">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-2.5 rounded-xl text-${color}-600 bg-${color}-50 dark:bg-${color}-500/10`}>
          {icon}
        </div>
        <span className="text-[10px] bg-${badgeColor}-600 font-bold px-2 py-1 rounded-lg dark:bg-${badgeColor}-300">
          {badge}
        </span>
      </div>

      <p className="text-2xl font-extrabold">{value}</p>
      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">
        {label}
      </p>
    </Link>
  );
}

function ResourceRow({ resource }) {
  return (
    <div className="group bg-white dark:bg-white/5 hover:bg-gray-50 dark:hover:bg-white/[0.08] p-5 rounded-[2rem] border border-border-light dark:border-white/5 shadow-sm transition flex flex-wrap items-center gap-6">
      <div className={`size-14 rounded-2xl bg-${resource.color}-50 dark:bg-${resource.color}-500/10 flex items-center justify-center text-${resource.color}-600`}>
        {resource.icon}
      </div>

      <div className="flex-1 min-w-[200px]">
        <h4 className="font-bold text-lg mb-1 group-hover:text-primary transition">
          {resource.title}
        </h4>
        <div className="flex items-center gap-4 text-xs font-bold text-gray-400">
          <span>{resource.date}</span>
          <span>{resource.relative}</span>
          <span>{resource.creation}</span>
        </div>
      </div>

      <div className="hidden lg:block">
        <span className={`px-4 py-1.5 bg-${resource.color}-50 dark:bg-${resource.color}-500/10 text-${resource.color}-600 text-[11px] font-extrabold rounded-full`}>
          {resource.category}
        </span>
      </div>

      <div className="w-32 flex justify-center">
        <span className={`px-3 py-1.5 text-[11px] font-bold rounded-full bg-${resource.statusColor}-50 dark:bg-${resource.statusColor}-500/10 text-${resource.statusColor}-600`}>
          {resource.status}
        </span>
      </div>

      <div className="flex gap-1.5">
        <IconBtn icon={<FiEye />} />
        <IconBtn icon={<FiEdit2 />} />
        <IconBtn icon={<FiTrash2 />} danger />
      </div>
    </div>
  );
}

function IconBtn({ icon, danger }) {
  return (
    <button
      className={`size-10 flex items-center justify-center rounded-xl transition ${
        danger
          ? "hover:text-rose-500 hover:bg-rose-50"
          : "hover:text-primary hover:bg-primary/5"
      }`}
    >
      {icon}
    </button>
  );
}

/* ======================================================
   MOCK DATA
====================================================== */

const resources = [
  {
    title: "La Puissance de la Foi en Temps de Crise",
    date: "12 Oct 2023",
    creation: "Créer par Dave",
    relative: "Il y a 2 jours",
    category: "Enseignement",
    status: "Publié",
    statusColor: "emerald",
    color: "indigo",
    icon: <HiOutlineBookOpen />,
  },
  {
    title: "Méditation Matinale : Paix et Sérénité",
    date: "14 Oct 2023",
    creation: "Créer par Jack",
    relative: "Hier",
    category: "Méditation",
    status: "Brouillon",
    statusColor: "gray",
    color: "amber",
    icon: <HiOutlineClock />,
  },
  {
    title: "Guide de la Prière Intercessive",
    date: "15 Oct 2023",
    creation: "Créer par Romyna",
    relative: "Aujourd'hui",
    category: "Prière",
    status: "Publié",
    statusColor: "emerald",
    color: "rose",
    icon: <HiOutlineHeart />,
  },
];
