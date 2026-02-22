"use client";

import { FiSearch, FiClock, FiArrowRight } from "react-icons/fi";
import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { fetchApi } from "@/lib/fetchApi";
import Image from "next/image";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function ResourcesLibraryPage() {
  const router = useRouter();

  const [resources, setResources] = useState([]);
  const [allResources, setAllResources] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("Tous");

  // ✅ UI labels (inchangés)
  const categories = [
    "Tous",
    "Enseignements",
    "Prière",
    "Méditation",
    "Vivre l'Église",
    "La Foi",
  ];

  // ✅ Mapping UI → enum DB
  const categoryMap = {
    Enseignements: "enseignement",
    Prière: "priere",
    Méditation: "meditation",
    "Vivre l'Église": "encouragement",
    "La Foi": "foi",
  };

  /* ================= FETCH ALL FOR FEATURED ================= */
  useEffect(() => {
    const fetchAll = async () => {
      try {
        const res = await fetchApi("/api/resources");
        setAllResources(res.data || []);
      } catch (error) {
        console.error("Erreur chargement featured", error);
      }
    };

    fetchAll();
  }, []);

  /* ================= FETCH FILTERED ================= */
  useEffect(() => {
    const timer = setTimeout(async () => {
      try {
        setLoading(true);

        const params = new URLSearchParams();

        if (searchTerm) {
          params.append("search", searchTerm);
        }

        // ✅ Ici on envoie la valeur DB (slug)
        if (activeCategory && activeCategory !== "Tous") {
          const mapped = categoryMap[activeCategory];
          if (mapped) params.append("category", mapped);
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

  /* ================= DERNIÈRE RESSOURCE (GLOBAL) ================= */
  const latestResource = useMemo(() => {
    if (!allResources || allResources.length === 0) return null;

    const sorted = [...allResources].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );

    return sorted[0];
  }, [allResources]);

  /* ================= CHECK IF NEW ================= */
  const isNew = (date) => {
    const now = new Date();
    const published = new Date(date);
    const diff = (now - published) / (1000 * 60 * 60 * 24);
    return diff <= 7;
  };

  /* ================= GRID WITHOUT FEATURED ================= */
  const otherResources = useMemo(() => {
    if (!latestResource) return resources;
    return resources.filter((r) => r._id !== latestResource._id);
  }, [resources, latestResource]);

  // ✅ Pour afficher un label propre même si la DB a "priere"
  const categoryLabelFromDb = (dbValue) => {
    const reverse = {
      priere: "Prière",
      meditation: "Méditation",
      encouragement: "Vivre l'Église",
      enseignement: "Enseignements",
      foi: "La Foi",
      autres: "Autres",
    };

    return reverse[dbValue] || dbValue;
  };

  return (
    <main className="min-h-screen bg-[#f7f7f6] dark:bg-[#1d1a15] text-[#100e1b] dark:text-white transition-colors">
      <Navbar />

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
        {latestResource && (
          <section className="mb-12">
            <div className="group overflow-hidden rounded-xl bg-white dark:bg-white/5 border border-[#e9e7f3] dark:border-white/10 shadow-sm hover:shadow-xl transition">
              <div className="grid grid-cols-1 xl:grid-cols-2">
                {/* IMAGE */}
                <div className="relative overflow-hidden">
                  <Image
                    src={latestResource.coverImage}
                    alt={latestResource.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1280px) 100vw, 50vw"
                    priority
                  />

                  {isNew(latestResource.createdAt) && (
                    <span className="absolute top-3 right-3 bg-red-500 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase shadow-md">
                      Nouveau
                    </span>
                  )}
                </div>

                {/* CONTENT */}
                <div className="p-8 lg:p-10 flex flex-col gap-4 justify-center">
                  <span className="bg-[#D0BB95]/10 text-[#D0BB95] text-xs font-bold px-3 py-1 rounded-full w-fit uppercase">
                    À la une
                  </span>

                  <span className="text-xs text-gray-400">
                    Publié le{" "}
                    {new Date(latestResource.createdAt).toLocaleDateString("fr-FR")}
                  </span>

                  <h2 className="text-2xl lg:text-3xl font-bold leading-tight">
                    {latestResource.title}
                  </h2>

                  <p className="text-[#5a4d99] dark:text-white/60">
                    {latestResource.excerpt}
                  </p>

                  <button
                    onClick={() => router.push(`/ressources/${latestResource.slug}`)}
                    className="mt-2 w-fit bg-[#D0BB95] text-white px-6 py-3 rounded-full font-bold hover:scale-105 transition"
                  >
                    Commencer la lecture
                  </button>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ================= SEARCH & FILTER ================= */}
        <section className="sticky top-4 z-40 bg-[#f7f7f6] dark:bg-[#1d1a15] py-4 space-y-4">
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
          {loading && (
            <p className="text-sm text-center opacity-60 py-6">
              Recherche en cours...
            </p>
          )}

          {!loading && otherResources.length === 0 && (
            <p className="text-sm text-center opacity-60 py-10">
              Aucune ressource ne correspond à votre recherche.
            </p>
          )}

          {!loading && otherResources.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {otherResources.map((r) => (
                <article
                  key={r._id}
                  className="group rounded-xl overflow-hidden bg-white dark:bg-white/5 border border-[#e9e7f3] dark:border-white/10 hover:shadow-lg transition"
                >
                  <div
                    className="relative aspect-[16/10] bg-cover bg-center"
                    style={{ backgroundImage: `url('${r.coverImage}')` }}
                  >
                    <span className="absolute top-3 left-3 bg-white/90 dark:bg-[#131121]/90 text-[#D0BB95] text-[10px] font-bold px-2 py-1 rounded-md uppercase">
                      {categoryLabelFromDb(r.category)}
                    </span>

                    {isNew(r.createdAt) && (
                      <span className="absolute top-3 right-3 bg-red-500 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase shadow-md">
                        Nouveau
                      </span>
                    )}
                  </div>

                  <div className="p-5 flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-xs text-[#5a4d99] dark:text-[#D0BB95]/70 font-medium">
                      <FiClock />
                      <span>{r.readingTime} min de lecture</span>
                    </div>

                    <h3 className="text-lg font-bold leading-tight">{r.title}</h3>

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
