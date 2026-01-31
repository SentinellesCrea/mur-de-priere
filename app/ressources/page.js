"use client";

import {
  FiSearch,
  FiClock,
  FiPlay,
  FiArrowRight,
  FiHeadphones,
  FiBookOpen,
  FiVideo,
} from "react-icons/fi";
import { useEffect, useState } from "react";
import { fetchApi } from "@/lib/fetchApi";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

/* ======================================================
   PAGE : Bibliothèque de Ressources
   Sans Header / Sans Footer
====================================================== */

export default function ResourcesLibraryPage() {

  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("Tous");

  const categories = [
    "Tous",
    "Enseignements",
    "Prière",
    "Méditation",
    "Vivre l'Église",
    "La Foi",
  ];


  useEffect(() => {
    const timer = setTimeout(async () => {
      try {
        setLoading(true);

        const params = new URLSearchParams();

        if (searchTerm) {
          params.append("search", searchTerm);
        }

        if (activeCategory && activeCategory !== "Tous") {
          params.append("category", activeCategory);
        }

        const res = await fetchApi(`/api/resources?${params.toString()}`);
        setResources(res.data || []);
      } catch (error) {
        console.error("Erreur chargement ressources", error);
        setResources([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm, activeCategory]);



  return (
    <main className="min-h-screen bg-[#f7f7f6] dark:bg-[#1d1a15] text-[#100e1b] dark:text-white transition-colors">
      <Navbar />

      {/* ================= CONTAINER ================= */}
      <div className="max-w-[1200px] mx-auto px-4 md:px-8 py-10">

        {/* ================= PAGE HEADER ================= */}
        <header className="mb-10">
          <h1 className="text-3xl md:text-4xl font-extrabold mb-2">
            Bibliothèque de Ressources
          </h1>
          <p className="text-lg text-[#5a4d99] dark:text-[#D0BB95]/70">
            Nourrissez votre âme avec nos enseignements et méditations sélectionnés.
          </p>
        </header>

        {/* ================= FEATURED RESOURCE ================= */}
        <section className="mb-12">
          <div className="group overflow-hidden rounded-xl bg-white dark:bg-white/5 border border-[#e9e7f3] dark:border-white/10 shadow-sm hover:shadow-xl transition">
            <div className="grid grid-cols-1 xl:grid-cols-2">
              
              {/* IMAGE */}
              <div
                className="aspect-video bg-cover bg-center"
                style={{
                  backgroundImage:
                    "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBhXYhsne2fRX2mUO9D7cyiTHIYrbOf21TnecBZnKHjnb1bWPgQQZE4UAzInEI1W_mwnUHWLO65VNTYOKxqhE5IsZ2sdTl1Ne4Lw_Xd4z8SIYBty1g66VmPJcRVS4_pbDLcweEK_6e1IdDHCz0LCAKf8mkez6IPdoATfQbqHJTwQOpDlAFihDdZKmGIZEaqDvUz7mcALw1hCYkGMWs-MDfp0rO9cPmo00-60Q6vPXoxHndlW4TGamihs_Iih2ZJWUagZTdXw9ZIuA')",
                }}
              />

              {/* CONTENT */}
              <div className="p-8 lg:p-10 flex flex-col gap-4 justify-center">
                <span className="bg-[#D0BB95]/10 text-[#D0BB95] text-xs font-bold px-3 py-1 rounded-full w-fit uppercase">
                  À la une
                </span>

                <h2 className="text-2xl lg:text-3xl font-bold leading-tight">
                  Marcher dans la Foi : Un Guide de 7 Jours vers la Paix Intérieure
                </h2>

                <p className="text-[#5a4d99] dark:text-white/60">
                  Découvrez comment cultiver une tranquillité durable à travers
                  des enseignements quotidiens et des exercices de méditation
                  profonde inspirés par les écritures.
                </p>

                <button className="mt-2 w-fit bg-[#D0BB95] text-white px-6 py-3 rounded-full font-bold hover:scale-105 transition">
                  Commencer la lecture
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ================= SEARCH & FILTER ================= */}
        <section className="sticky top-4 z-40 bg-[#f7f7f6] dark:bg-[#1d1a15] py-4 space-y-4">

          {/* SEARCH */}
          <div className="flex items-center h-14 rounded-xl overflow-hidden bg-white dark:bg-white/5 border border-[#e9e7f3] dark:border-white/10">
            <div className="px-4 text-[#5a4d99]">
              <FiSearch />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Rechercher un enseignement, une prière..."
              className="flex-1 h-full bg-transparent px-2 text-base focus:outline-none placeholder:text-[#5a4d99] dark:placeholder:text-white/40"
            />
          </div>

          {/* FILTER PILLS */}
          <div className="flex gap-3 overflow-x-auto pb-1">
            {categories.map((label) => {
              const isActive = activeCategory === label;

              return (
                <div
                  key={label}
                  onClick={() => {
                    setActiveCategory(label);
                    setSearchTerm("");
                  }}
                  className={`shrink-0 px-6 h-10 flex items-center justify-center rounded-full border text-sm font-bold cursor-pointer transition
                    ${
                      isActive
                        ? "bg-[#D0BB95] text-white border-[#D0BB95]"
                        : "bg-white dark:bg-white/5 border-[#e9e7f3] dark:border-white/10 hover:border-[#D0BB95]/50"
                    }`}
                >
                  {label}
                </div>
              );
            })}
          </div>
        </section>

        {/* ================= RESOURCES GRID ================= */}
        <section className="py-12">

          {/* ⏳ LOADING */}
          {loading && (
            <p className="text-sm text-center opacity-60 py-6">
              Recherche en cours...
            </p>
          )}

          {/* ❌ AUCUN RÉSULTAT */}
          {!loading && resources.length === 0 && (
            <p className="text-sm text-center opacity-60 py-10">
              Aucune ressource ne correspond à votre recherche.
            </p>
          )}

          {/* 🧱 GRID */}
          {!loading && resources.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {resources.map((r) => (
                <article
                  key={r._id}
                  className="group rounded-xl overflow-hidden bg-white dark:bg-white/5 border border-[#e9e7f3] dark:border-white/10 hover:shadow-lg transition"
                >
                  {/* IMAGE */}
                  <div
                    className="relative aspect-[16/10] bg-cover bg-center"
                    style={{ backgroundImage: `url('${r.coverImage}')` }}
                  >
                    <span className="absolute top-3 left-3 bg-white/90 dark:bg-[#131121]/90 text-[#D0BB95] text-[10px] font-bold px-2 py-1 rounded-md uppercase">
                      {r.category}
                    </span>
                  </div>

                  {/* CONTENT */}
                  <div className="p-5 flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-xs text-[#5a4d99] dark:text-[#D0BB95]/70 font-medium">
                      <FiClock />
                      <span>{r.readingTime} min de lecture</span>
                    </div>

                    <h3 className="text-lg font-bold leading-tight">
                      {r.title}
                    </h3>

                    <p className="text-sm text-[#5a4d99] dark:text-white/60 line-clamp-2">
                      {r.excerpt}
                    </p>

                    <a
                      href={`/ressources/${r.slug}`}
                      className="mt-2 text-[#D0BB95] text-sm font-bold flex items-center gap-1 group-hover:gap-2 transition-all"
                    >
                      Lire plus
                      <FiArrowRight />
                    </a>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>


        {/* ================= LOAD MORE ================= */}
        <div className="flex justify-center py-10">
          <button className="px-8 h-12 rounded-full border-2 border-[#D0BB95] text-[#D0BB95] font-bold hover:bg-[#D0BB95] hover:text-white transition">
            Voir plus de ressources
          </button>
        </div>
      </div>

      <Footer />
    </main>
  );
}

