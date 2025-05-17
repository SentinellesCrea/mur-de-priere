"use client";
import { useEffect, useState } from "react";
import { fetchApi } from "@/lib/fetchApi";
import { toast } from "react-toastify";

const ExploreTab = () => {
  const [prayers, setPrayers] = useState([]);

  useEffect(() => {
    async function load() {
      try {
        const data = await fetchApi("/api/supervisor/prayers-to-reserve");
        setPrayers(data || []);
      } catch {
        toast.error("Erreur chargement des prières");
      }
    }
    load();
  }, []);

  const reserve = async (id) => {
    try {
      await fetchApi(`/api/supervisor/reserve/${id}`, { method: "PUT" });
      setPrayers((prev) => prev.filter((p) => p._id !== id));
      toast.success("Prière prise en charge !");
    } catch {
      toast.error("Erreur lors de la réservation");
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Prières disponibles</h2>
      {prayers.length === 0 ? (
        <p className="text-gray-500">Aucune prière disponible pour le moment.</p>
      ) : (
        prayers.map((p) => (
          <div key={p._id} className="border p-4 rounded mb-3 bg-white">
            <p><strong>{p.prenom}</strong> : {p.prayerRequest}</p>
            <button
              onClick={() => reserve(p._id)}
              className="mt-2 px-4 py-2 bg-brand text-white rounded hover:bg-brand-dark"
            >
              Je m'en occupe
            </button>
          </div>
        ))
      )}
    </div>
  );
};

export default ExploreTab;
