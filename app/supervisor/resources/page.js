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
import { useEffect, useState, useMemo } from "react";
import { fetchApi } from "@/lib/fetchApi";

/* ======================================================
   SUPERVISOR – GESTION DES RESSOURCES
====================================================== */

export default function SupervisorResourcesPage() {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");

  const [stats, setStats] = useState({
    total: 0,
    published: 0,
    drafts: 0,
  });


  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetchApi("/api/resources");
        setResources(res.data || []);
        await fetchStats();
      } catch (err) {
        console.error("Erreur fetch ressources", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);



  const fetchStats = async () => {
    try {
      const res = await fetchApi("/api/supervisor/resources/stats");
      setStats(res);
    } catch (err) {
      console.error("Erreur fetch stats", err);
    }
  };


  /* ================= FILTERED DATA ================= */
  const filteredResources = useMemo(() => {
    return resources.filter((r) => {
      const matchSearch = r.title
        ?.toLowerCase()
        .includes(search.toLowerCase());

      const matchCategory =
        category === "all" ? true : r.category === category;

      return matchSearch && matchCategory;
    });
  }, [resources, search, category]);

  

  return (
    <main className="min-h-screen text-[#1E1B39] dark:text-white">

      {/* ================= HEADER ================= */}
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
            value={stats.total}
            label="Total Ressources"
            badge=""
            color="blue"
          />

          <StatCard icon={<HiOutlineEye />} value="-" label="Vues Totales" badge="" color="amber" />

          <StatCard
            icon={<HiOutlineHeart />}
            value={stats.published}
            label="Publiées"
            badge=""
            color="purple"
          />

          <StatCard
            icon={<HiOutlineClock />}
            value={stats.drafts}
            label="Brouillons"
            badge=""
            color="rose"
          />

        </div>

        {/* ================= SEARCH & FILTER ================= */}
        <div className="flex flex-col md:flex-row items-center gap-4 bg-white dark:bg-white/5 p-3 rounded-[2rem] border border-border-light dark:border-white/5 shadow-soft">
          <div className="relative flex-1 w-full">
            <FiSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher une ressource..."
              className="w-full pl-14 pr-6 py-4 bg-transparent border-none focus:ring-0 text-sm font-medium placeholder:text-gray-400"
            />
          </div>

          <div className="hidden md:block h-10 w-px bg-border-light" />

          <div className="flex items-center gap-2 w-full md:w-auto">
            <select
              onChange={(e) => setCategory(e.target.value)}
              className="bg-gray-50 dark:bg-white/5 rounded-2xl px-6 py-3 text-sm font-bold text-gray-600 focus:ring-2 focus:ring-primary/20 cursor-pointer"
            >
              <option value="all">Toutes les Catégories</option>
              <option value="enseignement">Enseignement</option>
              <option value="priere">Prière</option>
              <option value="meditation">Méditation</option>
            </select>

            <button className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 size-12 rounded-2xl flex items-center justify-center hover:scale-105 transition">
              <HiOutlineSparkles />
            </button>
          </div>
        </div>

        {/* ================= RESOURCE LIST ================= */}
        <div className="space-y-4">
          {loading && <p className="text-sm text-gray-400">Chargement...</p>}

          {!loading &&
            filteredResources.map((r) => (
              <ResourceRow key={r._id} resource={r} />
            ))}
        </div>
      </section>
    </main>
  );
}

/* ======================================================
   COMPONENTS
====================================================== */

function StatCard({ icon, value, label, color }) {
  return (
    <div className="bg-white dark:bg-white/5 p-6 rounded-3xl border border-border-light dark:border-white/5 shadow-soft">
      <div className="mb-4">{icon}</div>
      <p className="text-2xl font-extrabold">{value}</p>
      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">
        {label}
      </p>
    </div>
  );
}

function ResourceRow({ resource }) {
  return (
    <div className="group bg-white dark:bg-white/5 hover:bg-gray-50 dark:hover:bg-white/[0.08] p-5 rounded-[2rem] border border-border-light dark:border-white/5 shadow-sm transition flex flex-wrap items-center gap-6">
      <div className="flex-1 min-w-[200px]">
        <h4 className="font-bold text-lg mb-1 group-hover:text-primary transition">
          {resource.title}
        </h4>
        <div className="flex items-center gap-4 text-xs font-bold text-gray-400">
          <span>
            {new Date(resource.createdAt).toLocaleDateString("fr-FR")}
          </span>
          <span>{resource.author || "Auteur inconnu"}</span>
        </div>
      </div>

      <div className="hidden lg:block">
        <span className="px-4 py-1.5 bg-indigo-50 text-indigo-600 text-[11px] font-extrabold rounded-full">
          {resource.category}
        </span>
      </div>

      <div className="w-32 flex justify-center">
        <span className="px-3 py-1.5 text-[11px] font-bold rounded-full bg-emerald-50 text-emerald-600">
          {resource.status || "Publié"}
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
