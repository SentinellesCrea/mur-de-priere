"use client";
import { useEffect, useState } from "react";
import { fetchApi } from "@/lib/fetchApi";
import { toast } from "react-toastify";

const TestimoniesModerationTab = () => {
  const [testimonies, setTestimonies] = useState([]);

  useEffect(() => {
    async function load() {
      try {
        const data = await fetchApi("/api/supervisor/moderate/testimonies");
        setTestimonies(data || []);
      } catch {
        toast.error("Erreur chargement témoignages");
      }
    }
    load();
  }, []);

  const moderate = async (id) => {
    try {
      await fetchApi(`/api/supervisor/moderate/testimonies/${id}`, { method: "PUT" });
      setTestimonies((prev) => prev.filter((t) => t._id !== id));
      toast.success("Témoignage validé");
    } catch {
      toast.error("Erreur validation");
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Témoignages à modérer</h2>
      {testimonies.length === 0 ? (
        <p className="text-gray-500">Aucun témoignage en attente.</p>
      ) : (
        testimonies.map((t) => (
          <div key={t._id} className="border p-4 rounded mb-3 bg-white">
            <p>{t.message}</p>
            <button
              onClick={() => moderate(t._id)}
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

export default TestimoniesModerationTab;
