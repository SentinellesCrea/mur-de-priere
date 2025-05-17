"use client";
import { useEffect, useState } from "react";
import { fetchApi } from "@/lib/fetchApi";
import { toast } from "react-toastify";

const PrayersModerationTab = () => {
  const [prayers, setPrayers] = useState([]);

  useEffect(() => {
    async function load() {
      try {
        const data = await fetchApi("/api/supervisor/moderate/prayers");
        setPrayers(data || []);
      } catch (err) {
        toast.error("Erreur chargement prières à modérer");
      }
    }
    load();
  }, []);

  const moderate = async (id) => {
    try {
      await fetchApi(`/api/supervisor/moderate/prayers/${id}`, { method: "PUT" });
      setPrayers((prev) => prev.filter((p) => p._id !== id));
      toast.success("Prière validée");
    } catch {
      toast.error("Erreur validation");
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Prières à modérer</h2>
      {prayers.length === 0 ? (
        <p className="text-gray-500">Aucune prière en attente.</p>
      ) : (
        prayers.map((p) => (
          <div key={p._id} className="border p-4 rounded mb-3 bg-white">
            <p><strong>{p.prenom}</strong> : {p.prayerRequest}</p>
            <button
              onClick={() => moderate(p._id)}
              className="mt-2 px-4 py-1 bg-green-600 text-white rounded"
            >
              Valider
            </button>
          </div>
        ))
      )}
    </div>
  );
};

export default PrayersModerationTab;
