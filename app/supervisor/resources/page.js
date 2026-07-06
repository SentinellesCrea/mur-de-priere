"use client";

import Link from "next/link";
import {
  FiPlus,
  FiSearch,
  FiEye,
  FiEdit2,
  FiTrash2,
} from "react-icons/fi";
import {
  HiOutlineBookOpen,
  HiOutlineHeart,
  HiOutlineEye,
  HiOutlineClock,
  HiOutlineSparkles,
} from "react-icons/hi";
import { useCallback, useEffect, useState, useMemo } from "react";
import { fetchApi } from "@/lib/fetchApi";
import { useAutoRefresh } from "@/lib/useAutoRefresh";

/* ======================================================
   SUPERVISOR – GESTION DES RESSOURCES
====================================================== */

const SAFE_RESOURCE_REF = /^[a-z0-9][a-z0-9-]{0,120}$/i;

function publicResourceRef(resource) {
  return SAFE_RESOURCE_REF.test(resource?.slug || "")
    ? resource.slug
    : resource?._id;
}

export default function SupervisorResourcesPage() {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");

  const [stats, setStats] = useState({
    total: 0,
    published: 0,
    drafts: 0,
    archived: 0,
  });

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetchApi("/api/supervisor/resources/stats");
      setStats(res);
    } catch (err) {
      console.error("Erreur fetch stats", err);
    }
  }, []);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetchApi("/api/supervisor/resources");
      setResources(res.data || []);
      await fetchStats();
    } catch (err) {
      console.error("Erreur fetch ressources", err);
    } finally {
      setLoading(false);
    }
  }, [fetchStats]);

  useEffect(() => {
    const timer = window.setTimeout(fetchData, 0);
    return () => window.clearTimeout(timer);
  }, [fetchData]);

  useAutoRefresh(fetchData, {
    enabled: !loading,
    intervalMs: 12000,
  });


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
    <main className="text-[#1E1B39]">

      {/* ================= HEADER ================= */}
      <header className="rounded-[2rem] bg-white border border-[#E7E0D8] shadow-sm p-5 sm:p-7 lg:p-8 mb-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-[#5c40e7] mb-3">
              Bibliothèque
            </p>
            <h1 className="text-3xl font-extrabold tracking-tight text-gray-950">
              Ressources
            </h1>
            <p className="text-sm text-gray-500 mt-2 font-medium max-w-2xl leading-6">
              Retrouvez vos enseignements, méditations et supports spirituels à publier ou à reprendre plus tard.
            </p>
          </div>

          <Link
            href="/supervisor/resources/create"
            className="flex items-center justify-center gap-3 bg-[#5c40e7] text-white font-extrabold py-3.5 px-6 rounded-2xl shadow-lg shadow-[#5c40e7]/15 hover:-translate-y-0.5 transition">
            <FiPlus className="text-lg" />
            <span className="text-sm tracking-wide">Créer une ressource</span>
          </Link>
        </div>
      </header>

      {/* ================= CONTENT ================= */}
      <section className="pb-14 max-w-7xl mx-auto space-y-8">

        {/* ================= KPI ================= */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={<HiOutlineBookOpen />}
            value={stats.total}
            label="Ressources"
            badge=""
            color="#EDE9FE"
          />

          <StatCard icon={<HiOutlineEye />} value={stats.archived} label="Archivées" badge="" color="#E5E7EB" />

          <StatCard
            icon={<HiOutlineHeart />}
            value={stats.published}
            label="Publiées"
            badge=""
            color="#DCFCE7"
          />

          <StatCard
            icon={<HiOutlineClock />}
            value={stats.drafts}
            label="Brouillons"
            badge=""
            color="#FCE7F3"
          />

        </div>

        {/* ================= SEARCH & FILTER ================= */}
        <div className="flex flex-col md:flex-row items-center gap-4 bg-white p-3 rounded-[1.75rem] border border-[#E7E0D8] shadow-sm">
          <div className="relative flex-1 w-full">
            <FiSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher une ressource..."
              className="w-full pl-14 pr-6 py-4 bg-transparent border-none outline-none focus:ring-0 text-sm font-medium placeholder:text-gray-400"
            />
          </div>

          <div className="hidden md:block h-10 w-px bg-[#E7E0D8]" />

          <div className="flex items-center gap-2 w-full md:w-auto">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full md:w-auto bg-[#F8F5EF] rounded-2xl px-6 py-3 text-sm font-bold text-gray-600 outline-none focus:ring-4 focus:ring-[#5c40e7]/10 cursor-pointer"
            >
              <option value="all">Toutes les catégories</option>
              <option value="enseignement">Enseignement</option>
              <option value="priere">Prière</option>
              <option value="meditation">Méditation</option>
              <option value="encouragement">Encouragement</option>
              <option value="foi">Foi</option>
              <option value="autres">Autres</option>
            </select>

            <button
              type="button"
              className="bg-gray-950 text-white size-12 rounded-2xl flex items-center justify-center hover:scale-105 transition"
            >
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

          {!loading && filteredResources.length === 0 && (
            <div className="rounded-[1.75rem] border border-dashed border-[#D8CEC2] bg-white p-8 text-center">
              <p className="font-extrabold text-gray-900">Aucune ressource trouvée</p>
              <p className="mt-2 text-sm text-gray-500">
                Essayez une autre recherche ou créez une nouvelle ressource.
              </p>
            </div>
          )}
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
    <div className="bg-white p-5 rounded-[1.5rem] border border-[#E7E0D8] shadow-sm">
      <div
        className="mb-4 flex size-11 items-center justify-center rounded-2xl text-[#5c40e7]"
        style={{ backgroundColor: color }}
      >
        {icon}
      </div>
      <p className="text-2xl font-extrabold">{value}</p>
      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">
        {label}
      </p>
    </div>
  );
}

