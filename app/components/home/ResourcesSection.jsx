"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { fetchApi } from "@/lib/fetchApi";

export default function ResourcesSection() {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  async function loadResources() {
    try {
      const res = await fetchApi("/api/resources");

      if (Array.isArray(res?.data)) {
        setResources(res.data);
      } else {
        setResources([]);
      }
    } catch (error) {
      console.error("Erreur chargement ressources :", error);
      setResources([]);
    } finally {
      setLoading(false);
    }
  }

  loadResources();
}, []);


  return (
    <section id="RessourcesSection" className="w-full bg-[#FAF7F4] py-20">
      <div className="max-w-[1400px] mx-auto px-6">

        {/* ================= HEADER ================= */}
        <div className="text-center mb-16 font-poppins">
          <h2 className="text-3xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Enseignements & Ressources
          </h2>
          <p className="text-gray-600">
            Approfondissez votre foi à travers des enseignements inspirants.
          </p>
        </div>

        {/* ================= GRID ================= */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
          {loading && (
            <>
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="animate-pulse"
                >
                  <div className="aspect-[4/3] bg-gray-200 rounded-xl mb-3" />
                  <div className="h-3 bg-gray-200 rounded w-1/3 mb-2" />
                  <div className="h-4 bg-gray-300 rounded w-3/4 mb-2" />
                  <div className="h-3 bg-gray-200 rounded w-full" />
                </div>
              ))}
            </>
          )}

          {!loading && resources.map((r, i) => (
            <Link
              key={r._id || i}
              href={`/ressources/${r.slug || ""}`}
              className="group block cursor-pointer"
            >
              {/* IMAGE */}
              <div className="aspect-[4/3] rounded-xl overflow-hidden mb-3">
                <div
                  className="
                    w-full h-full bg-cover bg-center
                    group-hover:scale-105
                    transition-transform duration-500
                  "
                  style={{
                    backgroundImage: `url('${r.coverImage || "/images/resource-placeholder.jpg"}')`,
                  }}
                />
              </div>

              {/* META */}
              <span className="text-[10px] font-bold text-[#d8947c] uppercase tracking-widest">
                {r.category || r.tag || "Ressource"}
              </span>

              <h5 className="font-bold mt-1 group-hover:text-[#d8947c] transition-colors">
                {r.title}
              </h5>

              <p className="text-xs text-gray-500 mt-2">
                {r.description || r.meta}
              </p>
            </Link>
          ))}
        </div>

        {/* ================= LOAD MORE ================= */}
        <div className="flex justify-center py-10">
          <Link
            href="/ressources"
            className="px-8 h-12 flex items-center justify-center
                       rounded-full border-2 border-[#D0BB95]
                       text-[#D0BB95] font-bold
                       hover:bg-[#D0BB95] hover:text-white
                       transition"
          >
            Voir plus de ressources
          </Link>
        </div>
      </div>
    </section>
  );
}