function ResourceRow({ resource }) {
  const status = resource.status || "published";
  const isPublished = status === "published";
  const isArchived = status === "archived";
  const publicRef = publicResourceRef(resource);

  return (
    <div className="group bg-white hover:bg-[#FBFAF7] p-5 rounded-[1.75rem] border border-[#E7E0D8] shadow-sm transition flex flex-wrap items-center gap-5">
      <div className="flex-1 min-w-[200px]">
        <h4 className="font-extrabold text-lg mb-1 group-hover:text-[#5c40e7] transition">
          {resource.title}
        </h4>
        <div className="flex flex-wrap items-center gap-3 text-xs font-bold text-gray-400">
          <span>
            {new Date(resource.createdAt).toLocaleDateString("fr-FR")}
          </span>
          <span>{resource.readingTime || 1} min de lecture</span>
        </div>
      </div>

      <div className="hidden lg:block">
        <span className="px-4 py-1.5 bg-[#F4F1FF] text-[#5c40e7] text-[11px] font-extrabold rounded-full">
          {resource.category}
        </span>
      </div>

      <div className="w-32 flex justify-center">
        <span className={`px-3 py-1.5 text-[11px] font-extrabold rounded-full ${
          isPublished
            ? "bg-emerald-50 text-emerald-600"
            : isArchived
              ? "bg-gray-100 text-gray-500"
              : "bg-amber-50 text-amber-600"
        }`}>
          {isPublished ? "Publié" : isArchived ? "Archivé" : "Brouillon"}
        </span>
      </div>

      <div className="flex gap-1.5">
        {isPublished && publicRef ? (
          <IconBtn as={Link} href={`/ressources/${publicRef}`} icon={<FiEye />} label="Voir" />
        ) : (
          <IconBtn icon={<FiEye />} label="Voir" disabled />
        )}
        <IconBtn as={Link} href={`/supervisor/resources/${resource._id}`} icon={<FiEdit2 />} label="Modifier" />
        <IconBtn icon={<FiTrash2 />} label="Supprimer" danger disabled />
      </div>
    </div>
  );
}

function IconBtn({ as: Component = "button", href, icon, label, danger, disabled }) {
  const classes = `size-10 flex items-center justify-center rounded-xl transition ${
    disabled
      ? "cursor-not-allowed text-gray-300 bg-gray-50"
      : danger
        ? "hover:text-rose-500 hover:bg-rose-50"
        : "hover:text-[#5c40e7] hover:bg-[#F4F1FF]"
  }`;

  if (Component !== "button") {
    return (
      <Component href={href} aria-label={label} title={label} className={classes}>
        {icon}
      </Component>
    );
  }

  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      className={classes}
    >
      {icon}
    </button>
  );
}
